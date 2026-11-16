"use client";
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FormatList } from "@/app/utils";
import { useTopics } from "@/app/hooks/useTopics";
import { useAddTopicMutation, useDeleteTopicMutation } from "./mutations";
import styles from "../../AdminPages.module.css";
export const TopicManagement = ({ subjectList }) => {
  const [selectedSubject, setSelectedSubject] = useState("");

  const [newTopic, setNewTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [delSubject, setDelSubject] = useState("");

  const addTopicMutation = useAddTopicMutation();
  const deleteTopicMutation = useDeleteTopicMutation();

  const { data } = useTopics(delSubject);
  const topics = data?.status === "success" ? data.topics : [];

  const topicList = useMemo(() => {
    return delSubject ? FormatList(topics) : [];
  }, [delSubject, topics]);

  // Handle adding a topic to a subject
  const handleAddTopic = async () => {
    addTopicMutation.mutate(
      { selectedSubject, newTopic },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Topic added successfully");
          setNewTopic("");
        },
        onError: (error) => {
          toast.error(error.message || "Something went wrong");
        },
      }
    );
  };

  // Handle deleting a topic
  const handleDeleteTopic = async () => {
    // Show a confirmation dialog before deleting
    const confirmation = window.confirm(
      "Deleting this topic will delete all its related questions. Are you sure you want to delete it?"
    );

    if (!confirmation) {
      return; // If user clicks "Cancel", stop the delete operation
    }
    deleteTopicMutation.mutate(selectedTopic, {
      onSuccess: (data) => {
        toast.success(data.message || "Topic added successfully");
        setSelectedTopic(null);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
    });
  };

  // Unified form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const buttonName = e.nativeEvent.submitter.name;
    switch (buttonName) {
      case "addTopic":
        await handleAddTopic();
        break;
      case "deleteTopic":
        await handleDeleteTopic();
        break;
      default:
    }
  };

  const handleSubjectSelectChange = (selectedOption) => {
    setSelectedSubject(selectedOption.value);
  };

  const handleDelSubjectChange = (selectedOption) => {
    setDelSubject(selectedOption.value);
  };

  const handleTopicSelectChange = (selectedOption) => {
    setSelectedTopic(selectedOption.value);
  };
  return (
    <section className={styles.panel} aria-labelledby="topics-heading">
      <div className={styles.panelHeader}>
        <div>
          <h2 id="topics-heading" className={styles.panelTitle}>
            Topic Management
          </h2>
          <p className={styles.panelDescription}>
            Add topics to subjects or remove topics that are no longer needed.
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.sectionGrid} ${styles.topicGrid}`}
      >
        <div className={styles.topicOperation}>
          <h3 className={`${styles.panelTitle} ${styles.topicOperationTitle}`}>
            Add New Topic
          </h3>
          <div className={styles.formField}>
            <label
              htmlFor="select-subject-for-topic"
              className={styles.formLabel}
            >
              Select Subject
            </label>
            <Select
              options={subjectList}
              id="select-subject-for-topic"
              autoComplete="off"
              isSearchable
              onChange={handleSubjectSelectChange}
              className={styles.reactSelect}
              classNamePrefix="vqb"
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="topic" className={styles.formLabel}>
              Topic
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              disabled={!selectedSubject}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className={styles.secondaryButton}
            name="addTopic"
            disabled={
              !newTopic || !selectedSubject || addTopicMutation.isPending
            }
          >
            {addTopicMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg" aria-hidden="true" />
                <span>Add Topic</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.topicOperation}>
          <h3 className={`${styles.panelTitle} ${styles.topicOperationTitle}`}>
            Delete Topic
          </h3>
          <div className={styles.formField}>
            <label
              htmlFor="select-subject-to-delete-topic"
              className={styles.formLabel}
            >
              Select Subject
            </label>
            <Select
              options={subjectList}
              value={
                subjectList.find((option) => option.value === delSubject) ||
                null
              }
              id="select-subject-to-delete-topic"
              autoComplete="off"
              isSearchable
              onChange={handleDelSubjectChange}
              className={styles.reactSelect}
              classNamePrefix="vqb"
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="select-topic" className={styles.formLabel}>
              Select Topic to Delete
            </label>
            <Select
              options={topicList}
              value={
                topicList.find((option) => option.value === selectedTopic) ||
                null
              }
              id="select-topic"
              isSearchable
              autoComplete="off"
              onChange={handleTopicSelectChange}
              isDisabled={!delSubject}
              className={styles.reactSelect}
              classNamePrefix="vqb"
            />
          </div>
          <button
            className={styles.dangerButton}
            type="submit"
            name="deleteTopic"
            disabled={
              !delSubject || !selectedTopic || deleteTopicMutation.isPending
            }
          >
            {deleteTopicMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <i className="bi bi-trash" aria-hidden="true" />
                <span>Delete Topic</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
