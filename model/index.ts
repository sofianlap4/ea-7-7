// models/index.ts
import sequelize from "../utils/sequelizeInit";

import defineUserModel from "./user";
import definePackModel from "./pack";
import defineCourseModel from "./course";
import defineVideoModel from "./video";
import definePasswordResetToken from "./passwordResetToken";
import definePracticalExerciseModel from "./practicalExercise";
import definePracticalExerciseLogModel from "./practicalExerciseLog";
import defineLiveSessionModel from "./liveSession";
import defineLiveSessionLogModel from "./LiveSessionLog";
import defineCreditTransactionModel from "./creditTransaction";
import definePracticalExerciseSolutionModel from "./practicalExerciseSolution";
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

// Initialize models
const User = defineUserModel(sequelize);
const Pack = definePackModel(sequelize);
const Course = defineCourseModel(sequelize);
const Video = defineVideoModel(sequelize);
const PasswordResetToken = definePasswordResetToken(sequelize);
const PracticalExercise = definePracticalExerciseModel(sequelize);
const PracticalExerciseLog = definePracticalExerciseLogModel(sequelize);
const LiveSession = defineLiveSessionModel(sequelize);
const LiveSessionLog = defineLiveSessionLogModel(sequelize);
const CreditTransaction = defineCreditTransactionModel(sequelize);
const PracticalExerciseSolution = definePracticalExerciseSolutionModel(sequelize);
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
PracticalExerciseSolution.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(PracticalExerciseSolution, { foreignKey: "userId", as: "solutions" });

// Each solution belongs to one PracticalExercise
// Each PracticalExercise has many solutions
PracticalExerciseSolution.belongsTo(PracticalExercise, {
  foreignKey: "exerciseId",
  as: "exercise",
});
PracticalExercise.hasMany(PracticalExerciseSolution, { foreignKey: "exerciseId", as: "solutions" });

// Each Solution can have many likes
PracticalExerciseSolution.hasMany(SolutionLike, { foreignKey: "solutionId", as: "likesList" });
SolutionLike.belongsTo(PracticalExerciseSolution, { foreignKey: "solutionId", as: "solution" });

// Each Like belongs to a User
User.hasMany(SolutionLike, { foreignKey: "userId", as: "solutionLikes" });
SolutionLike.belongsTo(User, { foreignKey: "userId", as: "user" });

PracticalExerciseSolution.hasMany(SolutionComment, { foreignKey: "solutionId", as: "comments" });
SolutionComment.belongsTo(PracticalExerciseSolution, { foreignKey: "solutionId", as: "solution" });

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

// PracticalExercise <-> Pack (Many-to-Many)
PracticalExercise.belongsToMany(Pack, {
  through: "PackPracticalExercise",
  foreignKey: "practicalExerciseId",
  otherKey: "packId",
  as: "packs",
});
Pack.belongsToMany(PracticalExercise, {
  through: "PackPracticalExercise",
  foreignKey: "packId",
  otherKey: "practicalExerciseId",
  as: "practicalExercises",
});

// PracticalExercise <-> Theme (Many-to-Many)
PracticalExercise.belongsToMany(Theme, {
  through: "PracticalExerciseTheme",
  foreignKey: "practicalExerciseId",
  otherKey: "themeId",
  as: "themes",
});
Theme.belongsToMany(PracticalExercise, {
  through: "PracticalExerciseTheme",
  foreignKey: "themeId",
  otherKey: "practicalExerciseId",
  as: "practicalExercises",
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

// Export all models
export {
  sequelize,
  User,
  Pack,
  Course,
  Video,
  PasswordResetToken,
  PracticalExercise,
  PracticalExerciseLog,
  LiveSession,
  LiveSessionLog,
  CreditTransaction,
  PracticalExerciseSolution,
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
};
