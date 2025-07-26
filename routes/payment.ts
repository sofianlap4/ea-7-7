import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sequelize from "../utils/sequelizeInit";

dotenv.config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/transfer-proofs'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const KONNECT_API_URL = 'https://api.sandbox.konnect.network/api/v2/payments';
const KONNECT_API_KEY = process.env.KONNECT_API_KEY;

const paymentRoutes = (): Router => {
  const router = express.Router();

  // Initialize payment for credit purchase
  router.post('/init', authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { User, CreditTransaction } = req.app.get("models");
      const { amount } = req.body; // Amount in TND

      if (!amount || amount <= 0) {
        return sendError(res, 'Invalid amount', 400);
      }

      // Get user details
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Create a pending credit transaction
      const creditTransaction = await CreditTransaction.create({
        userId: user.id,
        amount: amount,
        type: 'purchase_bank',
        status: 'pending'
      });

      // Calculate amount in millimes
      const amountMillimes = Math.round(amount * 1000);

      // Prepare payment request
      const paymentData = {
        receiverWalletId: process.env.KONNECT_WALLET_ID,
        token: "TND",
        amount: amountMillimes,
        type: "immediate",
        description: `Recharge de crédit: ${amount} TND`,
        acceptedPaymentMethods: ["bank_card", "e-DINAR"],
        lifespan: 10, // 10 minutes
        checkoutForm: true,
        addPaymentFeesToAmount: true,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phone || '',
        email: user.email,
        orderId: `${user.id}-credit-${creditTransaction.id}-${Date.now()}`,
        webhook: `${process.env.API_URL}/api/payment/webhook`,
        theme: "light"
      };

      // Initialize payment with Konnect
      const response = await axios.post(
        `${KONNECT_API_URL}/init-payment`,
        paymentData,
        {
          headers: {
            'x-api-key': KONNECT_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update credit transaction with orderId
      creditTransaction.orderId = paymentData.orderId;
      await creditTransaction.save();

      // Return payment URL to client
      sendSuccess(res, {
        paymentUrl: response.data.payUrl,
        orderId: paymentData.orderId,
        transactionId: creditTransaction.id
      });

    } catch (err: any) {
      console.error('Payment initialization error:', err);
      next(err);
    }
  });

  // Webhook for payment notification
  router.post('/webhook', async (req: any, res: any, next: NextFunction) => {
    const sequelize = req.app.get("sequelize");
    const transaction = await sequelize.transaction();

    try {
      const { orderId, state, transactionId } = req.body;

      // Verify payment authenticity (you should implement proper verification)
      // TODO: Implement signature verification

      const { CreditTransaction, User } = req.app.get("models");
      const creditTransaction = await CreditTransaction.findOne({
        where: { orderId },
        transaction
      });

      if (!creditTransaction) {
        await transaction.rollback();
        return sendError(res, 'Credit transaction not found', 404);
      }

      // Update credit transaction status
      creditTransaction.status = state === 'completed' ? 'approved' :
        state === 'failed' ? 'rejected' :
          'pending';
      creditTransaction.transactionId = transactionId;
      await creditTransaction.save({ transaction });

      // If payment is successful, update user's credit
      if (state === 'completed') {
        const user = await User.findByPk(creditTransaction.userId, { transaction });
        if (!user) {
          await transaction.rollback();
          return sendError(res, 'User not found', 404);
        }

        // Update user's credit
        user.credit = user.credit + creditTransaction.amount;
        await user.save({ transaction });
      }

      await transaction.commit();
      sendSuccess(res, { success: true });
    } catch (err: any) {
      console.error('Webhook handling error:', err);
      next(err);
    }
  });

  // Get credit transaction status
  router.get('/status/:orderId', authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { CreditTransaction } = req.app.get("models");
      const transaction = await CreditTransaction.findOne({
        where: {
          orderId: req.params.orderId,
          userId: req.user.id
        }
      });

      if (!transaction) {
        return sendError(res, 'Credit transaction not found', 404);
      }

      sendSuccess(res, {
        status: transaction.status,
        amount: transaction.amount,
        type: transaction.type
      });
    } catch (err: any) {
      next(err);
    }
  });

  // Upload bank transfer proof
  router.post('/bank-transfer', authenticateToken, upload.single('proofFile'), async (req: any, res: any, next: NextFunction) => {
    if (!sequelize) {
      return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();
    if (!transaction) {
      return sendError(res, 'Failed to start database transaction', 500);
    }

    try {
      const { User, CreditTransaction } = req.app.get("models");
      const { amount, transferDate } = req.body;

      if (!req.file) {
        return sendError(res, 'Proof file is required', 400);
      }

      if (!amount || amount <= 0) {
        return sendError(res, 'Invalid amount', 400);
      }

      // Get user details
      const user = await User.findByPk(req.user.id, { transaction });
      if (!user) {
        await transaction.rollback();
        return sendError(res, 'User not found', 404);
      }

      // Create a pending credit transaction for bank transfer
      const creditTransaction = await CreditTransaction.create({
        userId: user.id,
        amount: parseFloat(amount),
        type: 'bank_transfer',
        status: 'pending',
        attachmentUrl: `/transfer-proofs/${req.file.filename}`,
        transferDate: transferDate || new Date(),
        orderId: `BT-${user.id}-${Date.now()}`,
      }, { transaction });

      await transaction.commit();

      sendSuccess(res, {
        message: 'Bank transfer proof uploaded successfully',
        transactionId: creditTransaction.id,
        status: 'pending'
      });

    } catch (err: any) {
      if (transaction) await transaction.rollback();
      console.error('Bank transfer proof upload error:', err);
      next(err);
    }
  });

  // Admin Routes

  // Get all pending bank transfers
  router.get('/admin/bank-transfers', authenticateToken, authorizeRoles("admin", "superadmin"), async (req: any, res: any, next: NextFunction) => {
    try {
      const { CreditTransaction, User } = req.app.get("models");
      const status = req.query.status || 'pending'; // Filter by status, default to pending

      const transactions = await CreditTransaction.findAll({
        where: {
          type: 'bank_transfer',
          status: status
        },
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      sendSuccess(res, { transactions });
    } catch (err: any) {
      next(err);
    }
  });

  // Get specific bank transfer details
  router.get('/admin/bank-transfers/:id', authenticateToken, authorizeRoles("admin", "superadmin"), async (req: any, res: any, next: NextFunction) => {
    try {
      const { CreditTransaction, User } = req.app.get("models");
      const transaction = await CreditTransaction.findOne({
        where: {
          id: req.params.id,
          type: 'bank_transfer'
        },
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'credit']
        }]
      });

      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }

      sendSuccess(res, { transaction });
    } catch (err: any) {
      next(err);
    }
  });

  // Approve or reject bank transfer
  router.post('/admin/bank-transfers/:id/verify', authenticateToken, authorizeRoles("admin", "superadmin"), async (req: any, res: any, next: NextFunction) => {
    const sequelize = req.app.get("sequelize");
    const transaction = await sequelize.transaction();

    try {
      const { CreditTransaction, User } = req.app.get("models");
      const { status, adminNote } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return sendError(res, 'Invalid status. Must be "approved" or "rejected"', 400);
      }

      const creditTransaction = await CreditTransaction.findOne({
        where: {
          id: req.params.id,
          type: 'bank_transfer',
          status: 'pending'
        },
        include: [{
          model: User
        }],
        transaction
      });

      if (!creditTransaction) {
        await transaction.rollback();
        return sendError(res, 'Transaction not found or already processed', 404);
      }

      // Update transaction status
      creditTransaction.status = status;
      creditTransaction.adminNote = adminNote;
      creditTransaction.verifiedBy = req.user.id;
      creditTransaction.verifiedAt = new Date();
      await creditTransaction.save({ transaction });

      // If approved, update user's credit
      if (status === 'approved') {
        const user = await User.findByPk(creditTransaction.userId, { transaction });
        if (!user) {
          await transaction.rollback();
          return sendError(res, 'User not found', 404);
        }

        user.credit = user.credit + creditTransaction.amount;
        await user.save({ transaction });
      }

      await transaction.commit();

      sendSuccess(res, {
        message: `Bank transfer ${status}`,
        transaction: creditTransaction
      });

    } catch (err: any) {
      await transaction.rollback();
      console.error('Bank transfer verification error:', err);
      next(err);
    }
  });

  return router;
};

export default paymentRoutes;
