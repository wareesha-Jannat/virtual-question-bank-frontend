"use client";
import React, { useState, useEffect, useRef } from "react";
import { format, isValid } from "date-fns";
import Loader from "@/app/components/Loader";

export const ExamComponent = ({ examSession, onSubmitExam }) => {
  // States to track current question, answer input, and exam status
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(examSession.duration * 60); // Convert duration to seconds
  const [userAnswers, setUserAnswers] = useState([]); // Store answers keyed by question index
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

  // Update user answer for current question

  const handleAnswerChange = (answer) => {
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = answer; // Use index to store the answer
      return updatedAnswers;
    });
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
    if (status === "Cancelled") setIsCancelling(true);

    try {
      const totalTime = examSession.duration * 60 - timeRemaining;
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;

      const updatedSession = {
        ...examSession,
        endTime: new Date().toISOString(),
        timeTaken: `${minutes} min ${seconds} sec`,
        status,
        questions: examSession.questions.map((q, index) => ({
          ...q,
          userAnswer: userAnswers[index] || "",
        })),
      };

      await onSubmitExam(updatedSession);
    } catch (error) {
      toast.error("Error submitting exam:");
    } finally {
      // Reset status to end loading text
      if (status === "Completed") setIsFinishing(false);
      if (status === "Cancelled") setIsCancelling(false);
    }
  };

  if (!examSession)
    return (
      <div>
        <Loader />
      </div>
    ); // Show loading while exam data is loading

  const currentQuestion =
    examSession.questions[currentQuestionIndex].questionId;

  return (
    <div className="col-11">
      <div
        className="card shadow mt-4 p-4"
        style={{ backgroundColor: "#f4f7fc " }}
      >
        <h1
          className="text-center my-4"
          style={{ backgroundColor: "#053e77", color: "white" }}
        >
          Virtual Question Bank
        </h1>
        <h3 className="text-center">Exam for {examSession.subjectId.name}</h3>
        <p className="text-muted d-flex flex-wrap justify-content-between gap-3 mt-2">
          <span>
            <strong>Student:</strong> {examSession.userId.name}
          </span>
          <span>
            <strong>Difficulty Level:</strong> {examSession.difficulty}
          </span>
          <span>
            <strong>Start Time:</strong> {formatDateTime(examSession.startTime)}
          </span>
        </p>
        <p className="text-muted">
          <strong>Topics:</strong>{" "}
          {examSession.topicList.map((topic) => topic.name).join(", ")}
        </p>
        <div className="alert alert-info text-center">
          <strong>Time Remaining: {formatTime(timeRemaining)}</strong>
        </div>

        {/* Dropdown to jump to a specific question */}
        <div className="mb-3">
          <label htmlFor="question-select" className="form-label">
            Jump to Question:
          </label>
          <select
            id="question-select"
            className="form-select"
            value={currentQuestionIndex}
            onChange={handleQuestionJump}
          >
            {examSession.questions.map((_id, index) => (
              <option key={index} value={index}>
                Question {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Display current question with MCQ or descriptive answer field */}
        <div className="card p-3 mb-4">
          <h5 className="card-title">
            Question {currentQuestionIndex + 1} of{" "}
            {examSession.questions.length}
          </h5>
          <p className="card-text headingQuestion">
            {currentQuestion.questionText}
          </p>
          {currentQuestion.questionType === "MCQ" && (
            <div className="form-group">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="form-check">
                  <label className="form-check-label">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="answer"
                      value={option}
                      checked={userAnswers[currentQuestionIndex] === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}
          {currentQuestion.questionType === "Descriptive" && (
            <textarea
              value={userAnswers[currentQuestionIndex]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your answer here"
              className="form-control"
              rows="4"
            />
          )}
        </div>

        {/* Navigation and control buttons */}
        <div className="d-flex gap-5">
          <button
            className="btn btn-secondary"
            disabled={currentQuestionIndex === 0}
            onClick={handlePreviousQuestion}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={currentQuestionIndex === examSession.questions.length - 1}
            onClick={handleNextQuestion}
          >
            Next
          </button>
        </div>
        <div className="text-center mt-2 ">
          <button
            className="btn btn-danger me-2"
            onClick={() => handleFinishExam("Cancelled")}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                {" "}
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Cancelling...</span>
              </>
            ) : (
              "Cancel Exam"
            )}
          </button>
          <button
            className="btn btn-success me-2"
            onClick={() => handleFinishExam("Completed")}
            disabled={isFinishing}
          >
            {isFinishing ? (
              <>
                {" "}
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Finishing...</span>
              </>
            ) : (
              "Finish Exam"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
