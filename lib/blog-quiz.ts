export type QuizQuestionWithAnswer = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export type QuizModuleWithAnswers = {
  type: "quiz_giveaway";
  quizId: string;
  rewardText: string;
  minScoreToWin: number;
  questions: QuizQuestionWithAnswer[];
};

export type PublicQuizQuestion = Pick<QuizQuestionWithAnswer, "question" | "options">;

function isQuizModule(value: unknown): value is QuizModuleWithAnswers {
  if (!value || typeof value !== "object") return false;
  const module = value as Record<string, unknown>;
  if (module.type !== "quiz_giveaway" || typeof module.quizId !== "string") return false;
  if (typeof module.rewardText !== "string" || !module.rewardText.trim()) return false;
  if (typeof module.minScoreToWin !== "number" || !Number.isInteger(module.minScoreToWin) || module.minScoreToWin < 0 || module.minScoreToWin > 100) return false;
  if (!Array.isArray(module.questions) || module.questions.length < 1 || module.questions.length > 20) return false;

  return module.questions.every((question) => {
    if (!question || typeof question !== "object") return false;
    const item = question as Record<string, unknown>;
    return typeof item.question === "string"
      && item.question.trim().length > 0
      && Array.isArray(item.options)
      && item.options.length === 4
      && item.options.every((option) => typeof option === "string" && option.trim().length > 0)
      && new Set((item.options as string[]).map((option) => option.trim().toLocaleLowerCase("id-ID"))).size === 4
      && typeof item.correctAnswerIndex === "number"
      && Number.isInteger(item.correctAnswerIndex)
      && item.correctAnswerIndex >= 0
      && item.correctAnswerIndex < 4;
  });
}

export function findQuizModule(modules: unknown, quizId: string): QuizModuleWithAnswers | null {
  if (!Array.isArray(modules)) return null;
  const module = modules.find((candidate) => isQuizModule(candidate) && candidate.quizId === quizId);
  return module && isQuizModule(module) ? module : null;
}

export function gradeQuizAnswers(module: QuizModuleWithAnswers, answers: unknown): { score: number; passed: boolean } | null {
  if (!Array.isArray(answers) || answers.length !== module.questions.length) return null;
  if (!answers.every((answer) => typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < 4)) return null;

  const correctCount = module.questions.reduce(
    (count, question, index) => count + (answers[index] === question.correctAnswerIndex ? 1 : 0),
    0,
  );
  const score = Math.round((correctCount / module.questions.length) * 100);
  return { score, passed: score >= module.minScoreToWin };
}

export function redactQuizAnswerKeys(modules: unknown): unknown[] {
  if (!Array.isArray(modules)) return [];
  return modules.map((module) => {
    if (!module || typeof module !== "object") return module;
    const item = module as Record<string, unknown>;
    if (item.type !== "quiz_giveaway" || !Array.isArray(item.questions)) return module;

    return {
      ...item,
      questions: item.questions.map((question) => {
        if (!question || typeof question !== "object") return question;
        const { correctAnswerIndex: _correctAnswerIndex, ...publicQuestion } = question as Record<string, unknown>;
        return publicQuestion;
      }),
    };
  });
}

export function getGiveawayModuleValidationError(modules: unknown): string | null {
  if (!Array.isArray(modules)) return null;

  for (const module of modules) {
    if (!module || typeof module !== "object" || (module as Record<string, unknown>).type !== "quiz_giveaway") continue;
    if (!isQuizModule(module)) {
      const value = module as Record<string, unknown>;
      if (typeof value.rewardText !== "string" || !value.rewardText.trim()) {
        return "Isi hadiah giveaway dengan hadiah yang benar-benar tersedia sebelum menerbitkan artikel.";
      }
      return "Lengkapi kuis giveaway: minimal satu soal, empat opsi unik, dan satu jawaban benar per soal.";
    }
  }

  return null;
}
