"use client";
import { useState } from "react";
import { QuestionTab } from "./QuestionTab";
import { SubjectTab } from "./SubjectTab";
import styles from "../../AdminPages.module.css";


export function QuestionManagement() {
  const [activeTab, setActiveTab] = useState("question");
  

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-journal-text" />
        </span>
        <div>
          <span className={styles.eyebrow}>Administration</span>
          <h1 className={styles.pageTitle}>Question Management</h1>
          <p className={styles.pageDescription}>
            Organize the question bank, subjects, and topics.
          </p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Question management">
        <button
          id="question-management-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "question"}
          aria-controls="question-management-panel"
          className={`${styles.tabButton} ${
            activeTab === "question" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("question")}
        >
          <i className="bi bi-card-list" aria-hidden="true" />
          Questions
        </button>
        <button
          id="subject-management-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "subject"}
          aria-controls="question-management-panel"
          className={`${styles.tabButton} ${
            activeTab === "subject" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("subject")}
        >
          <i className="bi bi-collection" aria-hidden="true" />
          Subjects & Topics
        </button>
      </div>

      <div
        id="question-management-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === "question"
            ? "question-management-tab"
            : "subject-management-tab"
        }
      >
        {activeTab === "subject" ? <SubjectTab /> : <QuestionTab />}
      </div>
    </div>
  );
}
