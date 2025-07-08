import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';
import { VIDEO_RESPONSE_MESSAGES } from "../utils/responseMessages";

const videoRoutes = (): Router => {
  const router = express.Router();

  // Add a video to a course (/admins only, Vimeo only)
  router.post(
    '/',
    authenticateToken,
    authorizeRoles( 'admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, url, courseId, free } = req.body;
        if (!url || !url.includes('vimeo.com')) {
          return sendError(res, VIDEO_RESPONSE_MESSAGES.ONLY_VIMEO);
        }
        // Vérifie que le cours existe
        const course = await req.app.get("models").Course.findByPk(courseId);
        if (!course) {
          return sendError(res, VIDEO_RESPONSE_MESSAGES.COURSE_NOT_FOUND);
        }
        const video = await req.app.get("models").Video.create({ title, url, courseId, free: !!free });
        sendSuccess(res, video, 201);
      } catch (err: any) {
        next(err)
      }
    }
  );

  // Get all videos for a course
  router.get(
    '/course/id/:courseId',
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const videos = await req.app.get("models").Video.findAll({ where: { courseId: req.params.courseId } });
        sendSuccess(res, videos, 201);
      } catch (err: any) {
        next(err)
      }
    }
  );

  // Delete a video by ID (admins only)
  router.delete(
    '/id/:videoId',
    authenticateToken,
    authorizeRoles( 'admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { videoId } = req.params;
        const { Video } = req.app.get("models");
        const deleted = await Video.destroy({ where: { id: videoId } });
        
        if (!deleted) return sendError(res, VIDEO_RESPONSE_MESSAGES.VIDEO_NOT_FOUND, 404);
        sendSuccess(res, deleted, 201);
      } catch (err: any) {
        next(err)
      }
    }
  );

  router.put(
    '/id/:videoId',
    authenticateToken,
    authorizeRoles( 'admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { videoId } = req.params;
        const { title, url, free } = req.body;

        const video = await req.app.get("models").Video.findByPk(videoId);
        if (!video) return sendError(res, VIDEO_RESPONSE_MESSAGES.VIDEO_NOT_FOUND, 404);

        // Update video details
        video.title = title;
        video.url = url;
        video.free = !!free;
        await video.save();

        sendSuccess(res, video);
      } catch (err: any) {
        next(err)
      }
    }
  );

  return router;
};

export default videoRoutes;