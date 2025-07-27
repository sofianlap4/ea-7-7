// utils/rankUtils.ts
export function getRank(points: number): string {
if (points >= 1000) return "Hacker";
if (points >= 400) return "Senior Dev";
if (points >= 150) return "Mid Dev";
return "Junior Dev";
}
export const rankingPoints = {
  QuizzQuestionPassed: 1,         // 200 questions = 200 pts max
  codeSolvedEasy: 5,              // 30 easy = 150 pts
  codeSolvedMedium: 15,           // 40 medium = 600 pts
  codeSolvedHard: 30,             // 30 hard = 900 pts
  weekdefi: 20,                   // Optional weekly challenge
  monthChallenger: 100            // Elite challenge
};