"use client";
import React, { useState, useEffect } from "react";
import styles from "./SubjectCarousel.module.css";
import Loader from "@/app/components/Loader";

export const SubjectCarousel = ({ subjects, onSubjectSelect, isLoading }) => {
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const scrollRef = React.useRef(null);

  // Smooth scroll the carousel track left / right
  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  // Auto-select first subject once subjects load
  useEffect(() => {
    if (!activeSubjectId && subjects.length > 0) {
      const defaultSubjectId = subjects[0]._id;
      setActiveSubjectId(defaultSubjectId);
      onSubjectSelect(defaultSubjectId);
    }
  }, [subjects, , activeSubjectId]);

  const handleSubjectClick = (subjectId) => {
    setActiveSubjectId(subjectId);
    onSubjectSelect(subjectId);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <section className={styles.subjectPortion} aria-label="Subject selector">
      <div className="container-xxl">
        <p className={styles.sectionTitle}>Subjects</p>

        <div className={styles.carouselRow}>
          {/* ── Left arrow ─────────────────────────────────── */}
          <button
            className={styles.arrowBtn}
            onClick={() => scroll(-160)}
            aria-label="Scroll subjects left"
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>

          {/* ── Scrollable subject track ────────────────────── */}
          <div className={styles.carousel} ref={scrollRef}>
            {isLoading ? (
              <div className={styles.loadingWrap}>
                <Loader height={24} width={24} size={24} />
              </div>
            ) : subjects?.length > 0 ? (
              subjects.map((subject) => (
                <button
                  key={subject._id}
                  className={`${styles.subjectItem} ${
                    subject._id === activeSubjectId ? styles.active : ""
                  }`}
                  onClick={() => handleSubjectClick(subject._id)}
                  aria-pressed={subject._id === activeSubjectId}
                >
                  {capitalize(subject.name)}
                </button>
              ))
            ) : (
              <span className="text-muted small px-3 py-1">
                No subjects found
              </span>
            )}
          </div>

          {/* ── Right arrow ─────────────────────────────────── */}
          <button
            className={styles.arrowBtn}
            onClick={() => scroll(160)}
            aria-label="Scroll subjects right"
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubjectCarousel;
