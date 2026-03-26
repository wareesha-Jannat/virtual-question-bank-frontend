"use client";
import React from "react";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/Loader";

export const ResultComponent = ({
  result,
  onViewDetail,
  dashboardMode = false,
  onBack,
}) => {
  const router = useRouter();

  // Helper function to format dates to a readable format
  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  };

  // Show a loading message if result data hasn't loaded yet

  return (
    <div className="col-12 col-md-10">
      {/* Card container for result details */}
      <div
        className="card shadow my-4 p-4"
        style={{ backgroundColor: "#f4f7fc " }}
      >
        {/* Header for the component */}
        <h1
          className="text-center my-4 p-2"
          style={{ backgroundColor: "#053e77", color: "white" , borderRadius: "5px"}}
        >
          Virtual Question Bank
        </h1>
        <h3 className="text-center heading">RESULT</h3>

        {!result ? (
          <div>
            <Loader />
          </div>
        ) : (
          <>
            {/* Main result details */}
            <p className="text-muted d-flex flex-wrap justify-content-between gap-3 mt-2">
              <span>
                <strong>Student:</strong> {result?.userId?.name}
              </span>
              <span>
                <strong>Score:</strong> {result?.correctAnswers} /{" "}
                {result?.examSessionId?.totalQuestions}
              </span>
              <span>
                <strong>Percentage:</strong> {result?.percentage}%
              </span>
              <span>
                <strong>Result:</strong> {result?.isPass ? "Pass" : "Fail"}
              </span>
              <span>
                <strong>Exam Date:</strong> {formatDateTime(result?.date)}
              </span>
            </p>

            {/* Additional exam session details */}
            <p className="text-muted">
              <strong>Subject:</strong> {result?.examSessionId?.subjectId?.name}
            </p>
            <p className="text-muted">
              <strong>Topics Covered:</strong>{" "}
              {result?.examSessionId?.topicList
                .map((topic) => topic.name)
                .join(", ")}
            </p>
            <p className="text-muted">
              <strong>Difficulty Level:</strong>{" "}
              {result?.examSessionId?.difficulty}
            </p>
            <p className="text-muted">
              <strong>Duration:</strong> {result?.examSessionId?.duration}{" "}
              minutes
            </p>
            <p className="text-muted">
              <strong>Time Taken:</strong> {result?.examSessionId?.timeTaken}
            </p>

            {/* Action buttons for viewing details or navigating back */}
            <div className="text-center mt-2">
              <button
                className="btn btn-primary m-2"
                onClick={() => onViewDetail(result?.examSessionId?._id)}
              >
                View Detailed Results
              </button>

              {/* Conditionally render the Back button based on dashboardMode prop */}
              {dashboardMode ? (
                <button className="btn btn-primary m-2" onClick={onBack}>
                  Back to Result Table
                </button>
              ) : (
                <button
                  className="btn btn-secondary m-2"
                  onClick={() => router.push("/question")}
                >
                  Back to Questions
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
