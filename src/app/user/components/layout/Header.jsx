"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { useEffect } from "react";

import "bootstrap-icons/font/bootstrap-icons.css";
import { useRole } from "@/app/components/RoleProvider";
import { useUnreadNot } from "@/app/hooks/useUnreadNot";
import { useRouter } from "next/navigation";

export const Header = ({ toggleSidebar }) => {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role === "Admin") {
      router.push("/user/admin/dashboard");
    } else if (role === "Student") {
      router.push("/user/student/dashboard");
    } else {
      router.push("/account/Login")
    }
  }, [role]);

  const { data } = useUnreadNot({
    enabled: role !== "Unauthorized" && role !== null,
  });
  const hasUnreadNotifications =
    data?.status === "success" ? data.hasUnread : false;

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>
      <nav
        className={` ${styles.header} navbar navbar-expand-lg navbar-dark fixed-top `}
      >
        <div className="container-xxl">
          <button onClick={() => toggleSidebar?.()}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <h1 className="navbar-brand">Virtual Question Bank</h1>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/question" className="nav-link ">
                  <i className="bi bi-question-circle-fill fs-5 me-1"></i>
                  <span>Questions</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={
                    role === "Admin"
                      ? "/user/admin/adminNotification"
                      : "/user/student/studentNotification"
                  }
                  className="nav-link"
                >
                  <span className="d-flex align-items-center justify-content-start">
                    <div className="position-relative">
                      <div
                        className={`bi bi-bell-fill fs-5  ${
                          hasUnreadNotifications ? styles.shake : ""
                        }`}
                      ></div>
                      {hasUnreadNotifications && (
                        <span className={styles.notificationDot}></span>
                      )}
                    </div>
                    <span className="ms-1">Notifications</span>
                  </span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={
                    role === "Admin"
                      ? "/user/admin/adminProfile"
                      : "/user/student/studentProfile"
                  }
                  className="nav-link d-flex align-items-center"
                >
                  <i className="bi bi-person-circle fs-5 me-1"></i>
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
