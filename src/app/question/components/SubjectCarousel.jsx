"use client";
import React, { useState, useEffect } from "react";
import styles from "./SubjectCarousel.module.css";

export const SubjectCarousel = ({ subjects, onSubjectSelect }) => {
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const scrollRef = React.useRef(null); // Ref to the container that holds the subjects for scrolling functionality

  // Function to handle smooth scrolling of the carousel (left or right)
  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollOffset, // Scroll by the provided offset
        behavior: "smooth",
      });
    }
  };

  // Effect hook to set a default active subject when the subjects array is available
  useEffect(() => {
    if (!activeSubjectId && subjects.length > 0) {
      const defaultSubjectId = subjects[0]._id; // Select the first subject by default
      setActiveSubjectId(defaultSubjectId);
      onSubjectSelect(defaultSubjectId); // Notify the parent component about the default selection
    }
  }, [subjects, ,activeSubjectId]);

  // Function to handle click on a subject and update the active subject
  const handleSubjectClick = (subjectId) => {
    setActiveSubjectId(subjectId);
    onSubjectSelect(subjectId);
  };

  // Helper function to capitalize the first letter of a string
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <section className={` ${styles.subjectPortion} `}>
    <div className="container">
      <h4 className="text-center heading mt-1">Subjects</h4>

      {/* Container for the carousel with scroll buttons */}
      <div className="d-flex align-items-center justify-content-center">
        <button
          className={`btn btn-outline-secondary  me-2`}
          onClick={() => scroll(-100)}
        >
          ❮
        </button>
        <div
          className={`overflow-auto d-flex flex-nowrap  ${styles.carousel}`}
          ref={scrollRef}
        >
          {/* Map through the subjects array and display each subject */}
          {subjects?.length > 0 ? (
            subjects.map((subject) => (
              <div
                key={subject._id}
                className={`${styles.subjectItem} p-2 ${
                  subject._id === activeSubjectId ? styles.active : ""
                }`}
                onClick={() => handleSubjectClick(subject._id)}
              >
                {capitalize(subject.name)}
              </div>
            ))
          ) : (
            <div className="text-muted p-3">No subjects found</div>
          )}
        </div>
        <button
          className={`btn btn-outline-secondary carousel-btn ms-2`}
          onClick={() => scroll(100)}
        >
          ❯
        </button>
      </div>
    </div>
    </section>
  );
};

export default SubjectCarousel;
