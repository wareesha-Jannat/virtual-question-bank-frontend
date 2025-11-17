"use client";
import { useState } from "react";
import styles from "./QuestionManagement.module.css";
import { QuestionTab } from "./QuestionTab";
import { SubjectTab } from "./SubjectTab";


export function QuestionManagement() {
  const [activeTab, setActiveTab] = useState("question");
  

  return (
    <div >
      <h1>Question Management</h1>
      <div className="container-fluid ">
        <ul className={`nav ${styles.list}`}>
          <button onClick={(e) => setActiveTab("question")}>Questions</button>
          <button onClick={(e) => setActiveTab("subject")}>Subjects</button>
        </ul>
        {activeTab === "subject" && <SubjectTab  />}
        {activeTab === "question" && <QuestionTab  />}
      </div>
    
    </div>
  );
}
