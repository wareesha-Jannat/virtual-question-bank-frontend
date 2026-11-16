"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { useEffect } from "react";
import { useRole } from "../../components/RoleProvider";

export const Header = ({ toggleSidebar }) => {
  const { role } = useRole();

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const dashboardHref =
    role === "Admin" ? "/user/admin/dashboard" : "/user/student/dashboard";

  return (
    <>
      <nav className={`${styles.header} navbar navbar-expand-lg navbar-dark fixed-top`}>
        <div className="container-xxl d-flex align-items-center">
          {/* ── Sidebar Toggle ─────────────────────────────── */}
          <button
            className={styles.toggleBtn}
            onClick={() => toggleSidebar?.()}
            aria-label="Toggle sidebar"
            title="Toggle Topics Panel"
          >
            <i className="bi bi-layout-sidebar-inset" aria-hidden="true"></i>
          </button>

          {/* ── Brand ──────────────────────────────────────── */}
          <h1 className="navbar-brand mb-0 me-auto">
            <i className="bi bi-journal-text" aria-hidden="true"></i>
            Virtual Question Bank
          </h1>

          {/* ── Mobile Toggler ─────────────────────────────── */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#qNavbarNav"
            aria-controls="qNavbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* ── Nav Links ──────────────────────────────────── */}
          <div className="collapse navbar-collapse" id="qNavbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              {role === "unauthorized" || role === null ? (
                <>
                  <li className="nav-item">
                    <Link href="/" className="nav-link" prefetch={true}>
                      <i className="bi bi-house-fill" aria-hidden="true"></i>
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/account/Login" className="nav-link">
                      <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                      Login
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link href={dashboardHref} className="nav-link">
                    <i className="bi bi-grid-fill" aria-hidden="true"></i>
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
