import { useTopics } from "@/app/hooks/useTopics";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import styles from "./ExamDialog.module.css";

export const ExamDialog = ({ show, handleClose, subId }) => {
  const MAX_QUESTIONS = 40;
  const MAX_DURATION = 60;

  const router = useRouter();

  // ── State (unchanged) ─────────────────────────────────────────
  const [examDetails, setExamDetails] = useState({
    subject: "",
    subjectId: "",
    duration: "",
    totalQuestions: "",
    difficulty: "All",
    questionType: "MCQ",
    selectedTopics: [],
  });

  const { data } = useTopics(subId);
  const topicList = data?.status === "success" ? data.topics : [];

  const [errorMessage, setErrorMessage] = useState("");
  const [maxQuestions, setMaxQuestions] = useState(MAX_QUESTIONS);

  // ── Effects (unchanged) ───────────────────────────────────────
  useEffect(() => {
    if (topicList.length > 0) {
      setExamDetails((prev) => ({
        ...prev,
        subject: topicList[0].subjectId.name || "",
        subjectId: topicList[0].subjectId._id || "",
      }));
    }
  }, [topicList]);

  useEffect(() => {
    let max;
    if (examDetails.questionType === "MCQ") {
      max = 35;
    } else if (examDetails.questionType === "Descriptive") {
      max = 23;
    } else if (examDetails.questionType === "Both") {
      max = 25 + 5; // 25 MCQ + 5 Descriptive
    }
    setMaxQuestions(Math.min(max, MAX_QUESTIONS));
  }, [examDetails.questionType]);

  // ── Handlers (unchanged) ──────────────────────────────────────
  const handleTopicToggle = (topicId) => {
    setExamDetails((prev) => {
      const selectedTopics = prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter((id) => id !== topicId)
        : [...prev.selectedTopics, topicId];
      return { ...prev, selectedTopics };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalQuestions" && value > maxQuestions) {
      setErrorMessage(`Maximum allowed is ${maxQuestions} questions.`);
    } else if (name === "duration" && value > MAX_DURATION) {
      setErrorMessage(`Maximum duration is ${MAX_DURATION} minutes.`);
    } else {
      setErrorMessage("");
    }
    setExamDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (examDetails.duration > MAX_DURATION) {
      setErrorMessage(`Please enter a duration ≤ ${MAX_DURATION} minutes.`);
      return;
    }
    if (examDetails.totalQuestions > maxQuestions) {
      setErrorMessage(`Please enter ≤ ${maxQuestions} questions.`);
      return;
    }
    if (examDetails.selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.");
      return;
    }
    handleStartExam(examDetails);
    handleClose();
  };

  const handleStartExam = async (examDetails) => {
    const jsonString = encodeURIComponent(JSON.stringify(examDetails));
    router.push(`/examSession?examDetails=${jsonString}`);
  };

  // ── Guard render ──────────────────────────────────────────────
  if (!show) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="examDialogTitle">
      <div className={styles.dialog}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div className={styles.dialogHeader}>
          <h5 className={styles.dialogTitle} id="examDialogTitle">
            <i className="bi bi-clipboard2-check-fill" aria-hidden="true"></i>
            Configure Exam
          </h5>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className={styles.dialogBody}>
          <form onSubmit={handleSubmit} id="examForm" noValidate>

            {/* Subject (read-only) */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="subject">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={styles.subjectInput}
                value={examDetails.subject}
                readOnly
              />
            </div>

            {/* Topics multi-select */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Select Topics
                <span className={styles.fieldHint}>
                  {" "}— choose one or more
                </span>
              </label>
              <div className={styles.topicGrid}>
                {topicList.map((topic) => (
                  <button
                    key={topic._id}
                    type="button"
                    className={
                      examDetails.selectedTopics.includes(topic._id)
                        ? styles.topicPillActive
                        : styles.topicPill
                    }
                    onClick={() => handleTopicToggle(topic._id)}
                    aria-pressed={examDetails.selectedTopics.includes(topic._id)}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration + Total Questions — two column layout */}
            <div className={styles.twoCol}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="duration">
                  Duration
                  <span className={styles.fieldHint}> (max {MAX_DURATION} min)</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className={styles.numberInput}
                  value={examDetails.duration}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  max={MAX_DURATION}
                  min={1}
                  placeholder="e.g. 30"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="totalQuestions">
                  Questions
                  <span className={styles.fieldHint}> (max {maxQuestions})</span>
                </label>
                <input
                  type="number"
                  id="totalQuestions"
                  name="totalQuestions"
                  className={styles.numberInput}
                  value={examDetails.totalQuestions}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  max={maxQuestions}
                  min={1}
                  placeholder="e.g. 20"
                  required
                />
              </div>
            </div>

            {/* Question Type */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="questionType">
                Question Type
              </label>
              <select
                id="questionType"
                name="questionType"
                className={styles.selectInput}
                value={examDetails.questionType}
                onChange={handleChange}
              >
                <option value="MCQ">MCQs Only</option>
                <option value="Descriptive">Descriptive Only</option>
                <option value="Both">Both (MCQ + Descriptive)</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="difficulty">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className={styles.selectInput}
                value={examDetails.difficulty}
                onChange={handleChange}
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Validation error */}
            {errorMessage && (
              <div className={styles.errorMsg}>
                <i className="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
                {errorMessage}
              </div>
            )}
          </form>
        </div>

        {/* ── Footer with Start Exam button ────────────────────── */}
        <div className={styles.dialogFooter}>
          <button
            type="submit"
            form="examForm"
            className={styles.btnStartExam}
          >
            <i className="bi bi-rocket-takeoff-fill" aria-hidden="true"></i>
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};
