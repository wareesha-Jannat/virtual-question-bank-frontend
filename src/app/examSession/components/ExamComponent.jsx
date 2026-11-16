"use client";
import React, { useState, useEffect, useRef } from "react";
import { format, isValid } from "date-fns";
import Loader from "@/app/components/Loader";
import styles from "./ExamComponent.module.css";

export const ExamComponent = ({ examSession, onSubmitExam }) => {
  // States to track current question, answer input, and exam status
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(examSession.duration * 60); // Convert duration to seconds
  const [userAnswers, setUserAnswers] = useState({}); // Store answers keyed by subdocument _id
  const timerIdRef = useRef(); // Reference to manage the timer

  // Start the timer and set start time when component mounts
  useEffect(() => {
    examSession.startTime = new Date().toISOString();

    // Timer interval to decrease remaining time each second
    timerIdRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIdRef.current); // Stop timer at zero
          handleFinishExam("Completed"); // Auto-finish when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerIdRef.current); // Cleanup timer on unmount
  }, []);

  // Format time in "minutes:seconds" format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Format start time and end time as "day month year hour:minute am/pm"
  function formatDateTime(dateInput) {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  }

  // Update user answer for current question — keyed by subdocument _id
  const handleAnswerChange = (answer) => {
    const questionId = currentQuestion._id; // subdocument _id (not the Question collection _id)
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  // Navigation to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigation to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Jump to a specific question using dropdown
  const handleQuestionJump = (event) => {
    setCurrentQuestionIndex(Number(event.target.value)); //The value will be the index of the selected question
  };

  // Finish or cancel the exam, attach answers and submit results
  const handleFinishExam = async (status) => {
    clearInterval(timerIdRef.current); // Stop the timer

    // Set status to show loading text for finishing or cancelling actions
    if (status === "Completed") setIsFinishing(true);
    if (status === "Canceled") setIsCancelling(true);

    try {
      const totalTime = examSession.duration * 60 - timeRemaining;
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;

      const updatedSession = {
        ...examSession,
        endTime: new Date().toISOString(),
        timeTaken: `${minutes} min ${seconds} sec`,
        status,
        // userAnswer keyed by subdocument _id — matches finishExam's submittedAnswers Map
        questions: examSession.questions.map((q) => ({
          ...q,
          userAnswer: userAnswers[q._id] || "",
        })),
      };

      await onSubmitExam(updatedSession);
    } catch (error) {
      toast.error("Error submitting exam:");
    } finally {
      // Reset status to end loading text
      if (status === "Completed") setIsFinishing(false);
      if (status === "Canceled") setIsCancelling(false);
    }
  };

  if (!examSession)
    return (
      <div>
        <Loader />
      </div>
    ); // Show loading while exam data is loading

  // currentQuestion is the subdocument itself — all fields (questionText, options, etc.) are embedded directly
  const currentQuestion = examSession.questions[currentQuestionIndex];

  // Timer class based on remaining time
  const totalSeconds = examSession.duration * 60;
  const timerClass =
    timeRemaining < 60
      ? styles.timerDanger
      : timeRemaining < 300
      ? styles.timerWarning
      : styles.timerNormal;

  // Progress percentage
  const progressPct =
    ((currentQuestionIndex + 1) / examSession.questions.length) * 100;

  return (
    <div className={styles.examShell}>
      <div className={styles.examColumn}>
        {/* Brand bar */}
        <div className={styles.brandBar}>
          <i className="bi bi-journal-bookmark-fill"></i>
          <h1>Virtual Question Bank</h1>
        </div>

        {/* Main card */}
        <div className={styles.card}>
          {/* Exam title */}
          <p className={styles.examTitle}>
            Exam — {examSession.subjectName || "Unknown Subject"}
          </p>

          {/* Meta info */}
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <strong>Student:</strong> {examSession.userId.name}
            </span>
            <span className={styles.metaItem}>
              <strong>Difficulty:</strong> {examSession.difficulty}
            </span>
            <span className={styles.metaItem}>
              <strong>Started:</strong> {formatDateTime(examSession.startTime)}
            </span>
          </div>

          <p className={styles.topicsStrip}>
            <strong>Topics:</strong>{" "}
            {examSession.topicNames?.join(", ") || "No topics"}
          </p>

          {/* Timer */}
          <div className={timerClass}>
            <i className="bi bi-clock-fill"></i>
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>
                Question {currentQuestionIndex + 1} of{" "}
                {examSession.questions.length}
              </span>
              <span>{Math.round(progressPct)}% through</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Answer dot grid */}
          <div className={styles.dotGrid}>
            {examSession.questions.map((q, idx) => {
              let dotClass = styles.dot;
              if (idx === currentQuestionIndex) dotClass = `${styles.dot} ${styles.dotCurrent}`;
              else if (userAnswers[q._id]) dotClass = `${styles.dot} ${styles.dotAnswered}`;
              return (
                <button
                  key={idx}
                  className={dotClass}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Question ${idx + 1}`}
                  aria-label={`Go to question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Jump-to dropdown */}
          <div className={styles.jumpWrap}>
            <label htmlFor="question-select" className={styles.jumpLabel}>
              Jump to Question
            </label>
            <select
              id="question-select"
              className={styles.jumpSelect}
              value={currentQuestionIndex}
              onChange={handleQuestionJump}
            >
              {examSession.questions.map((_q, index) => (
                <option key={index} value={index}>
                  Question {index + 1}{" "}
                  {userAnswers[examSession.questions[index]._id]
                    ? "✓"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Question card */}
          <div className={styles.questionCard}>
            <p className={styles.questionMeta}>
              Question {currentQuestionIndex + 1} &bull;{" "}
              {currentQuestion.questionType}
            </p>
            <p className={styles.questionText}>
              {currentQuestion.questionText}
            </p>

            {/* MCQ options */}
            {currentQuestion.questionType === "MCQ" && (
              <div>
                {currentQuestion.options.map((option, index) => {
                  const isSelected =
                    userAnswers[currentQuestion._id] === option;
                  return (
                    <label
                      key={index}
                      className={`${styles.optionLabel}${isSelected ? " " + styles.optionSelected : ""}`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Descriptive answer */}
            {currentQuestion.questionType === "Descriptive" && (
              <textarea
                className={styles.textarea}
                value={userAnswers[currentQuestion._id] ?? ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your answer here…"
                rows={5}
              />
            )}
          </div>

          {/* Navigation row */}
          <div className={styles.navRow}>
            <button
              className={styles.btnNav}
              disabled={currentQuestionIndex === 0}
              onClick={handlePreviousQuestion}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </button>
            <button
              className={styles.btnNav}
              disabled={
                currentQuestionIndex === examSession.questions.length - 1
              }
              onClick={handleNextQuestion}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          {/* Action row */}
          <div className={styles.actionRow}>
            <button
              className={styles.btnCancel}
              onClick={() => handleFinishExam("Canceled")}
              disabled={isCancelling || isFinishing}
            >
              {isCancelling ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cancelling…
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle"></i> Cancel Exam
                </>
              )}
            </button>
            <button
              className={styles.btnFinish}
              onClick={() => handleFinishExam("Completed")}
              disabled={isFinishing || isCancelling}
            >
              {isFinishing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Submitting…
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i> Finish Exam
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
