"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useRole } from "../../components/RoleProvider";

export const Header = ({ toggleSidebar }) => {
  // State to store the authentication status and user role

  const { role } = useRole();

  // Function to fetch the user role after authentication

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <>
      {/* Navigation bar */}
      <nav
        className={` ${styles.header} navbar navbar-expand-lg navbar-dark fixed-top `}
      >
        <div className="container-xxl">
          <button onClick={() => toggleSidebar?.()}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <h1 className="navbar-brand">Virtual Question Bank</h1>

          {/* Navbar toggle button for small screens */}
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

          {/* Navbar links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* If authenticated, show Dashboard link based on role */}
              {role !== "unauthorized" ? (
                <li className="nav-item">
                  <Link
                    href={
                      role === "Admin"
                        ? "/user/admin/dashboard"
                        : "/user/student/dashboard"
                    }
                    className="nav-link"
                  >
                    <i className="bi bi-grid-fill fs-5 me-2"></i>
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/" className="nav-link" prefetch={true}>
                      <i className="bi bi-house-fill fs-5 me-2"></i>
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/account/Login" className="nav-link">
                      <i className="bi bi-box-arrow-in-right fs-5 me-2"></i>
                      Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
