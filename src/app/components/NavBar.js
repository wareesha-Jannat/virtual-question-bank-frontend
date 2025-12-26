"use client";
import Link from "next/link";
import styles from "../css/navbar.module.css";
import { useEffect } from "react";
import { useRole } from "../components/RoleProvider";

export const NavBar = () => {
  const { role } = useRole();
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <>
      <nav
        className={` ${styles.customNavbar} navbar navbar-expand-lg navbar-dark fixed-top `}
      >
        <div className="container-xxl">
          <h1 className="d-flex align-items-center gap-1">
            <i className="bi bi-journal-text me-2"></i>
            <span>Virtual Question Bank</span>
          </h1>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" aria-current="page" href="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/question">
                  Questions
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#Features">
                  Features
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#Howitworks">
                  How It Works
                </Link>
              </li>
              <div className={`${styles.div}`}>
                {role === "unauthorized" || role === null ? (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`${styles.button} btn btn-success ms-3 `}
                        href="/account/Login"
                      >
                        Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`${styles.button} btn btn-success ms-3 `}
                        href="/account/Register"
                      >
                        Register
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link
                      href={
                        role === "Admin"
                          ? "/user/admin/dashboard"
                          : "/user/student/dashboard"
                      }
                      className={`${styles.button} btn btn-success ms-3 `}
                    >
                      <i className="bi bi-grid-fill fs-5 me-2"></i>
                      Dashboard
                    </Link>
                  </li>
                )}
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
