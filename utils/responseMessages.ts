export const VIDEO_RESPONSE_MESSAGES = {
  ONLY_VIMEO: "Seules les URL Vimeo sont autorisées.",
  COURSE_NOT_FOUND: "Cours introuvable.",
  VIDEO_NOT_FOUND: "Vidéo introuvable.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
};

export const PRACTICAL_EXERCICE_RESPONSE_MESSAGES = {
ONE_TEST_CASE: "Au moins un cas de test est requis.",
NOT_FOUND: "Exercice introuvable.",
ALREADY_SUBMITTED: "Vous avez déjà soumis cet exercice.",
CODE_REQUIRED: "Le code soumis est requis.",
UNSUPPORTED_LANGUAGE: "Langage non pris en charge pour l'évaluation.",
NO_EXERCISE_FOR_FILTERS: "Aucun exercice trouvé pour ces filtres.",
SUBMISSION_PASSED: "Soumission réussie",
SUBMISSION_FAILED: "Soumission échouée",

};

export const PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES = {
SOLUTION_NOT_FOUND: "Solution introuvable",
CANNOT_LIKE_OWN: "Vous ne pouvez pas aimer votre propre solution.",
ALREADY_LIKED: "Déjà aimé",
LIKE_NOT_FOUND: "Mention j'aime introuvable",
COMMENT_REQUIRED: "Commentaire requis",
COMMENT_NOT_FOUND: "Commentaire introuvable",
NOT_YOUR_COMMENT: "Ce commentaire ne vous appartient pas",
FAILED_TO_DELETE: "Échec de la suppression",
FAILED_TO_UPDATE: "Échec de la mise à jour",

};

export const PACK_RESPONSE_MESSAGES = {
PACK_OR_STUDENT_NOT_FOUND: "Pack ou étudiant introuvable.",
USER_OR_PACK_NOT_FOUND: "Utilisateur ou pack introuvable.",
ALREADY_SUBSCRIBED: "Vous êtes déjà abonné à un pack. Souscrire à un nouveau pack annulera le temps/crédit restant de votre pack actuel. Voulez-vous continuer ?",
NOT_ENOUGH_CREDIT: "Crédit insuffisant pour souscrire à ce pack.",
SUBSCRIBED_SUCCESS: "Souscription réussie !",
PACK_NOT_FOUND: "Pack introuvable.",
CANNOT_DELETE_WITH_STUDENTS: "Impossible de supprimer le pack : des étudiants y sont abonnés.",
NAME_REQUIRED: "Le nom est requis et doit être une chaîne de caractères.",
PRICE_INVALID: "Le prix doit être un nombre positif ou nul.",
TYPE_INVALID: "Type de pack invalide.",
DURATION_INVALID: "durationMonths doit être un nombre positif ou nul, ou null.",
CREDIT_AMOUNT_INVALID: "creditAmount doit être un nombre positif ou nul, ou null.",
MAX_USERS_INVALID: "maxUsers doit être un nombre positif ou nul, ou null.",
FEATURES_INVALID: "Les fonctionnalités doivent être un objet JSON.",

};
export const LIVE_SESSION_RESPONSE_MESSAGES = {
  USER_OR_CLASS_NOT_FOUND: "Utilisateur ou classe introuvable.",
  NO_JOIN_LOGS: "Aucun journal de participation trouvé pour cette session.",
  UNKNOWN_USER: "Utilisateur inconnu",
  SESSION_NOT_FOUND: "Session introuvable.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  JOINED_UNLIMITED: "Vous avez rejoint la session (accès illimité).",
  JOINED_DEDUCTED: "Vous ne pouvez pas annuler la participation. Votre session a été déduite.",
  SESSION_DELETED: "Session supprimée avec succès.",
  PACK_ID_REQUIRED: "Pack ID est requis pour une session en direct.",
  PACK_NOT_FOUND: "Pack introuvable pour cette session.",
  SESSION_NOT_IN_PACK: "Cette session ne fait pas partie de votre pack actif."
};

export const LEADERBOARD_RESPONSE_MESSAGES = {
  RANKING_NOT_FOUND: "Classement introuvable.",
};

export const CREDIT_RESPONSE_MESSAGES = {
  UNAUTHORIZED: "Non autorisé : utilisateur non authentifié.",
  NO_TRANSACTIONS: "Aucune transaction trouvée pour cet utilisateur.",
  STUDENT_ID_AMOUNT_REQUIRED: "studentId et montant requis.",
  STUDENT_NOT_FOUND: "Étudiant introuvable.",
};

export const COURSE_RESPONSE_MESSAGES = {
  ONLY_PDF: "Seuls les fichiers PDF sont autorisés.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  COURSE_NOT_FOUND: "Cours introuvable.",
  PACK_NOT_FOUND: "Pack introuvable.",
  INVALID_VIDEOS_FORMAT: "Format de vidéos invalide.",
  QUIZZ_NOT_FOUND: "Quiz introuvable.",
  QUIZZ_ALREADY_EXISTS: "Un quiz existe déjà pour ce cours.",
  QUIZZ_ALREADY_PASSED: "Vous avez déjà réussi ce quiz.",
  QUIZZ_SUCCESS: "Quiz réussi, +5 points ajoutés à votre classement !",
  QUESTION_NOT_FOUND: "Question introuvable.",
};

export const CLASSES_RESPONSE_MESSAGES = {
  CLASS_NOT_FOUND: "Classe introuvable.",
};

export const PROFILE_RESPONSE_MESSAGES = {
  USER_NOT_FOUND: "Utilisateur introuvable.",
  OLD_PASSWORD_INCORRECT: "Ancien mot de passe incorrect.",
  PASSWORD_INCORRECT: "Mot de passe incorrect.",
  PASSWORD_CHANGED: "Mot de passe modifié avec succès.",
  EMAIL_CHANGED: "Email modifié avec succès.",
};

export const AUTH_RESPONSE_MESSAGES = {
  LOGIN_SUCCESS: "Connexion réussie.",
  EMAIL_OR_PHONE_REQUIRED: "Email ou téléphone requis.",
  EMAIL_AND_CODE_REQUIRED: "Email et code requis.",
  EMAIL_OR_PHONE_AND_CODE_REQUIRED: "Email ou téléphone et code de récupération requis.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  INVALID_OR_EXPIRED_TOKEN: "Jeton invalide ou expiré.",
  PASSWORD_RESET: "Mot de passe réinitialisé.",
  INVALID_RESET_REQUEST: "Requête invalide. Fournissez un jeton valide ou un email/téléphone vérifié.",
  REGISTER_REQUIREMENTS:
    "Vous devez fournir un email, ou les 3 réponses de sécurité, ou un code de récupération.",
  USER_REGISTERED: "Utilisateur enregistré avec succès.",
  UNIQUE_CONSTRAINT: "Email ou téléphone déjà utilisé par un autre utilisateur.",
  INVALID_CREDENTIALS: "Identifiants invalides.",
  NO_REFRESH_TOKEN: "Aucun jeton de rafraîchissement fourni.",
  INVALID_REFRESH_TOKEN: "Jeton de rafraîchissement invalide.",
  RESET_EMAIL_SUBJECT: "Réinitialisation du mot de passe",
  RESET_EMAIL_TEXT: "Réinitialisez votre mot de passe",
  RESET_INSTRUCTIONS_SENT: (email: string) =>
    `Instructions de réinitialisation envoyées à votre adresse ${email}, veuillez vérifier votre boîte de réception.`,
  VERIFY_EMAIL_SUBJECT: "Vérifiez votre adresse email",
  VERIFICATION_EMAIL_SENT: "Email de vérification envoyé.",
  ALREADY_VERIFIED: "Déjà vérifié.",
  INVALID_VERIFICATION_CODE: "Code de vérification invalide.",
  EMAIL_VERIFIED: "Email vérifié avec succès.",
  NO_RECOVERY_OPTIONS: "Aucune option de récupération disponible pour cet utilisateur.",
  INVALID_RECOVERY_CODE: "Code de récupération incorrect.",
  RECOVERY_CODE_VALID: "Code de récupération correct.",
  PACK_TYPE_NOTFOUND: "Selected free pack not foundD",
  PACK_TYPE_REQUIRED: "Pack type is required",
};

export const RUNCODE_RESPONSE_MESSAGES = {
  CODE_TEST_CASES: "Corps de requête invalide. Requis : code et tableau de cas de test",
  PYTHON_CODE: "Script Python d'exécution introuvable",
  NOT_ALLOWED: (forbiddenFunctions: any) =>
    `Votre code utilise des fonctions interdites : ${forbiddenFunctions.join(", ")}`,
};

export const PACK_MIDDLEWARE_MESSAGES = {
  NOT_SUBSCRIBED: "Vous n’êtes abonné à aucun pack.",
  EXPIRED_ABONNEMENT: "Votre abonnement a expiré. Veuillez vous réabonner à un pack pour continuer.",
  PACK_NOT_FOUND: "Aucun pack trouvé pour cet utilisateur.",
};

export const THEME_RESPONSE_MESSAGES = {
  THEME_NOT_FOUND: "Thème introuvable.",
};