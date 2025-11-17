import { useTopics } from "@/app/hooks/useTopics";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export const ExamDialog = ({ show, handleClose, subId }) => {
  const MAX_QUESTIONS = 40; // maximum number of questions allowed
  const MAX_DURATION = 60; // Maximum duration in minutes

  const router = useRouter();
  const [examDetails, setExamDetails] = useState({
    subject: "",
    subjectId: "",
    duration: "",
    totalQuestions: "",
    difficulty: "All",
    questionType: "MCQ", // Default question type
    selectedTopics: [],
  });

  const { data } = useTopics(subId);

  const topicList = data?.status === "success" ? data.topics : [];

  const [errorMessage, setErrorMessage] = useState(""); // Holds error messages for validation
  const [maxQuestions, setMaxQuestions] = useState(MAX_QUESTIONS); 

  // Update subject and subjectId based on topicList when available
  useEffect(() => {
    if (topicList.length > 0) {
      setExamDetails((prev) => ({
        ...prev,
        subject: topicList[0].subjectId.name || "",
        subjectId: topicList[0].subjectId._id || "",
      }));
    }
  }, [topicList]);

  // Toggle topic selection for the exam
  const handleTopicToggle = (topicId) => {
    setExamDetails((prev) => {
      const selectedTopics = prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter((id) => id !== topicId) // Remove if already selected
        : [...prev.selectedTopics, topicId]; // Add if not selected

      return { ...prev, selectedTopics };
    });
  };

  // Handle form field changes, including validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate the totalQuestions input
    if (name === "totalQuestions" && value > maxQuestions) {
      setErrorMessage(
        `The maximum number of questions allowed is ${maxQuestions}.`
      );
    } else {
      setErrorMessage("");
    }
    // Validate the totalQuestions input
    if (name === "duration" && value > MAX_DURATION) {
      setErrorMessage(`The maximum duration allowed is ${MAX_DURATION}.`);
    } else {
      setErrorMessage("");
    }

    setExamDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Update the maximum number of questions based on duration and selected question type
  useEffect(() => {
    let max;

    if (examDetails.questionType === "MCQ") {
      max = 35;
    } else if (examDetails.questionType === "Descriptive") {
      max = 23;
    } else if (examDetails.questionType === "Both") {
      // A mix of MCQs and Descriptive
      const mcqQuestions = 25;
      const descriptiveQuestions = 5;
      max = mcqQuestions + descriptiveQuestions;
    }

    setMaxQuestions(Math.min(max, MAX_QUESTIONS)); // Limit by MAX_QUESTIONS
  }, [examDetails.questionType]);

  // Handle form submission to start the exam
  const handleSubmit = (e) => {
    e.preventDefault();

    // Additional validation before starting the exam
    if (examDetails.duration > MAX_DURATION) {
      setErrorMessage(
        `Please enter a duration less than or equal to ${MAX_DURATION} minutes.`
      );
      return;
    }

    if (examDetails.totalQuestions > maxQuestions) {
      setErrorMessage(
        `Please enter a number less than or equal to ${maxQuestions}.`
      );
      return;
    }

    if (examDetails.selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.");
      return;
    }

    // Pass the exam details to start the exam and close the dialog
    handleStartExam(examDetails);
    handleClose();
  };
  // Start the exam by passing exam details
  const handleStartExam = async (examDetails) => {
    // Convert the examDetails object to a JSON string
    const jsonString = encodeURIComponent(JSON.stringify(examDetails));
    // Navigate to the /examSession page
    router.push(`/examSession?examDetails=${jsonString}`);
  };

  if (!show) return null;

  return (
    <div
      className="modal  show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content" style={{ backgroundColor: "#f4f7fc " }}>
          <div className="modal-header heading ">
            <h5 className="modal-title ms-2 fs-3">Start Exam</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Subject */}
              <div className="mb-4">
                <label htmlFor="subject" className="form-label ">
                  Subject
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={examDetails.subject}
                  readOnly
                />
              </div>

              {/* Topics Selection */}
              <div className="mb-4">
                <label htmlFor="topics" className="form-label">
                  Select Topics
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {topicList.map((topic) => (
                    <button
                      key={topic._id}
                      type="button"
                      className={`btn ${
                        examDetails.selectedTopics.includes(topic._id)
                          ? "btn-secondary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleTopicToggle(topic._id)}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
                {errorMessage && (
                  <div className="text-danger mt-2">{errorMessage}</div>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label htmlFor="duration" className="form-label">
                  Duration (in minutes, max {MAX_DURATION})
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="duration"
                  name="duration"
                  value={examDetails.duration}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()} // Prevents scrolling behavior
                  max={MAX_DURATION}
                  required
                />
              </div>

              {/* Total Questions */}
              <div className="mb-4">
                <label htmlFor="totalQuestions" className="form-label">
                  Total Questions (Max {maxQuestions})
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="totalQuestions"
                  name="totalQuestions"
                  value={examDetails.totalQuestions}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()} // Prevents scrolling behavior
                  max={maxQuestions}
                  required
                />
              </div>

              {/* Question Type */}
              <div className="mb-4">
                <label htmlFor="questionType" className="form-label">
                  Question Type
                </label>
                <select
                  className="form-select"
                  id="questionType"
                  name="questionType"
                  value={examDetails.questionType}
                  onChange={handleChange}
                >
                  <option value="MCQ">MCQs Only</option>
                  <option value="Descriptive">Descriptive Only</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="mb-4">
                <label htmlFor="difficulty" className="form-label">
                  Difficulty Level
                </label>
                <select
                  className="form-select"
                  id="difficulty"
                  name="difficulty"
                  value={examDetails.difficulty}
                  onChange={handleChange}
                >
                  <option value="All">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-center mt-4">
                <button type="submit" className="btn btn-success w-100">
                  Start Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
