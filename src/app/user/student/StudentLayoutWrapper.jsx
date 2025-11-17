"use client";
import { useState } from "react";
import { Header } from "../components/layout/Header.jsx";
import { Sidebar } from "./dashboard/components/Sidebar.jsx";
import styles from "./StudentLayoutWrapper.module.css";

const StudentLayoutWrapper = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="custom-container">
        <div className="container-xxl">
          <Sidebar isOpen={isSidebarOpen} />
          <main
            className={`${styles.content} ${isSidebarOpen ? "" : styles.hide}`}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default StudentLayoutWrapper;
