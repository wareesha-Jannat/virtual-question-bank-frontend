import React, { useState, useEffect } from "react";

import { AddAndUpdateQuestion } from "./AddAndUpdateQuestion.jsx";
import { toast } from "react-toastify";
import { FormatList } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useDebounce } from "@/app/hooks/useDebounce.js";
import { useQuery } from "@tanstack/react-query";
import { useDeleteQuestionMutation } from "./mutations.js";
import Loader from "@/app/components/Loader.jsx";
import styles from "../../AdminPages.module.css";

export const QuestionTab = () => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [subjectList, setSubjectList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const deleteQuestionMutation = useDeleteQuestionMutation();
  const router = useRouter();

  //Subjects query
  const { data } = useSubjects();
  const subjects = data?.status === "success" ? data.subjects : [];

  const formatSubjects = async (sub) => {
    try {
      const formatedList = await FormatList(sub);
      setSubjectList(formatedList);
    } catch (err) {}
  };

  useEffect(() => {
    if (subjects) {
      formatSubjects(subjects);
    }
  }, [subjects]);
  const debouncedSearch = useDebounce(searchTerm);

  //Questions query
  const { data: queryData , isLoading} = useQuery({
    queryKey: [
      "adminQuestions",
      { currentPage, debouncedSearch, filterSubject, questionsPerPage },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: questionsPerPage,
        search: debouncedSearch,
        subjectId: filterSubject,
      });

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/questions/admin?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error(data.message || "Failed to fetch questions");
      return data;
    },
    keepPreviousData: true,
    staleTime: Infinity,
    cacheTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const totalPages = queryData?.totalPages ?? 0;
  const existingQuestions = queryData?.questions ?? [];

  const handleDelete = async (question) => {
    setDeleteQuestionId(question._id);
    deleteQuestionMutation.mutate(
      {
        questionId: question._id,
        currentPage,
        debouncedSearch,
        filterSubject,
        questionsPerPage,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
            setDeleteQuestionId(null);
          }
        },
        onError: (error) => {
          toast.error(error.message);
          setDeleteQuestionId(null);
        },
      }
    );
  };

  // Function to open the modal and load the selected question for editing
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);

    setEditingQuestion(null);
  };

  // Filter and search logic

  return (
    <>
      <section className={styles.panel} aria-labelledby="add-question-heading">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="add-question-heading" className={styles.panelTitle}>
              Add New Question
            </h2>
            <p className={styles.panelDescription}>
              Add a question and assign it to the relevant subject and topic.
            </p>
          </div>
        </div>
        <AddAndUpdateQuestion subjectList={subjectList} editMode={false} />
      </section>

      <section
        className={styles.panel}
        aria-labelledby="existing-questions-heading"
      >
        <div className={styles.panelHeader}>
          <div>
            <h2 id="existing-questions-heading" className={styles.panelTitle}>
              Existing Questions
            </h2>
            <p className={styles.panelDescription}>
              Search or filter questions to update or remove them.
            </p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={`${styles.searchField} ${styles.formField}`}>
            <span className="visually-hidden">Search by question text</span>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="text"
              className={`${styles.formControl} ${styles.searchInput}`}
              placeholder="Search by question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <label className={`${styles.filterSelect} ${styles.formField}`}>
            <span className="visually-hidden">Filter by subject</span>
            <select
              className={styles.formControl}
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">Filter by Subject</option>
              {subjectList.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`${styles.secondaryButton} ${styles.clearButton}`}
            onClick={() => {
              setSearchTerm("");
              setFilterSubject("");
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Question Text</th>
                <th scope="col">Type</th>
                <th scope="col">Difficulty Level</th>
                <th scope="col">Subject</th>
                <th scope="col">Topic</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className={styles.tableEmpty}>
                    <Loader />
                  </td>
                </tr>
              ) : existingQuestions.length > 0 ? (
                existingQuestions.map((question, index) => (
                  <tr key={question._id}>
                    <td className={styles.tableNumber}>
                      {(currentPage - 1) * questionsPerPage + (index + 1)}
                    </td>
                    <td className={`${styles.tableText} ${styles.questionText}`}>
                      {question.questionText}
                    </td>
                    <td>{question.questionType}</td>
                    <td>{question.difficultyLevel}</td>
                    <td className={styles.tableSubject}>
                      {question.subjectId?.name}
                    </td>
                    <td>{question.topicId?.name}</td>
                    <td className={styles.tableActions}>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className={styles.secondaryButton}
                          onClick={() => handleEdit(question)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.dangerButton}
                          onClick={() => handleDelete(question)}
                        >
                          {deleteQuestionId == question._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              />
                              <span>Deleting</span>
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.tableEmpty}>
                    No questions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <nav aria-label="Question directory pages">
          <ul className={styles.pagination}>
            <li
              className={`${styles.pageItem} ${
                currentPage === 1 ? styles.pageItemDisabled : ""
              }`}
            >
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={styles.pageItem}>
                <button
                  className={`${styles.pageButton} ${
                    currentPage === index + 1 ? styles.pageButtonActive : ""
                  }`}
                  aria-current={currentPage === index + 1 ? "page" : undefined}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`${styles.pageItem} ${
                currentPage === totalPages ? styles.pageItemDisabled : ""
              }`}
            >
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </section>

      {showModal && (
        <div className={styles.modalOverlay} tabIndex="-1" role="dialog">
          <div className={styles.modalDialog} role="document">
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Update Question</h2>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Close update question dialog"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </div>
              <div className={styles.modalBody}>
                <AddAndUpdateQuestion
                  subjectList={subjectList}
                  editMode={true}
                  existingQuestion={editingQuestion}
                  onUpdate={handleCloseModal}
                  queryVariables={{
                    currentPage,
                    debouncedSearch,
                    filterSubject,
                    questionsPerPage,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
