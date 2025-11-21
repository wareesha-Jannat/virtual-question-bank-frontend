"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./MainContent.module.css";
import { toast } from "react-toastify";
import { ExamDialog } from "./ExamDialog";
import { PracticeComponent } from "./PracticeComponent";

import { useRole } from "@/app/components/RoleProvider";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@/app/hooks/useDebounce";

export const MainContent = ({ isOpen, subjectId, topicId }) => {
  // State variables for holding questions, search term, difficulty, and filtered questions

  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);

  const [practiceMode, setPracticeMode] = useState(false); // New state for practice mode

  const router = useRouter();
  const debouncedSearch = useDebounce(searchTerm);

  const { role } = useRole();

  //Query to fetch questions

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [
        "questionsPage",
        debouncedSearch,
        difficulty,
        subjectId,
        topicId,
      ],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams(
          Object.entries({
            cursor: pageParam,
            search: debouncedSearch,
            difficulty,
            subjectId,
            topicId,
          }).filter(([, v]) => v !== undefined && v !== null)
        ); // remove empty/null/undefined

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/getQuestions?${params}`
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch questions");
        return data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
      enabled: !!subjectId && !!topicId,
    });
  const questions = data?.pages.flatMap((page) => page.questions) || [];

  //Toggle explanation
  const toggleExplanation = (id) => {
    setExpandedQuestionId((prevId) => (prevId === id ? null : id));
  };

  // Open the exam dialog if conditions are met
  const handleOpenExamDialog = () => {
    if (role === "Student") {
      setShowExamDialog(true); // Show the exam dialog if user is authenticated and a student
    } else if (role === "Admin") {
      toast.error("Admin cannot take exam"); // Show error if admin tries to take exam
      router.push("./user/admin/dashboard");
    } else if (role === "unauthorized") {
      toast.error("You have to Login first to take exam");
      router.push("./account/Login");
    }
  };

  // Close the exam dialog
  const handleCloseExamDialog = () => {
    setShowExamDialog(false);
  };

  // Start practice mode
  const handleStartPractice = () => {
    if (role === "Student") {
      if (questions.length > 50) {
        const confirmAll = window.confirm(
          `You have ${questions.length} questions loaded.\n\n` +
            `Click "OK" to practice ALL.\n` +
            `Click "Cancel" to practice first 50 only.`
        );
        if (confirmAll) {
          setPracticeQuestions(questions);
        } else {
          setPracticeQuestions(questions.slice(0, 50));
        }
      } else {
        setPracticeQuestions(questions);
      }
      toast.success("Start Practice Questions");

      setPracticeMode(true); // Set practice mode to true
    } else if (role === "Admin") {
      toast.error("Admin cannot practice question");
      router.push("./user/admin/dashboard");
    } else if (role === "unauthorized") {
      toast.error("You have to Login first to start practice");
      router.push("./account/Login");
    }
  };

  return (
    <div className={`${styles.content}   ${isOpen ? "" : styles.hide}`}>
      {practiceMode ? (
        // Show PracticeComponent if practiceMode is true
        <PracticeComponent
          questions={practiceQuestions}
          onBackToView={() => {
            setPracticeMode(false);
            setPracticeQuestions([]);
          }}
        />
      ) : (
        <>
          {/* Show buttons for starting practice and taking exam */}
          <div className="d-flex justify-content-between mb-4 ">
            <button className="btn btn-success" onClick={handleStartPractice}>
              Start Practice
            </button>
            <button className="btn btn-info" onClick={handleOpenExamDialog}>
              Take Exam
            </button>
          </div>

          {/* Filter controls for search and difficulty */}
          <div className={` ${styles.filters} d-flex gap-3 mb-4`}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className={styles.select}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Difficulty Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Clear Filters Button */}
            <div className="col-md-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setDifficulty("");
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Display questions */}
          <div className="mt-4">
            {questions && questions.length > 0 ? (
              questions.map((question) => (
                <div key={question._id} className="border p-3 rounded mb-2">
                  <div className="d-flex align-items-center justify-content-between heading">
                    <h6>{question.questionText}</h6>
                  </div>
                  {question.questionType === "MCQ" && (
                    <div className="mt-4">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center mb-1"
                        >
                          <input
                            className="me-2"
                            type="radio"
                            checked={option === question.correctAnswer.trim()}
                            readOnly
                          />
                          <label>{option}</label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display explanation if expanded */}
                  {question.questionType === "Descriptive" && (
                    <p className="mt-4">
                      <strong>Answer:</strong> {question.correctAnswer}
                    </p>
                  )}
                  <button
                    className="btn btn-info mt-2"
                    onClick={() => toggleExplanation(question._id)}
                  >
                    {expandedQuestionId === question._id
                      ? "Hide Explanation"
                      : "Show Explanation"}
                  </button>
                  {expandedQuestionId === question._id && (
                    <div className={styles.explanation}>
                      <p className={styles.explanationText}>
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noQuestionsMessage}>
                No questions available.
              </div>
            )}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn btn-info d-flex align-items-center justify-content-center gap-2 px-4 py-2 fw-semibold shadow-sm"
              >
                {isFetchingNextPage ? (
                  <>
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>Loading...</span>
                    </>
                  </>
                ) : (
                  <span className="text-white">Load More</span>
                )}
              </button>
            )}
          </div>

          {/* Exam dialog */}
          <ExamDialog
            show={showExamDialog}
            handleClose={handleCloseExamDialog}
            subId={subjectId}
          />
        </>
      )}
    </div>
  );
};
