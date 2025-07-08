// utils/rankUtils.ts
export function getRank(points: number): string {
  if (points >= 100) return "Hacker";
  if (points >= 50) return "Senior Dev";
  if (points >= 20) return "Mid Dev";
  return "Junior Dev";
}

export const rankingPoints = {
    QuizzQuestionPassed: 5,
    codeSolved: 15,
    liveSessionAttended: 10,
    weekChallenger: 20,
    monthChallenger: 50,
    weekdefi: 10,
}