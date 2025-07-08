import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';
import { PDF_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { uploadPdf } from "../utils/multerUpload";

const pdfRoutes = (): Router => {
  const router = express.Router();

  // Add a PDF to a course (with file upload)
  router.post(
    "/course/id/:courseId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    uploadPdf,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, type } = req.body;
        const { PDF, Course } = req.app.get("models");
        const course = await Course.findByPk(req.params.courseId);
        if (!course) return sendError(res, "Course not found", 404);

        if (!req.file) return sendError(res, "No PDF file uploaded", 400);

        // Build fileUrl (assuming static serving from /uploads/pdfs)
        const fileUrl = `${process.env.BACKEND_URL}/uploads/pdfs/${req.file.filename}`;

        const pdf = await PDF.create({
          title,
          fileUrl,
          type,
          courseId: course.id,
        });
        sendSuccess(res, pdf, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all PDFs for a course
  router.get(
    "/course/id/:courseId",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { PDF } = req.app.get("models");
        const pdfs = await PDF.findAll({
          where: { courseId: req.params.courseId },
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, pdfs, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Edit a PDF of a course
  router.put(
    "/course/id/:pdfId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, fileUrl, type } = req.body;
        const { PDF } = req.app.get("models");
        const pdf = await PDF.findByPk(req.params.pdfId);
        if (!pdf) return sendError(res, "PDF not found", 404);

        await pdf.update({ title, fileUrl, type });
        sendSuccess(res, pdf, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a PDF by ID (admins only)
  router.delete(
    "/course/id/:pdfId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { PDF } = req.app.get("models");
        const pdf = await PDF.findByPk(req.params.pdfId);
        if (!pdf) return sendError(res, "PDF not found", 404);

        await pdf.destroy();
        sendSuccess(res, { message: "PDF deleted" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};

export default pdfRoutes;