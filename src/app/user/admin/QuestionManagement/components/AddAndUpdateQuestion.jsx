"use client";
import { useTopics } from "@/app/hooks/useTopics";
import { FormatList } from "@/app/utils";
import { getTopics } from "@/app/utils";
import { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useAddQuestionMutation, useUpdateQuestionMutation } from "./mutations";
import Loader from "@/app/components/Loader";
import styles from "../../AdminPages.module.css";

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
      <div>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label htmlFor="questionText" className={styles.formLabel}>
              Question Text
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="questionText"
              name="questionText"
              value={formData.questionText}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="questionType" className={styles.formLabel}>
              Question Type
            </label>
            <select
              className={styles.formControl}
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
            <div id="mcqFields" className={styles.formField}>
              <div className={styles.formField}>
                <label htmlFor="options" className={styles.formLabel}>
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  className={styles.formControl}
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
          <div className={styles.formField}>
            <label htmlFor="correctAnswer" className={styles.formLabel}>
              Correct Answer
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="difficultyLevel" className={styles.formLabel}>
              Difficulty Level
            </label>
            <select
              className={styles.formControl}
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

          <div className={styles.formField}>
            <label htmlFor="subject" className={styles.formLabel}>
              Subject
            </label>
            <Select
              options={subjectList}
              className={styles.reactSelect}
              classNamePrefix="vqb"
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

          <div className={styles.formField}>
            <label htmlFor="topic" className={styles.formLabel}>
              Topic
            </label>
            <Select
              options={topicList}
              className={styles.reactSelect}
              classNamePrefix="vqb"
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

          <div className={`${styles.formField} ${styles.formWide}`}>
            <label htmlFor="explanation" className={styles.formLabel}>
              Explanation (Optional)
            </label>
            <textarea
              className={`${styles.formControl} ${styles.formTextarea}`}
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
            className={`${styles.primaryButton} ${styles.formSubmit}`}
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
  );
};
