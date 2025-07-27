// models/index.ts
import sequelize from "../utils/sequelizeInit";

import defineUserModel from "./user";
import definePackModel from "./pack";
import defineCourseModel from "./course";
import defineVideoModel from "./video";
import definePasswordResetToken from "./passwordResetToken";
import definePracticalexerciceModel from "./practicalexercice";
import definePracticalexerciceLogModel from "./practicalexerciceLog";
import defineLiveSessionModel from "./liveSession";
import defineLiveSessionLogModel from "./LiveSessionLog";
import defineCreditTransactionModel from "./creditTransaction";
import definePracticalexerciceSolutionModel from "./practicalexerciceSolution";
import defineSolutionCommentModel from "./solutionComment";
import defineSolutionLikeModel from "./solutionLike";
import defineRankingModel from "./ranking";
import defineQuizzModel from "./quizz";
import defineQuizzQuestionModel from "./quizzQuestion";
import defineQuizzSubmissionModel from "./quizzSubmission";
import defineUserPackModel from "./userPack";
import defineThemeModel from "./theme";
import definePackOfferModel from "./packOffer";
import defineUserPackReductionModel from "./userPackReduction";
import defineReductionCodeModel from "./reductionCode";
import definePDFModel from "./pdf";
import defineExerciceModel from "./exercice";
import defineUserQuizzProgressModel from "./userQuizzProgress";
import defineRefreshTokenModel from "./refreshToken";
import defineRankingPointLogModel from "./rankingPointLog";
import defineUserCourseProgressModel from "./userCourseProgress";

// Initialize models
const User = defineUserModel(sequelize);
const Pack = definePackModel(sequelize);
const Course = defineCourseModel(sequelize);
const Video = defineVideoModel(sequelize);
const PasswordResetToken = definePasswordResetToken(sequelize);
const Practicalexercice = definePracticalexerciceModel(sequelize);
const PracticalexerciceLog = definePracticalexerciceLogModel(sequelize);
const LiveSession = defineLiveSessionModel(sequelize);
const LiveSessionLog = defineLiveSessionLogModel(sequelize);
const CreditTransaction = defineCreditTransactionModel(sequelize);
const PracticalexerciceSolution = definePracticalexerciceSolutionModel(sequelize);
const SolutionComment = defineSolutionCommentModel(sequelize);
const SolutionLike = defineSolutionLikeModel(sequelize);
const Ranking = defineRankingModel(sequelize);
const Quizz = defineQuizzModel(sequelize);
const QuizzQuestion = defineQuizzQuestionModel(sequelize);
const QuizzSubmission = defineQuizzSubmissionModel(sequelize);
const UserPack = defineUserPackModel(sequelize);
const Theme = defineThemeModel(sequelize);
const PackOffer = definePackOfferModel(sequelize);
const UserPackReduction = defineUserPackReductionModel(sequelize);
const ReductionCode = defineReductionCodeModel(sequelize);
const PDF = definePDFModel(sequelize);
const Exercice = defineExerciceModel(sequelize);
const UserQuizzProgress = defineUserQuizzProgressModel(sequelize);
const RefreshToken = defineRefreshTokenModel(sequelize);
// User <-> RefreshToken (One-to-Many)
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
const RankingPointLog = defineRankingPointLogModel(sequelize);
const UserCourseProgress = defineUserCourseProgressModel(sequelize);

// --- Associations for UserQuizzProgress ---
User.hasMany(UserQuizzProgress, { foreignKey: "userId", as: "quizzProgress" });
UserQuizzProgress.belongsTo(User, { foreignKey: "userId", as: "user" });

Quizz.hasMany(UserQuizzProgress, { foreignKey: "quizzId", as: "userProgress" });
UserQuizzProgress.belongsTo(Quizz, { foreignKey: "quizzId", as: "quizz" });

// Associations
Course.hasMany(Video, { as: "videos", foreignKey: "courseId" });
Video.belongsTo(Course, { foreignKey: "courseId" });

User.belongsTo(Pack, { foreignKey: "packId", as: "pack" });
Pack.hasMany(User, { foreignKey: "packId", as: "students" });

Pack.belongsToMany(Course, {
  through: "CoursePack", // Name of your join table
  foreignKey: "packId",
  otherKey: "courseId",
  as: "courses", // optional alias
});

Course.belongsToMany(Pack, {
  through: "CoursePack",
  foreignKey: "courseId",
  otherKey: "packId",
  as: "packs", // optional alias
});

// Course <-> PDF (One-to-Many)
Course.hasMany(PDF, { as: "pdfs", foreignKey: "courseId" });
PDF.belongsTo(Course, { foreignKey: "courseId", as: "course" });


// exercice <-> PDF (One-to-Many)
Exercice.hasMany(PDF, { as: "pdfs", foreignKey: "exerciceId" });
PDF.belongsTo(Exercice, { foreignKey: "exerciceId", as: "exercice" });

// exercice <-> Video (One-to-Many)
Exercice.hasMany(Video, { as: "videos", foreignKey: "exerciceId" });
Video.belongsTo(Exercice, { foreignKey: "exerciceId", as: "exercice" });

// In your model/index.ts or wherever you define associations:
User.hasMany(LiveSessionLog, { foreignKey: "userId" });
LiveSession.hasMany(LiveSessionLog, { foreignKey: "liveSessionId" });
LiveSessionLog.belongsTo(User, { foreignKey: "userId" });
LiveSessionLog.belongsTo(LiveSession, { foreignKey: "liveSessionId" });

Pack.hasMany(LiveSession, { foreignKey: "packId", as: "liveSessions" });
LiveSession.belongsTo(Pack, { foreignKey: "packId", as: "pack" });

// CreditTransaction associations
User.hasMany(CreditTransaction, { foreignKey: "userId" });
CreditTransaction.belongsTo(User, { foreignKey: "userId" });
CreditTransaction.belongsTo(Pack, { as: "pack", foreignKey: "packId" });
Pack.hasMany(CreditTransaction, { as: "transactions", foreignKey: "packId" });

// Each solution belongs to a user
PracticalexerciceSolution.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(PracticalexerciceSolution, { foreignKey: "userId", as: "solutions" });

// Each solution belongs to one Practicalexercice
// Each Practicalexercice has many solutions
PracticalexerciceSolution.belongsTo(Practicalexercice, {
  foreignKey: "exerciceId",
  as: "exercice",
});
Practicalexercice.hasMany(PracticalexerciceSolution, { foreignKey: "exerciceId", as: "solutions" });

// Each Solution can have many likes
PracticalexerciceSolution.hasMany(SolutionLike, { foreignKey: "solutionId", as: "likesList" });
SolutionLike.belongsTo(PracticalexerciceSolution, { foreignKey: "solutionId", as: "solution" });

// Each Like belongs to a User
User.hasMany(SolutionLike, { foreignKey: "userId", as: "solutionLikes" });
SolutionLike.belongsTo(User, { foreignKey: "userId", as: "user" });

PracticalexerciceSolution.hasMany(SolutionComment, { foreignKey: "solutionId", as: "comments" });
SolutionComment.belongsTo(PracticalexerciceSolution, { foreignKey: "solutionId", as: "solution" });

// Each Comment belongs to a User
User.hasMany(SolutionComment, { foreignKey: "userId", as: "solutionComments" });
SolutionComment.belongsTo(User, { foreignKey: "userId", as: "user" });

// model/index.ts
Ranking.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Ranking, { foreignKey: "userId", as: "ranking" });

Quizz.hasMany(QuizzQuestion, { foreignKey: "quizzId", as: "questions" });
QuizzQuestion.belongsTo(Quizz, { foreignKey: "quizzId", as: "quizz" });

Course.hasOne(Quizz, { foreignKey: "courseId", as: "quizz" });
Quizz.belongsTo(Course, { foreignKey: "courseId", as: "course" });

UserPack.belongsTo(Pack, { as: "pack", foreignKey: "packId" });
Pack.hasMany(UserPack, { as: "userPacks", foreignKey: "packId" });

// UserPack belongs to User
UserPack.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(UserPack, { foreignKey: "userId", as: "userPacks" });

// UserPack belongs to PackOffer (the offer the user bought)
UserPack.belongsTo(PackOffer, { foreignKey: "offerId", as: "offer" });
PackOffer.hasMany(UserPack, { foreignKey: "offerId", as: "userPacks" });

// Practicalexercice <-> Pack (Many-to-Many)
Practicalexercice.belongsToMany(Pack, {
  through: "PackPracticalexercice",
  foreignKey: "practicalexerciceId",
  otherKey: "packId",
  as: "packs",
});
Pack.belongsToMany(Practicalexercice, {
  through: "PackPracticalexercice",
  foreignKey: "packId",
  otherKey: "practicalexerciceId",
  as: "practicalexercices",
});

// Practicalexercice <-> Theme (Many-to-Many)
Practicalexercice.belongsToMany(Theme, {
  through: "PracticalexerciceTheme",
  foreignKey: "practicalexerciceId",
  otherKey: "themeId",
  as: "themes",
});
Theme.belongsToMany(Practicalexercice, {
  through: "PracticalexerciceTheme",
  foreignKey: "themeId",
  otherKey: "practicalexerciceId",
  as: "practicalexercices",
});

// Theme <-> Pack (Many-to-Many)
Theme.belongsToMany(Pack, {
  through: "PackTheme",
  foreignKey: "themeId",
  otherKey: "packId",
  as: "packs",
});
Pack.belongsToMany(Theme, {
  through: "PackTheme",
  foreignKey: "packId",
  otherKey: "themeId",
  as: "themes",
});

// Pack has many PackOffers
Pack.hasMany(PackOffer, { foreignKey: "packId", as: "offers" });
PackOffer.belongsTo(Pack, { foreignKey: "packId", as: "pack" });

// In your models/index.ts or equivalent
ReductionCode.belongsToMany(PackOffer, {
  through: "PackOfferReductionCode",
  as: "offers",
  foreignKey: "reductionCodeId",
  otherKey: "packOfferId",
});
PackOffer.belongsToMany(ReductionCode, {
  through: "PackOfferReductionCode",
  as: "reductionCodes",
  foreignKey: "packOfferId",
  otherKey: "reductionCodeId",
});

// UserPack can have one UserPackReduction
UserPack.hasOne(UserPackReduction, { foreignKey: "userPackId", as: "reduction" });
UserPackReduction.belongsTo(UserPack, { foreignKey: "userPackId", as: "userPack" });

// ReductionCode can have many UserPackReductions
ReductionCode.hasMany(UserPackReduction, { foreignKey: "reductionCodeId", as: "usages" });
UserPackReduction.belongsTo(ReductionCode, { foreignKey: "reductionCodeId", as: "reductionCode" });

// ...after importing and initializing models...

Ranking.hasMany(RankingPointLog, { foreignKey: "rankingId", as: "pointLogs" });
RankingPointLog.belongsTo(Ranking, { foreignKey: "rankingId", as: "ranking" });

User.hasMany(RankingPointLog, { foreignKey: "userId", as: "rankingPointLogs" });
RankingPointLog.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserCourseProgress, { foreignKey: "userId", as: "courseProgress" });
Course.hasMany(UserCourseProgress, { foreignKey: "courseId", as: "userProgress" });
UserCourseProgress.belongsTo(User, { foreignKey: "userId", as: "user" });
UserCourseProgress.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// exercice <-> Pack (Many-to-Many)
Exercice.belongsToMany(Pack, {
  through: "Packexercice",
  foreignKey: "exerciceId",
  otherKey: "packId",
  as: "packs",
});
Pack.belongsToMany(Exercice, {
  through: "Packexercice",
  foreignKey: "packId",
  otherKey: "exerciceId",
  as: "exercices",
});

// exercice <-> Theme (Many-to-Many)
Exercice.belongsToMany(Theme, {
  through: "exerciceTheme",
  foreignKey: "exerciceId",
  otherKey: "themeId",
  as: "themes",
});
Theme.belongsToMany(Exercice, {
  through: "exerciceTheme",
  foreignKey: "themeId",
  otherKey: "exerciceId",
  as: "exercices",
});

// Export all models
export {
  sequelize,
  User,
  Pack,
  Course,
  Video,
  PasswordResetToken,
  Practicalexercice,
  PracticalexerciceLog,
  LiveSession,
  LiveSessionLog,
  CreditTransaction,
  PracticalexerciceSolution,
  SolutionComment,
  SolutionLike,
  Ranking,
  Quizz,
  QuizzQuestion,
  QuizzSubmission,
  UserPack,
  Theme,
  PackOffer,
  UserPackReduction,
  ReductionCode,
  PDF,
  Exercice,
  UserQuizzProgress,
  RankingPointLog,
  UserCourseProgress,
  RefreshToken
};
