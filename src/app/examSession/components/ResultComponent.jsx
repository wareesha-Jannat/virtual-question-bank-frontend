"use client";
import React from "react";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/Loader";
import styles from "./ResultComponent.module.css";

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

  const topicNames = Array.isArray(result?.examSessionId?.topicNames)
    ? result.examSessionId.topicNames
    : Array.isArray(result?.examSessionId?.topicList)
    ? result.examSessionId.topicList
        .map((topic) =>
          topic && typeof topic === "object" ? topic.name : "",
        )
        .filter(Boolean)
    : [];

  // Show a loading message if result data hasn't loaded yet

  return (
    <div className={styles.resultShell}>
      <div className={styles.resultColumn}>
        {/* Brand bar */}
        <div className={styles.brandBar}>
          <i className="bi bi-journal-bookmark-fill"></i>
          <h1>Virtual Question Bank</h1>
        </div>

        {/* Card */}
        <div className={styles.card}>
          {!result ? (
            <div>
              <Loader />
            </div>
          ) : (
            <>
              {/* Result hero */}
              <div className={styles.resultHero}>
                <div
                  className={`${styles.scoreCircle} ${
                    result?.isPass
                      ? styles.scoreCirclePass
                      : styles.scoreCircleFail
                  }`}
                >
                  <span className={styles.scorePercent}>
                    {result?.percentage}%
                  </span>
                  <span className={styles.scoreLabel}>Score</span>
                </div>

                <span
                  className={`${styles.passBadge} ${
                    result?.isPass
                      ? styles.passBadgePass
                      : styles.passBadgeFail
                  }`}
                >
                  {result?.isPass ? (
                    <>
                      <i className="bi bi-check-circle-fill"></i> Pass
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle-fill"></i> Fail
                    </>
                  )}
                </span>
              </div>

              {/* Stats grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Student</span>
                  <span className={styles.statVal}>
                    {result?.userId?.name}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Score</span>
                  <span className={styles.statVal}>
                    {result?.correctAnswers} /{" "}
                    {result?.examSessionId?.totalQuestions}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Time Taken</span>
                  <span className={styles.statVal}>
                    {result?.examSessionId?.timeTaken}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Duration</span>
                  <span className={styles.statVal}>
                    {result?.examSessionId?.duration} min
                  </span>
                </div>
              </div>

              {/* Detail list */}
              <div className={styles.detailList}>
                <div className={styles.detailRow}>
                  <strong>Subject:</strong>{" "}
                  {result?.examSessionId?.subjectName || "Unknown Subject"}
                </div>
                <div className={styles.detailRow}>
                  <strong>Topics Covered:</strong>{" "}
                  {topicNames.join(", ") || "No topics"}
                </div>
                <div className={styles.detailRow}>
                  <strong>Difficulty Level:</strong>{" "}
                  {result?.examSessionId?.difficulty}
                </div>
                <div className={styles.detailRow}>
                  <strong>Exam Date:</strong> {formatDateTime(result?.date)}
                </div>
              </div>

              {/* Action buttons */}
              <div className={styles.actionRow}>
                <button
                  className={styles.btnDetail}
                  onClick={() => onViewDetail(result?.examSessionId?._id)}
                >
                  <i className="bi bi-list-ul"></i> View Detailed Results
                </button>

                {/* Conditionally render the Back button based on dashboardMode prop */}
                {dashboardMode ? (
                  <button className={styles.btnBack} onClick={onBack}>
                    <i className="bi bi-arrow-left"></i> Back to Result Table
                  </button>
                ) : (
                  <button
                    className={styles.btnBack}
                    onClick={() => router.push("/question")}
                  >
                    <i className="bi bi-arrow-left"></i> Back to Questions
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
