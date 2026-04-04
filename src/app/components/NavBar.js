"use client";
import Link from "next/link";
import styles from "../css/navbar.module.css";
import { useRole } from "../components/RoleProvider";
import { useEffect, useRef } from "react";

export const NavBar = () => {
  const { role } = useRole();
  const bootstrapRef = useRef(null);

  // Load bootstrap + outside click handler
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

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    });
  }, []);

  // Close navbar on link click
  const handleNavClick = () => {
    const navbar = document.getElementById("navbarNav");

    if (navbar && navbar.classList.contains("show") && bootstrapRef.current) {
      const bsCollapse =
        bootstrapRef.current.Collapse.getInstance(navbar) ||
        new bootstrapRef.current.Collapse(navbar);

      bsCollapse.hide();
    }
  };

  return (
    <nav
      className={`${styles.customNavbar} navbar navbar-expand-lg navbar-dark fixed-top`}
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
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
          style={{ backgroundColor: "#053e77", padding: "1rem" }}
        >
          <ul className="navbar-nav ms-auto">
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

            {/* Auth Buttons */}
            <li className={`nav-item ${styles.div}`}>
              {role === "unauthorized" || role === null ? (
                <>
                  <Link
                    className={`${styles.button} btn btn-success ms-3`}
                    href="/account/Login"
                    onClick={handleNavClick}
                  >
                    Login
                  </Link>

                  <Link
                    className={`${styles.button} btn btn-success ms-3`}
                    href="/account/Register"
                    onClick={handleNavClick}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <Link
                  href={
                    role === "Admin"
                      ? "/user/admin/dashboard"
                      : "/user/student/dashboard"
                  }
                  className={`${styles.button} btn btn-success ms-3`}
                  onClick={handleNavClick}
                >
                  <i className="bi bi-grid-fill fs-5 me-2"></i>
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
