"use client";
import Link from "next/link";
import styles from "../css/navbar.module.css";
import { useRole } from "../components/RoleProvider";
import { useEffect, useRef, useState } from "react";

export const NavBar = () => {
  const { role } = useRole();
  const bootstrapRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // ── Scroll shadow effect ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Bootstrap JS + outside-click handler ─────────────────────
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      bootstrapRef.current = bootstrap;

      const handleClickOutside = (event) => {
        const navbar = document.getElementById("navbarNav");
        const toggler = document.querySelector(".navbar-toggler");

        if (
          navbar &&
          navbar.classList.contains("show") &&
          !navbar.contains(event.target) &&
          toggler &&
          !toggler.contains(event.target)
        ) {
          const bsCollapse =
            bootstrap.Collapse.getInstance(navbar) ||
            new bootstrap.Collapse(navbar);
          bsCollapse.hide();
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    });
  }, []);

  // ── Close navbar on link click (mobile) ──────────────────────
  const handleNavClick = () => {
    const navbar = document.getElementById("navbarNav");
    if (navbar && navbar.classList.contains("show") && bootstrapRef.current) {
      const bsCollapse =
        bootstrapRef.current.Collapse.getInstance(navbar) ||
        new bootstrapRef.current.Collapse(navbar);
      bsCollapse.hide();
    }
  };

  // ── Dashboard URL based on role ───────────────────────────────
  const dashboardHref =
    role === "Admin" ? "/user/admin/dashboard" : "/user/student/dashboard";

  return (
    <nav
      className={`${styles.customNavbar} ${scrolled ? styles.scrolled : ""} navbar navbar-expand-lg navbar-dark fixed-top`}
    >
      <div className="container-xxl">
        {/* ── Brand ──────────────────────────────────────────── */}
        <h1 className={styles.brand}>
          <i className="bi bi-journal-text" aria-hidden="true"></i>
          <span>Virtual Question Bank</span>
        </h1>

        {/* ── Mobile Toggler ─────────────────────────────────── */}
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

        {/* ── Nav Links ──────────────────────────────────────── */}
        <div
          className={`collapse navbar-collapse ${styles.mobilePanel}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <Link className="nav-link" href="/" onClick={handleNavClick}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                href="/question"
                onClick={handleNavClick}
              >
                Questions
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                href="#Features"
                onClick={handleNavClick}
              >
                Features
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link"
                href="#Howitworks"
                onClick={handleNavClick}
              >
                How It Works
              </Link>
            </li>

            {/* ── Auth / Dashboard Buttons ────────────────────── */}
            <li className={`nav-item ${styles.authButtons} ms-lg-2`}>
              {role === "unauthorized" || role === null ? (
                <>
                  <Link
                    className={styles.buttonOutline}
                    href="/account/Login"
                    onClick={handleNavClick}
                  >
                    Login
                  </Link>
                  <Link
                    className={styles.buttonFilled}
                    href="/account/Register"
                    onClick={handleNavClick}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  href={dashboardHref}
                  className={styles.buttonFilled}
                  onClick={handleNavClick}
                >
                  <i className="bi bi-grid-fill" aria-hidden="true"></i>
                  Dashboard
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
