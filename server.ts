import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import {
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
  PDF,
  Exercise
} from "./model";
import sequelize from "./utils/sequelizeInit";

// Import routes
import authRoutes from "./routes/auth/auth";
import courseRoutes from "./routes/course";
import profileRoutes from "./routes/auth/profile";
import rankedExerciseRoutes from "./routes/practicalExercise";
import pythonRunner from "./routes/pythonRunner";
import javascriptRunner from "./routes/javascriptRunner";
import videoRoutes from "./routes/video";
import packRoutes from "./routes/pack";
import liveSessionRoutes from "./routes/liveSession";
import creditRoutes from "./routes/credit";
import solutionsRoutes from "./routes/practicalExercicesSolutions";
import leaderBoardRoutes from "./routes/leaderboard";
import sqlRunner from "./routes/sqlRunner";
import themeRoutes from "./routes/theme";
import userPackReductionRoutes from "./routes/userPackReduction";
import pdfRoutes from "./routes/pdf";
import exerciceRoutes from "./routes/exercice";

const PORT = 5000;

const app: Application = express();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make the models accessible globally (for use in routes)
app.set("models", {
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
    PDF,
  Exercise
});

// Routes (pass all needed models)
app.use("/api/auth", authRoutes());
app.use("/api/videos", videoRoutes());
app.use("/api/courses", courseRoutes());
app.use("/api/profile", profileRoutes());
app.use("/api/practical-exercises", rankedExerciseRoutes());
app.use("/api/python", pythonRunner);
app.use("/api/javascript", javascriptRunner);
app.use("/api/sql", sqlRunner);
app.use("/api/packs", packRoutes());
app.use("/api/live-sessions", liveSessionRoutes());
app.use("/api/credit", creditRoutes());
app.use("/api/solutions", solutionsRoutes());
app.use("/api/leaderboard", leaderBoardRoutes());
app.use("/api/themes", themeRoutes());
app.use("/api/user-pack-reductions", userPackReductionRoutes());
app.use("/api/pdfs", pdfRoutes());
app.use("/api/exercises", exerciceRoutes());

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  res.status(status).json({ success: false, error: err.message || "Internal Server Error" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

// Sync database and start server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connected.");
    app.listen(Number(PORT), () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error: Error) => console.error("Database connection failed:", error));
