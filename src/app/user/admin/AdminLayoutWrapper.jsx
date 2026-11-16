"use client";
import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header.jsx";
import { Sidebar } from "./dashboard/components/Sidebar.jsx";
import styles from "./AdminLayoutWrapper.module.css";
import { usePathname } from "next/navigation";

const AdminLayoutWrapper = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isDashboardPage = pathname === "/user/admin/dashboard";
  const isQuestionManagementPage =
    pathname === "/user/admin/QuestionManagement";

  useEffect(() => {
    if (isDashboardPage && window.matchMedia("(max-width: 800px)").matches) {
      setIsSidebarOpen(false);
    }
  }, [isDashboardPage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="custom-container">
        <div className="container-xxl">
          <Sidebar isOpen={isSidebarOpen} isDashboard={isDashboardPage} />
          <main
            className={`${styles.content} ${
              isSidebarOpen ? "" : styles.hide
            } ${isDashboardPage ? styles.dashboardContent : ""} ${
              isQuestionManagementPage
                ? styles.questionManagementContent
                : ""
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayoutWrapper;
