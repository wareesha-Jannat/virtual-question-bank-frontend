"use client";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./DetailResultComponent.module.css";

// DetailResultComponent: Displays a detailed analysis of each question in an exam result.
// - dashboardMode: Boolean to determine if "Back" should go to the dashboard or questions page.
// - onBack: Function to handle back button action.
// All question data (questionText, options, correctAnswer, explanation) is now read directly
// from the embedded snapshot in examSession.questions[] — no q.questionId needed.
export const DetailResultComponent = ({
  exam,
  dashboardMode = false,
  onBack,
}) => {
  const router = useRouter();

  // Helper function to format date strings.
  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date"; // Return this message if the date is invalid.
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a"); // Format date for display.
  };

  // Render a loading message if the exam data is not yet available.
  if (!exam) return <div>Loading...</div>;

  // Derived summary counts
  const correctCount = exam.questions.filter((q) => q.isCorrect).length;
  const incorrectCount = exam.questions.filter(
    (q) => !q.isCorrect && q.userAnswer
  ).length;
  const unansweredCount = exam.questions.filter((q) => !q.userAnswer).length;

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailColumn}>
        {/* Brand bar */}
        <div className={styles.brandBar}>
          <i className="bi bi-journal-bookmark-fill"></i>
          <h1>Virtual Question Bank</h1>
        </div>

        {/* Main card */}
        <div className={styles.card}>
          {/* Page header row */}
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>
              <i className="bi bi-clipboard-data"></i> Detailed Question
              Analysis
            </h2>

            {/* Back button(s) depending on dashboardMode */}
            <div className={styles.btnGroup}>
              {dashboardMode ? (
                <button className={styles.btnBack} onClick={onBack}>
                  <i className="bi bi-arrow-left"></i> Back to Result
                </button>
              ) : (
                <>
                  <button className={styles.btnBack} onClick={onBack}>
                    <i className="bi bi-arrow-left"></i> Back to Result
                  </button>
                  <button
                    className={styles.btnQuestions}
                    onClick={() => router.push("/question")}
                  >
                    <i className="bi bi-collection"></i> Back to Questions
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Summary bar */}
          <div className={styles.summaryBar}>
            <span className={styles.summaryItem}>
              <i className="bi bi-list-ol"></i>
              {exam.questions.length} Questions
            </span>
            <span className={styles.summaryItem}>
              <i className="bi bi-check-circle-fill"></i>
              {correctCount} Correct
            </span>
            <span className={styles.summaryItem}>
              <i className="bi bi-x-circle-fill"></i>
              {incorrectCount} Incorrect
            </span>
            {unansweredCount > 0 && (
              <span className={styles.summaryItem}>
                <i className="bi bi-dash-circle"></i>
                {unansweredCount} Unanswered
              </span>
            )}
          </div>

          {/* Time meta row */}
          <div className={styles.timeMeta}>
            <span className={styles.timeItem}>
              <strong>Start Time:</strong> {formatDateTime(exam.startTime)}
            </span>
            <span className={styles.timeItem}>
              <strong>End Time:</strong> {formatDateTime(exam.endTime)}
            </span>
          </div>

          {/* Question cards */}
          <div>
            {exam?.questions.map((q, index) => {
              const isUnanswered = !q.userAnswer;
              const qCardClass = `${styles.qCard} ${
                isUnanswered
                  ? styles.qCardUnanswered
                  : q.isCorrect
                  ? styles.qCardCorrect
                  : styles.qCardIncorrect
              }`;

              const badgeClass = isUnanswered
                ? styles.qCorrectBadgeUnanswered
                : q.isCorrect
                ? styles.qCorrectBadgeTrue
                : styles.qCorrectBadgeFalse;

              const badgeLabel = isUnanswered
                ? "Unanswered"
                : q.isCorrect
                ? "Correct"
                : "Incorrect";

              const badgeIcon = isUnanswered
                ? "bi-dash-circle"
                : q.isCorrect
                ? "bi-check-circle-fill"
                : "bi-x-circle-fill";

              return (
                <div key={q._id} className={qCardClass}>
                  <div className={styles.qCardBody}>
                    {/* Question header */}
                    <div className={styles.qHeaderRow}>
                      <span className={styles.qNum}>
                        Question {index + 1}
                      </span>
                      <span
                        className={`${styles.qCorrectBadge} ${badgeClass}`}
                      >
                        <i className={`bi ${badgeIcon}`}></i> {badgeLabel}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className={styles.qText}>{q.questionText}</p>

                    {/* MCQ options with colour-coding */}
                    {q.questionType === "MCQ" && (
                      <div>
                        {q.options.map((option, idx) => {
                          const isUserAnswer = q.userAnswer
                            ? q.userAnswer.trim()
                            : null; // Set to null if undefined
                          const isCorrectAnswer =
                            option.trim() === q.correctAnswer.trim(); // Check if the current option is correct Answer
                          const isUserOption =
                            isUserAnswer === option.trim(); // Check if the option is the user's answer
                          const isAnswerCorrect =
                            isUserOption && q.isCorrect; // Check if the user's answer is correct

                          // Determine row style
                          let rowClass = styles.optionNeutral;
                          let iconName = null;

                          if (isUserAnswer === null) {
                            // Unanswered: highlight correct in green, rest neutral
                            if (isCorrectAnswer) {
                              rowClass = styles.optionCorrect;
                              iconName = "bi-check-circle-fill";
                            }
                          } else if (isUserOption) {
                            // User selected this option
                            if (isAnswerCorrect) {
                              rowClass = styles.optionCorrect;
                              iconName = "bi-check-circle-fill";
                            } else {
                              rowClass = styles.optionWrong;
                              iconName = "bi-x-circle-fill";
                            }
                          } else if (isCorrectAnswer) {
                            // Not user's choice but it's the correct one
                            rowClass = styles.optionCorrect;
                            iconName = "bi-check-circle-fill";
                          }

                          return (
                            <div
                              key={idx}
                              className={`${styles.optionRow} ${rowClass}`}
                            >
                              <span className={styles.optionIcon}>
                                {iconName && (
                                  <i className={`bi ${iconName}`}></i>
                                )}
                              </span>
                              {option}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Descriptive answer */}
                    {q.questionType === "Descriptive" && (
                      <div className={styles.descriptiveBlock}>
                        <p className={styles.descLabel}>Your Answer</p>
                        <div
                          className={`${styles.descUserAnswer} ${
                            q.isCorrect
                              ? styles.descUserCorrect
                              : styles.descUserWrong
                          }`}
                        >
                          {q.userAnswer ? q.userAnswer : "No answer provided"}
                        </div>
                        {!q.isCorrect && q.userAnswer && (
                          <div className={styles.descCorrectAnswer}>
                            <strong>Correct Answer:</strong> {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback + Explanation */}
                    <div className={styles.feedbackPanel}>
                      <p>
                        <strong>Feedback:</strong> {q.feedback}
                      </p>
                      <p>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
