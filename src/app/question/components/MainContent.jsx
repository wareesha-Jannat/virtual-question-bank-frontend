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
import Loader from "@/app/components/Loader";

/* ─── Difficulty badge helper ─────────────────────────────────── */
const DifficultyBadge = ({ difficulty }) => {
  const cls =
    difficulty === "Easy"
      ? styles.badgeEasy
      : difficulty === "Medium"
      ? styles.badgeMedium
      : difficulty === "Hard"
      ? styles.badgeHard
      : styles.badgeType;
  return <span className={cls}>{difficulty}</span>;
};

export const MainContent = ({ isOpen, subjectId, topicId }) => {
  // ── State ────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceMode, setPracticeMode] = useState(false);

  const router = useRouter();
  const debouncedSearch = useDebounce(searchTerm);
  const { role } = useRole();

  // ── Infinite query for questions ──────────────────────────────
  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    status,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["questionsPage", debouncedSearch, difficulty, subjectId, topicId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(
        Object.entries({
          cursor: pageParam,
          search: debouncedSearch,
          difficulty,
          subjectId,
          topicId,
        }).filter(([, v]) => v !== undefined && v !== null),
      );
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/?${params}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch questions");
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    enabled: !!subjectId && !!topicId,
    keepPreviousData: true,
  });

  const questions = data?.pages.flatMap((page) => page.questions) || [];

  // ── Handlers ─────────────────────────────────────────────────
  const toggleExplanation = (id) => {
    setExpandedQuestionId((prevId) => (prevId === id ? null : id));
  };

  const handleOpenExamDialog = () => {
    if (role === "Student") {
      setShowExamDialog(true);
    } else if (role === "Admin") {
      toast.error("Admin cannot take exam");
      router.push("./user/admin/dashboard");
    } else if (role === "unauthorized") {
      toast.error("You have to Login first to take exam");
      router.push("./account/Login");
    }
  };

  const handleCloseExamDialog = () => {
    setShowExamDialog(false);
  };

  const handleStartPractice = () => {
    if (role === "Student") {
      if (questions.length > 50) {
        const confirmAll = window.confirm(
          `You have ${questions.length} questions loaded.\n\n` +
            `Click "OK" to practice ALL.\n` +
            `Click "Cancel" to practice first 50 only.`,
        );
        setPracticeQuestions(confirmAll ? questions : questions.slice(0, 50));
      } else {
        setPracticeQuestions(questions);
      }
      toast.success("Start Practice Questions");
      setPracticeMode(true);
    } else if (role === "Admin") {
      toast.error("Admin cannot practice question");
      router.push("./user/admin/dashboard");
    } else if (role === "unauthorized") {
      toast.error("You have to Login first to start practice");
      router.push("./account/Login");
    }
  };

  // ── Practice mode ─────────────────────────────────────────────
  if (practiceMode) {
    return (
      <div className={`${styles.content} ${isOpen ? "" : styles.hide}`}>
        <PracticeComponent
          questions={practiceQuestions}
          onBackToView={() => {
            setPracticeMode(false);
            setPracticeQuestions([]);
          }}
        />
      </div>
    );
  }

  // ── Normal view ───────────────────────────────────────────────
  return (
    <div className={`${styles.content} ${isOpen ? "" : styles.hide}`}>

      {/* ── Action Bar ─────────────────────────────────────────── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnPractice} onClick={handleStartPractice}>
            <i className="bi bi-pencil-fill" aria-hidden="true"></i>
            Start Practice
          </button>
          <button className={styles.btnExam} onClick={handleOpenExamDialog}>
            <i className="bi bi-clipboard2-check-fill" aria-hidden="true"></i>
            Take Exam
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search questions…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className={styles.select}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <button
          className={styles.btnClear}
          onClick={() => {
            setSearchTerm("");
            setDifficulty("");
          }}
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i>
          Clear
        </button>
      </div>

      {/* ── Questions List ─────────────────────────────────────── */}
      <div>
        {isLoading || !subjectId || !topicId ? (
          <div className="d-flex justify-content-center py-5">
            <Loader height={40} width={40} size={40} />
          </div>
        ) : questions && questions.length > 0 ? (
          <>
            <p className={styles.resultsLabel}>
              {questions.length} question{questions.length !== 1 ? "s" : ""} found
              {difficulty && ` · ${difficulty}`}
              {debouncedSearch && ` · "${debouncedSearch}"`}
            </p>

            {questions.map((question) => (
              <article key={question._id} className={styles.questionCard}>

                {/* Question header row */}
                <div className={styles.questionHeader}>
                  <h6 className={styles.questionText}>
                    {question.questionText}
                  </h6>
                  <div className="d-flex flex-column align-items-end gap-1">
                    {question.difficulty && (
                      <DifficultyBadge difficulty={question.difficulty} />
                    )}
                    <span className={styles.badgeType}>
                      {question.questionType}
                    </span>
                  </div>
                </div>

                {/* MCQ Options */}
                {question.questionType === "MCQ" && (
                  <div className={styles.optionsList}>
                    {question.options.map((option, index) => {
                      const isCorrect = option === question.correctAnswer.trim();
                      return (
                        <div
                          key={index}
                          className={`${styles.optionRow} ${isCorrect ? styles.optionCorrect : ""}`}
                        >
                          <input
                            type="radio"
                            checked={isCorrect}
                            readOnly
                          />
                          <label>{option}</label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Descriptive Answer */}
                {question.questionType === "Descriptive" && (
                  <div className={styles.descriptiveAnswer}>
                    <strong>Answer: </strong>
                    {question.correctAnswer}
                  </div>
                )}

                {/* Explanation toggle */}
                <button
                  className={styles.btnExplanation}
                  onClick={() => toggleExplanation(question._id)}
                >
                  <i
                    className={`bi ${expandedQuestionId === question._id ? "bi-eye-slash" : "bi-eye"}`}
                    aria-hidden="true"
                  ></i>
                  {expandedQuestionId === question._id
                    ? "Hide Explanation"
                    : "Show Explanation"}
                </button>

                {/* Explanation panel */}
                {expandedQuestionId === question._id && (
                  <div className={styles.explanation}>
                    <p className={styles.explanationText}>
                      <strong>Explanation: </strong>
                      {question.explanation}
                    </p>
                  </div>
                )}
              </article>
            ))}

            {/* Load More */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className={styles.btnLoadMore}
              >
                {isFetchingNextPage ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading…
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle" aria-hidden="true"></i>
                    Load More
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className={styles.noQuestionsMessage}>
            <i className="bi bi-inbox" aria-hidden="true"></i>
            <p className="mb-0 fw-semibold">No questions available</p>
            <p className="small">
              {debouncedSearch || difficulty
                ? "Try adjusting your filters."
                : "Select a subject and topic to view questions."}
            </p>
          </div>
        )}
      </div>

      {/* ── Exam Dialog ─────────────────────────────────────────── */}
      <ExamDialog
        show={showExamDialog}
        handleClose={handleCloseExamDialog}
        subId={subjectId}
      />
    </div>
  );
};
