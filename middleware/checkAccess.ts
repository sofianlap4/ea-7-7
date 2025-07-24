import { Request, Response, NextFunction } from "express";
import { ModelStatic } from "sequelize";
import {CHECKACCESS_RESPONSE_MESSAGES} from "../utils/responseMessages";

export const checkPackAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Admins and superadmins have unlimited access
  if ((req as any).user?.role === "admin" || (req as any).user?.role === "superadmin") {
    next();
    return;
  }

  try {
    const { UserPack, Pack } = req.app.get("models") as {
      UserPack: ModelStatic<any>;
      Pack: ModelStatic<any>;
    };
    const userId = (req as any).user?.id;
    let packId = req.params.packId || req.body.packId || req.query.packId;

    let userPack: any = null;

    // If packId is not provided, get the most recent active UserPack for the user
    if (!packId && userId) {
      userPack = await UserPack.findOne({
        where: { userId, isActive: true },
        order: [['createdAt', 'DESC']],
        include: [{ model: Pack, as: "pack" }],
      });
      if (userPack) {
        packId = userPack.packId;
      }
    }

    // If packId is provided but userPack not found yet, search for active then fallback to any UserPack
    if (packId && !userPack) {
      userPack = await UserPack.findOne({
        where: { userId, packId, isActive: true },
        include: [{ model: Pack, as: "pack" }],
      });
      if (!userPack) {
        userPack = await UserPack.findOne({
          where: { userId, packId },
          include: [{ model: Pack, as: "pack" }],
        });
      }
    }

    if (!packId) {
      res.status(400).json({ error: CHECKACCESS_RESPONSE_MESSAGES.PACK_ID_NOT_FOUND });
      return;
    }

    if (userPack) {
      const paidPack = await Pack.findByPk(packId);

      if (paidPack && !paidPack.freeVersion) {
        if (userPack.endDate && new Date() > userPack.endDate) {
          if (userPack.isActive) {
            userPack.isActive = false;
            await userPack.save();
          }

          if (paidPack.freeVersionId) {
            let freeUserPack = await UserPack.findOne({
              where: { userId, packId: paidPack.freeVersionId },
              include: [{ model: Pack, as: "pack" }],
            });

            if (!freeUserPack) {
              freeUserPack = await UserPack.create({
                userId,
                packId: paidPack.freeVersionId,
                durationMonths: 0,
                price: 0,
                startDate: new Date(),
                endDate: null,
                isActive: true,
              });
            } else if (!freeUserPack.isActive) {
              freeUserPack.isActive = true;
              await freeUserPack.save();
            }
          }
        }
      }
    }

    // Final check: does the user have an active pack (paid or free) for this packId or its freeVersionId?
    const activePack = await UserPack.findOne({
      where: {
        userId,
        packId,
        isActive: true,
      },
      include: [{ model: Pack, as: "pack" }],
    });

    let hasAccess = !!activePack;
    if (!hasAccess) {
      const paidPack = await Pack.findByPk(packId);
      if (paidPack && paidPack.freeVersionId) {
        const activeFreePack = await UserPack.findOne({
          where: {
            userId,
            packId: paidPack.freeVersionId,
            isActive: true,
          },
          include: [{ model: Pack, as: "pack" }],
        });
        hasAccess = !!activeFreePack;
        if (hasAccess) {
          (req as any).userPack = activeFreePack;
          (req as any).pack = activeFreePack.pack;
        }
      }
    } else {
      (req as any).userPack = activePack;
      (req as any).pack = activePack.pack;
    }

    if (!hasAccess) {
      res.status(403).json({ error: CHECKACCESS_RESPONSE_MESSAGES.ACCESS_DENIED });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};
