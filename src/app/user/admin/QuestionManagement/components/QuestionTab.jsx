import React, { useState, useEffect } from "react";

import { AddAndUpdateQuestion } from "./AddAndUpdateQuestion.jsx";
import { toast } from "react-toastify";
import { FormatList } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useDebounce } from "@/app/hooks/useDebounce.js";
import { useQuery } from "@tanstack/react-query";
import { useDeleteQuestionMutation } from "./mutations.js";

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
  const { data: queryData } = useQuery({
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
        }/questions/getQuestionsByAdmin?${params.toString()}`,
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
      {/* Add New Question Component */}
      <AddAndUpdateQuestion subjectList={subjectList} editMode={false} />

      {/* Filter and Search Section */}
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)} // Update filter term
            >
              <option value="">Filter by Subject</option>
              {subjectList.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setFilterSubject("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Existing Questions Table */}
      <div className="mt-3 container-fluid ">
        <div className="row">
          <h3 className="heading">Existing Questions</h3>
          <div className="col-12 mt-2">
            <div className="table-responsive">
              <table className="table table-striped table-hover ">
                <thead>
                  <tr className="table-success text-nowrap">
                    <th>#</th>
                    <th>Question Text</th>
                    <th>Type</th>
                    <th>Difficulty Level</th>
                    <th>Subject</th>
                    <th>Topic</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingQuestions.length > 0 ? (
                    existingQuestions.map((question, index) => (
                      <tr key={question._id}>
                        <td>
                          {(currentPage - 1) * questionsPerPage + (index + 1)}
                        </td>
                        <td style={{ minWidth: "400px" }}>
                          {question.questionText}
                        </td>
                        <td>{question.questionType}</td>
                        <td>{question.difficultyLevel}</td>
                        <td>{question.subjectId?.name}</td>
                        <td>{question.topicId?.name}</td>
                        <td>
                          <div className="d-flex me-1 ">
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => handleEdit(question)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm  d-flex align-items-center gap-2"
                              onClick={() => handleDelete(question)}
                            >
                              {deleteQuestionId == question._id ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
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
                      <td colSpan="7" className="text-center">
                        No questions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bootstrap Modal for Editing Question */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{ backgroundColor: "#f4f7fc " }}
            >
              <div className="heading modal-header">
                <h5 className="modal-title ms-2 fs-3">Update Question</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
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
