"use client";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import "bootstrap-icons/font/bootstrap-icons.css";

// DetailResultComponent: Displays a detailed analysis of each question in an exam result.
// - dashboardMode: Boolean to determine if "Back" should go to the dashboard or questions page.
// - onBack: Function to handle back button action.
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

  return (
    <div className="col-11">
      {/* Main card container for the detailed result analysis */}
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

        <h2 className="text-center mt-4 heading">Detailed Question Analysis</h2>

        {/* Back button to navigate back depending on dashboardMode */}
        <div className="text-end my-2">
          {dashboardMode ? (
            <button className="btn btn-primary me-3" onClick={onBack}>
              Back to Result
            </button>
          ) : (
            <div className="d-flex">
              <button className="btn btn-primary ms-2" onClick={onBack}>
                Back to Result
              </button>
              <button
                className="btn btn-secondary ms-auto"
                onClick={() => router.push("/question")}
              >
                Back to Questions
              </button>
            </div>
          )}
        </div>

        {/* Display exam start and end times */}
        <p className="text-muted d-flex flex-wrap justify-content-between gap-3 mt-2">
          <span>
            <strong>Start Time:</strong> {formatDateTime(exam.startTime)}
          </span>
          <span>
            <strong>End Time:</strong> {formatDateTime(exam.endTime)}
          </span>
        </p>

        {/* Iterate through each question in the exam and display analysis */}
        <div className="mt-4">
          {exam?.questions.map((q, index) => (
            <div key={q._id } className="card mb-3 shadow-sm">
              <div className="card-body">
                {/* Question text */}
                <h5 className="mb-2">
                  <strong>Question {index + 1}:</strong>{" "}
                  {q.questionId.questionText}
                </h5>

                {/* For MCQ questions, display options with color coding for correct and incorrect answers */}
                {q.questionId.questionType === "MCQ" && (
                  <div className="mb-3">
                    {q.questionId.options.map((option, idx) => {
                      const isUserAnswer = q.userAnswer ? q.userAnswer.trim(): null; // Set to null if undefined
                      const isCorrectAnswer = option.trim() === q.questionId.correctAnswer.trim(); //Check if the current option is correct Answer
                      const isUserOption = isUserAnswer === option.trim(); // Check if the option is the user's answer
                      const isAnswerCorrect = isUserOption && q.isCorrect; // Check if the user's answer is correct

                      return (
                        <div
                          key={idx}
                          className={`alert 
                            ${
                              // Check if the user has not answered
                              isUserAnswer === null
                                ? // If the answer is correct (but user has not selected it )
                                  isCorrectAnswer
                                  ? "alert-success" 
                                  : "alert-secondary" 
                                : // If the user has selected an answer
                                isUserOption
                                ? // If the user's answer is correct
                                  isAnswerCorrect
                                  ? "alert-success" 
                                  : "alert-danger" 
                                : // If the user's answer is not selected, check if it's the correct answer
                                isCorrectAnswer
                                ? "alert-success" 
                                : "alert-secondary" 
                            } d-flex align-items-center`}
                        >
                          {/* Icon for correct/incorrect answer */}
                          <span className="me-2">
                            {
                              // Check if the user has not answered yet
                              isUserAnswer === null ? (
                                // If the answer is correct (but not selected by the user)
                                isCorrectAnswer ? (
                                  <i className="bi bi-check-circle-fill"></i> // Icon for correct answer (unanswered)
                                ) : null // No icon for incorrect options (unanswered)
                              ) : // If the user has selected an answer
                              isUserOption ? (
                                // If the user's answer is correct
                                isAnswerCorrect ? (
                                  <i className="bi bi-check-circle-fill"></i> // Icon for correct answer by user
                                ) : (
                                  <i className="bi bi-x-circle-fill"></i>
                                ) // Icon for incorrect answer by user
                              ) : // If the user hasn't selected this option, check if it's the correct answer
                              isCorrectAnswer ? (
                                <i className="bi bi-check-circle-fill"></i> // Icon for correct answer (not selected by user)
                              ) : null // No icon for incorrect options not selected by the user
                            }
                          </span>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* For Descriptive questions, show user's answer and correct answer */}
                {q.questionId.questionType === "Descriptive" && (
                  <div className="mb-3">
                    <p>
                      <strong>Your Answer:</strong>
                      <span
                        className={q.isCorrect ? "text-success" : "text-danger"}
                      >
                        {q.userAnswer ? q.userAnswer : "No answer provided"}
                      </span>
                    </p>
                    {!q.isCorrect && q.userAnswer && (
                      <p className="bg-light p-3 rounded headingQuestion">
                        <strong>Correct Answer: </strong>{" "}
                        {q.questionId.correctAnswer}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback and Explanation section for each question */}
                <div className="bg-light p-3 rounded headingQuestion">
                  <p className="mb-2">
                    <strong>Feedback:</strong> {q.feedback}
                  </p>
                  <p className="mb-1">
                    <strong>Explanation:</strong> {q.questionId.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
