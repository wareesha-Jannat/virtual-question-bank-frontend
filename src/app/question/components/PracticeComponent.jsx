import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./PracticeComponent.module.css";

export const PracticeComponent = ({ questions, onBackToView }) => {
  // ── State (unchanged) ─────────────────────────────────────────
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // ── Handlers (unchanged logic) ────────────────────────────────
  const handleAnswerChange = (questionId, value) => {
    setUserAnswer(value);
    setSelectedQuestionId(questionId);
  };

  const handleSubmit = async () => {
    if (!userAnswer) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/evaluations`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAnswer, selectedQuestionId }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsCorrect(data.isCorrect);
        setIsDisabled(true);
      } else {
        toast.error(data.message || "Failed to submit answer.");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setSelectedQuestionId(null);
    setIsCorrect(null);
    setIsDisabled(false);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* ── Practice header ──────────────────────────────────── */}
      <div className={styles.practiceHeader}>
        <div className="d-flex align-items-center gap-2">
          <h2 className={styles.practiceTitle}>
            <i className="bi bi-pencil-fill" aria-hidden="true"></i>
            Practice Mode
          </h2>
          <span className={styles.practiceCount}>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button className={styles.btnBack} onClick={onBackToView}>
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          Back to Questions
        </button>
      </div>

      {/* ── Question cards ────────────────────────────────────── */}
      {questions.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          No questions available.
        </div>
      ) : (
        questions.map((q, idx) => (
          <article key={q._id} className={styles.practiceCard}>
            {/* Q number */}
            <p className={styles.questionNum}>Question {idx + 1}</p>

            {/* Question text */}
            <div className={styles.questionText}>{q.questionText}</div>

            {/* MCQ options */}
            {q.questionType === "MCQ" && (
              <div className="mt-2">
                {q.options.map((option, index) => {
                  const isSelected =
                    q._id === selectedQuestionId && userAnswer === option;
                  return (
                    <label key={index} className={styles.optionLabel}>
                      <input
                        type="radio"
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(q._id, option)}
                        disabled={isDisabled && q._id === selectedQuestionId}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Descriptive textarea */}
            {q.questionType === "Descriptive" && (
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Write your answer here…"
                value={q._id === selectedQuestionId ? userAnswer : ""}
                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                disabled={isDisabled && q._id === selectedQuestionId}
              />
            )}

            {/* Submit / Reset */}
            <div className={styles.btnRow}>
              <button
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={isDisabled && q._id === selectedQuestionId}
              >
                <i className="bi bi-send-fill" aria-hidden="true"></i>
                Submit Answer
              </button>
              <button className={styles.btnReset} onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                Reset
              </button>
            </div>

            {/* Feedback panel */}
            {q._id === selectedQuestionId && isCorrect !== null && (
              <>
                <div className={isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}>
                  <i
                    className={`bi ${isCorrect ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                    aria-hidden="true"
                  ></i>
                  {isCorrect ? "Your answer is correct!" : "Your answer is incorrect."}
                </div>

                <div className={styles.feedbackDetails}>
                  <p>
                    <strong>Correct answer: </strong>
                    {q.correctAnswer}
                  </p>
                  <p>
                    <strong>Explanation: </strong>
                    {q.explanation}
                  </p>
                </div>
              </>
            )}
          </article>
        ))
      )}
    </>
  );
};
