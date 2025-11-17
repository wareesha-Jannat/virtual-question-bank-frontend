"use client";
import { useTopics } from "@/app/hooks/useTopics";
import { FormatList } from "@/app/utils";
import { getTopics } from "@/app/utils";
import { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useAddQuestionMutation, useUpdateQuestionMutation } from "./mutations";
import Loader from "@/app/components/Loader";

export const AddAndUpdateQuestion = ({
  subjectList,
  editMode = false, // Check if it's an update
  existingQuestion = null, // Optional: question to update
  queryVariables,
  onUpdate,
}) => {
  const initialFormData = {
    questionText: "",
    questionType: "MCQ",
    options: "",
    correctAnswer: "",
    difficultyLevel: "Easy",
    subject: "",
    topic: "",
    explanation: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const addQuestionMutation = useAddQuestionMutation();
  const updateQuestionMutation = useUpdateQuestionMutation();

  const subjectIdForTopics = editMode
    ? existingQuestion.subjectId._id
    : formData.subject;

  const { data: topicsData } = useTopics(subjectIdForTopics);

  // Format the topics when fetched
  const topicList =
    topicsData?.status === "success" ? FormatList(topicsData.topics) : [];

  // Pre-fill form data when editing a question
  useEffect(() => {
    if (editMode && existingQuestion) {
      let updateFormData;

      if (existingQuestion.questionType === "MCQ") {
        updateFormData = {
          questionText: existingQuestion.questionText,
          questionType: existingQuestion.questionType,
          options: Array.isArray(existingQuestion.options)
            ? existingQuestion.options.join(", ")
            : "",
          correctAnswer: existingQuestion.correctAnswer,
          difficultyLevel: existingQuestion.difficultyLevel,
          subject: existingQuestion.subjectId._id,
          topic: existingQuestion.topicId._id,
          explanation: existingQuestion.explanation,
        };
      } else {
        updateFormData = {
          questionText: existingQuestion.questionText,
          questionType: existingQuestion.questionType,
          correctAnswer: existingQuestion.correctAnswer,
          difficultyLevel: existingQuestion.difficultyLevel,
          subject: existingQuestion.subjectId._id,
          topic: existingQuestion.topicId._id,
          explanation: existingQuestion.explanation,
        };
      }
      setFormData(updateFormData);
    }
  }, [editMode, existingQuestion]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData((formData) => ({
      ...formData,
      [name]: selectedOption.value,
    }));
  };

  //Handle Add Question
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Converting options string into array if it's not already an array
    if (formData.questionType === "MCQ" && !Array.isArray(formData.options)) {
      formData.options = formData.options
        .split(",")
        .map((option) => option.trim());

      // Options validation (without altering the stored values)
      const normalizedCorrectAnswer = formData.correctAnswer
        .trim()
        .toLowerCase();
      const normalizedOptions = formData.options.map((option) =>
        option.trim().toLowerCase()
      );

      if (
        formData.questionType === "MCQ" &&
        !normalizedOptions.includes(normalizedCorrectAnswer)
      ) {
        toast.error("Correct option must be one of the options provided");
        return;
      }
    }

    let questionPayload;
    // Question payload
    if (formData.questionType === "MCQ") {
      questionPayload = formData;
    } else {
      questionPayload = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        correctAnswer: formData.correctAnswer,
        difficultyLevel: formData.difficultyLevel,
        subject: formData.subject,
        topic: formData.topic,
        explanation: formData.explanation,
      };
    }

    if (editMode) {
      // If editing, call the update function
      updateQuestionMutation.mutate(
        {
          questionId: existingQuestion._id,
          questionPayload,
          ...queryVariables,
        },
        {
          onSuccess: (data) => {
            if (data.success) {
              toast.success(data.message);
              onUpdate();
            }
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      addQuestionMutation.mutate(questionPayload, {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
          }
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  return (
    <>
      <div className="mt-4 ">
        {editMode ? "" : <h3 className="heading"> Add New Question</h3>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="questionText" className="form-label">
              Question Text
            </label>
            <input
              type="text"
              className="form-control"
              id="questionText"
              name="questionText"
              value={formData.questionText}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="questionType" className="form-label">
              Question Type
            </label>
            <select
              className="form-select"
              id="questionType"
              name="questionType"
              value={formData.questionType}
              onChange={handleFormChange}
              required
            >
              <option value="MCQ">MCQ</option>
              <option value="Descriptive">Descriptive</option>
            </select>
          </div>

          {formData.questionType === "MCQ" && (
            <div id="mcqFields">
              <div className="mb-3">
                <label htmlFor="options" className="form-label">
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="options"
                  name="options"
                  value={formData.options}
                  onChange={handleFormChange}
                  placeholder="Option1, Option2, Option3"
                  required
                />
              </div>
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="correctAnswer" className="form-label">
              Correct Answer
            </label>
            <input
              type="text"
              className="form-control"
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="difficultyLevel" className="form-label">
              Difficulty Level
            </label>
            <select
              className="form-select"
              id="difficultyLevel"
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleFormChange}
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="subject" className="form-label">
              Subject
            </label>
            <Select
              options={subjectList}
              className="form-control"
              id="subject"
              name="subject"
              value={
                subjectList.find(
                  (option) => option.value === formData.subject
                ) || null
              }
              onChange={handleSelectChange}
              isSearchable
              placeholder="Enter a subject"
              autoComplete="off"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="topic" className="form-label">
              Topic
            </label>
            <Select
              options={topicList}
              className="form-control"
              id="topic"
              name="topic"
              value={
                topicList.find((option) => option.value === formData.topic) ||
                null
              }
              onChange={handleSelectChange}
              placeholder="Enter a topic"
              autoComplete="off"
              isSearchable
              isDisabled={!formData.subject}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="explanation" className="form-label">
              Explanation (Optional)
            </label>
            <textarea
              className="form-control"
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleFormChange}
              rows="3"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={
              updateQuestionMutation.isPending || addQuestionMutation.isPending
            }
            className="btn btn-success d-flex align-items-center gap-2"
          >
            {editMode ? (
              updateQuestionMutation.isPending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )
            ) : addQuestionMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Adding...</span>
              </>
            ) : (
              "Add question"
            )}
          </button>
        </form>
      </div>
    </>
  );
};
