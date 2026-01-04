import type {
  Exercise,
  ExerciseSubmission,
  ExerciseResult,
  FillInTheBlankExercise,
  CodeCompletionExercise,
  MultipleChoiceExercise,
} from "./types";

export function validateExerciseSubmission(
  exercise: Exercise,
  submission: ExerciseSubmission
): ExerciseResult {
  switch (exercise.type) {
    case "fill-in-the-blank":
      return validateFillInTheBlank(
        exercise,
        submission
      );
    case "code-completion":
      return validateCodeCompletion(exercise, submission);
    case "multiple-choice":
      return validateMultipleChoice(exercise, submission);
  }
}

function validateFillInTheBlank(
  exercise: FillInTheBlankExercise,
  submission: ExerciseSubmission
): ExerciseResult {
  let correctCount = 0;
  const correctAnswers: Record<string, string> = {};
  const feedback: string[] = [];

  for (const blank of exercise.blanks) {
    const userAnswer = submission.answers[blank.id]?.trim().toLowerCase();
    const correctAnswer = blank.correctAnswer.trim().toLowerCase();

    correctAnswers[blank.id] = blank.correctAnswer;

    if (userAnswer === correctAnswer) {
      correctCount++;
      feedback.push(`✓ Blank "${blank.id}" is correct`);
    } else {
      feedback.push(
        `✗ Blank "${blank.id}" is incorrect. Expected: ${blank.correctAnswer}`
      );
    }
  }

  const score = Math.round((correctCount / exercise.blanks.length) * 100);
  const correct = correctCount === exercise.blanks.length;

  return {
    correct,
    score,
    feedback: feedback.join("\n"),
    correctAnswers,
  };
}

function validateCodeCompletion(
  exercise: CodeCompletionExercise,
  submission: ExerciseSubmission
): ExerciseResult {
  let correctCount = 0;
  const correctAnswers: Record<string, string> = {};
  const feedback: string[] = [];

  for (const completion of exercise.completions) {
    const key = `${completion.line}_${completion.column}`;
    const userAnswer = submission.answers[key]?.trim();
    const correctAnswer = completion.correctAnswer.trim();

    correctAnswers[key] = correctAnswer;

    if (userAnswer === correctAnswer) {
      correctCount++;
      feedback.push(`✓ Line ${completion.line} is correct`);
    } else {
      feedback.push(
        `✗ Line ${completion.line} is incorrect. Expected: ${completion.correctAnswer}`
      );
    }
  }

  const score = Math.round(
    (correctCount / exercise.completions.length) * 100
  );
  const correct = correctCount === exercise.completions.length;

  return {
    correct,
    score,
    feedback: feedback.join("\n"),
    correctAnswers,
  };
}

function validateMultipleChoice(
  exercise: MultipleChoiceExercise,
  submission: ExerciseSubmission
): ExerciseResult {
  const correct = submission.selectedOption === exercise.correctAnswer;
  const feedback = correct
    ? "✓ Correct answer!"
    : `✗ Incorrect. The correct answer is: ${exercise.options[exercise.correctAnswer]}`;

  return {
    correct,
    score: correct ? 100 : 0,
    feedback: exercise.explanation
      ? `${feedback}\n\nExplanation: ${exercise.explanation}`
      : feedback,
  };
}

