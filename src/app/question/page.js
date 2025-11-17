"use client";

import { SubjectCarousel } from "./components/SubjectCarousel";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { useState } from "react";

import { useSubjects } from "../hooks/useSubjects";

export default function QuestionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar visibility
  const [subjectId, setSubjectId] = useState(null);
  const [topicId, setTopicId] = useState(null);

  const { data } = useSubjects();

  const subjects = data?.status === "success" ? data.subjects ?? [] : [];

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to handle subject selection
  const handleSubjectSelect = (id) => {
    setSubjectId(id);
    setTopicId(null);
  };

  // Function to handle topic selection from the sidebar
  const handleTopicSelect = (id) => {
    setTopicId(id);
  };

  return (
    <>
      {/* Header component with a button to toggle sidebar */}
      <Header toggleSidebar={toggleSidebar} />

      {/* SubjectCarousel to display and select subjects */}
      <SubjectCarousel
        subjects={subjects}
        onSubjectSelect={handleSubjectSelect}
      />
      <div className="custom-container">
        <div className=" container-xxl ">
          {/* Sidebar component for displaying topics based on the selected subject */}
          <Sidebar
            isOpen={isSidebarOpen}
            subjectId={subjectId}
            onTopicSelect={handleTopicSelect}
          />

          {/* MainContent component to display the content based on selected subject and topic */}
          <MainContent
            isOpen={isSidebarOpen}
            subjectId={subjectId}
            topicId={topicId}
          />
        </div>
      </div>
    </>
  );
}
