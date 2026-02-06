"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExerciseSubmission = validateExerciseSubmission;
function validateExerciseSubmission(exercise, submission) {
    switch (exercise.type) {
        case "fill-in-the-blank":
            return validateFillInTheBlank(exercise, submission);
        case "code-completion":
            return validateCodeCompletion(exercise, submission);
        case "multiple-choice":
            return validateMultipleChoice(exercise, submission);
    }
}
function validateFillInTheBlank(exercise, submission) {
    let correctCount = 0;
    const correctAnswers = {};
    const feedback = [];
    for (const blank of exercise.blanks) {
        const userAnswer = submission.answers[blank.id]?.trim().toLowerCase();
        const correctAnswer = blank.correctAnswer.trim().toLowerCase();
        correctAnswers[blank.id] = blank.correctAnswer;
        if (userAnswer === correctAnswer) {
            correctCount++;
            feedback.push(`✓ Blank "${blank.id}" is correct`);
        }
        else {
            feedback.push(`✗ Blank "${blank.id}" is incorrect. Expected: ${blank.correctAnswer}`);
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
function validateCodeCompletion(exercise, submission) {
    let correctCount = 0;
    const correctAnswers = {};
    const feedback = [];
    for (const completion of exercise.completions) {
        const key = `${completion.line}_${completion.column}`;
        const userAnswer = submission.answers[key]?.trim();
        const correctAnswer = completion.correctAnswer.trim();
        correctAnswers[key] = correctAnswer;
        if (userAnswer === correctAnswer) {
            correctCount++;
            feedback.push(`✓ Line ${completion.line} is correct`);
        }
        else {
            feedback.push(`✗ Line ${completion.line} is incorrect. Expected: ${completion.correctAnswer}`);
        }
    }
    const score = Math.round((correctCount / exercise.completions.length) * 100);
    const correct = correctCount === exercise.completions.length;
    return {
        correct,
        score,
        feedback: feedback.join("\n"),
        correctAnswers,
    };
}
function validateMultipleChoice(exercise, submission) {
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
