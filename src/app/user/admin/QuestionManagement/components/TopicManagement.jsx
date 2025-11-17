"use client";
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FormatList } from "@/app/utils";
import { useTopics } from "@/app/hooks/useTopics";
import { useAddTopicMutation, useDeleteTopicMutation } from "./mutations";
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
    <>
      {/* Add Topic */}
      <div className="mt-4">
        <h3 className="heading">Add New Topic</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="select-subject-for-topic" className="form-label">
            Select Subject
          </label>
          <Select
            options={subjectList}
            id="select-subject-for-topic"
            autoComplete="off"
            isSearchable
            onChange={handleSubjectSelectChange}
          />

          <label htmlFor="topic" className="form-label mt-2">
            Topic
          </label>
          <input
            type="text"
            className="form-control"
            id="topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            disabled={!selectedSubject}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-secondary mt-2 d-flex align-items-center gap-2"
            name="addTopic"
            disabled={
              !newTopic || !selectedSubject || addTopicMutation.isPending
            }
          >
            {addTopicMutation ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Adding...</span>
              </>
            ) : (
              "Add Topic"
            )}
          </button>

          {/* Delete Topic */}

          <h3 className="heading mt-4">Delete Topic</h3>

          <label
            htmlFor="select-subject-to-delete-topic"
            className="form-label"
          >
            Select Subject
          </label>
          <Select
            options={subjectList}
            value={
              subjectList.find((option) => option.value === delSubject) || null
            }
            id="select-subject-to-delete-topic"
            autoComplete="off"
            isSearchable
            onChange={handleDelSubjectChange}
          />

          <label htmlFor="select-topic" className="form-label mt-2">
            Select Topic to Delete
          </label>
          <Select
            options={topicList}
            value={
              topicList.find((option) => option.value === selectedTopic) || null
            }
            id="select-topic"
            isSearchable
            autoComplete="off"
            onChange={handleTopicSelectChange}
            isDisabled={!delSubject}
          />

          <button
            className="btn btn-danger mt-2 d-flex align-items-center gap-2"
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
                ></span>
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Topic"
            )}
          </button>
        </form>
      </div>
    </>
  );
};
