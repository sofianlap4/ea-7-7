import fetchWithAuth from '../utils/fetchWithAuth';

interface InitPaymentResponse {
  paymentUrl: string;
  orderId: string;
  transactionId: number;
}

interface CreditTransactionStatus {
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  type: string;
}

interface BankTransferResponse {
  message: string;
  transactionId: number;
  status: 'pending';
}

interface AdminBankTransfer {
  id: number;
  userId: number;
  amount: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  attachmentUrl: string;
  transferDate: string;
  orderId: string;
  adminNote?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    credit?: number;
  };
}

/**
 * Initialize a payment for credit purchase
 * @param amount - Amount in TND to purchase
 * @returns Payment URL and transaction details
 */
export const initCreditPurchase = async (amount: number): Promise<InitPaymentResponse> => {
  const response = await fetchWithAuth('/api/payment/init', {
    method: 'POST',
    body: JSON.stringify({ amount }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to initialize payment');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get the status of a credit transaction
 * @param orderId - The order ID of the transaction
 * @returns Transaction status details
 */
export const getCreditTransactionStatus = async (orderId: string): Promise<CreditTransactionStatus> => {
  const response = await fetchWithAuth(`/api/payment/status/${orderId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get transaction status');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Upload bank transfer proof
 * @param formData - FormData containing proofFile, amount, and optional transferDate
 * @returns Transaction details
 */
export const uploadBankTransferProof = async (formData: FormData): Promise<BankTransferResponse> => {
  const response = await fetchWithAuth('/api/payment/bank-transfer', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let the browser set it with the correct boundary
  });

  if (!response.ok) {
    throw new Error('Failed to upload bank transfer proof');
  }

  const data = await response.json();
  return data.data;
};

// Admin API calls

/**
 * Get all bank transfers with optional status filter
 * @param status - Filter by status (pending, approved, rejected)
 * @returns List of bank transfers
 */
export const getAdminBankTransfers = async (status?: string): Promise<AdminBankTransfer[]> => {
  const url = status 
    ? `/api/payment/admin/bank-transfers?status=${status}`
    : '/api/payment/admin/bank-transfers';

  const response = await fetchWithAuth(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get bank transfers');
  }

  const data = await response.json();
  return data.data.transactions;
};

/**
 * Get specific bank transfer details
 * @param id - Transaction ID
 * @returns Bank transfer details
 */
export const getAdminBankTransferDetails = async (id: number): Promise<AdminBankTransfer> => {
  const response = await fetchWithAuth(`/api/payment/admin/bank-transfers/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get bank transfer details');
  }

  const data = await response.json();
  return data.data.transaction;
};

/**
 * Verify (approve/reject) a bank transfer
 * @param id - Transaction ID
 * @param status - 'approved' or 'rejected'
 * @param adminNote - Optional note explaining the decision
 * @returns Updated transaction
 */
export const verifyBankTransfer = async (
  id: number, 
  status: 'approved' | 'rejected', 
  adminNote?: string
): Promise<AdminBankTransfer> => {
  const response = await fetchWithAuth(`/api/payment/admin/bank-transfers/${id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, adminNote }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify bank transfer');
  }

  const data = await response.json();
  return data.data.transaction;
};