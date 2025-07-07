import { NextFunction } from "express";
import { Op } from "sequelize";
import { Pack, UserPack } from "../model";
import { PACK_MIDDLEWARE_MESSAGES } from "../utils/responseMessages";

// Middleware to check if the user has an active pack subscription
export async function checkPackUsageLimits(req: any, res: any, next: NextFunction) {
  // Admins and superadmins have unlimited access
  if (req.user.role === "admin" || req.user.role === "superadmin") {
    return next();
  }

  try {
    // Find the user's active UserPack (subscription)
    const userPack = (await UserPack.findOne({
      where: {
        userId: req.user.id,
        isActive: true,
        endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
      },
      include: [{ model: Pack, as: "pack" }],
    })) as any;

    if (!userPack || !userPack.pack) {
      return res.status(403).json({ error: PACK_MIDDLEWARE_MESSAGES.NOT_SUBSCRIBED });
    }

    // Check if pack subscription is expired
    if (userPack.endDate && new Date() > new Date(userPack.endDate)) {
      return res
        .status(403)
        .json({
          error: PACK_MIDDLEWARE_MESSAGES.EXPIRED_ABONNEMENT,
        });
    }

    // Pass the pack info to the next middleware/route
    req.userPack = userPack;
    req.pack = userPack.pack;

    next();
  } catch (err) {
    console.error(`Error in checkPackUsageLimits for user ${req.user?.id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
}
