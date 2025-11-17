import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { FormatList } from "@/app/utils";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useAddSubjectMutation, useDeleteSubjectMutation } from "./mutations";
import { TopicManagement } from "./TopicManagement";

export const SubjectTab = () => {
  // Stores the list of subjects
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subject, setSubject] = useState("");

  const addSubjectMutation = useAddSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();

  const { data } = useSubjects();
  const subjects = data?.status === "success" ? data.subjects : [];

  const subjectList = useMemo(() => FormatList(subjects), [subjects]);

  // Handle adding a new subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    addSubjectMutation.mutate(subject, {
      onSuccess: (data) => {
        toast.success(data.message || "Subject added successfully");
        setSubject("");
      },
      onError: (error) => {
        toast.error(error.message || "cannot add subject");
      },
    });
  };

  //Fetching Subjects

  const handleSelectChange = (selectedOption) => {
    setSelectedSubject(selectedOption.value);
  };

  // Handle deleting a subject
  const handleDeleteSubject = async (e) => {
    e.preventDefault();
    // Show a confirmation dialog before deleting
    const confirmation = window.confirm(
      "Deleting this subject will delete all its topics and related questions. Are you sure you want to delete it?"
    );

    if (!confirmation) {
      return; // If user clicks "Cancel", stop the delete operation
    }

    deleteSubjectMutation.mutate(selectedSubject, {
      onSuccess: (data) => {
        toast.success(data.message || "Subject deleted successfully");
        setSelectedSubject(null);
      },
      onError: (err) => {
        toast.error(err.message || "cannot delete subject");
      },
    });
  };

  return (
    <div className="mt-4">
      {/* Add New Subject */}
      <h3 className="heading">Add New Subject</h3>
      <form onSubmit={handleAddSubject}>
        <label htmlFor="subject" className="form-label">
          Subject
        </label>
        <input
          type="text"
          className="form-control"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter Subject Name"
          autoComplete="off"
          required
        />
        <button
          type="submit"
          disabled={addSubjectMutation.isPending}
          className="btn btn-primary mt-2 d-flex align-items-center gap-2"
        >
          {addSubjectMutation.isPending ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span>Adding</span>
            </>
          ) : (
            "Add Subject"
          )}
        </button>
      </form>

      {/* Delete Subject */}
      <div className="mt-4">
        <h3 className="heading">Delete Subject</h3>
        <form onSubmit={handleDeleteSubject}>
          <label htmlFor="delete-subject" className="form-label">
            Subject
          </label>
          <Select
            options={subjectList}
            value={
              subjectList.find((option) => option.value === selectedSubject) ||
              null
            }
            id="delete-subject"
            onChange={handleSelectChange}
            placeholder="Enter Subject to Delete"
            isSearchable
            autoComplete="off"
            required
          />

          <button
            type="submit"
            className="btn btn-danger mt-2 d-flex align-items-center gap-2"
            disabled={!selectedSubject || deleteSubjectMutation.isPending}
          >
            {deleteSubjectMutation ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Subject"
            )}
          </button>
        </form>
      </div>

      <TopicManagement subjectList={subjectList} />
    </div>
  );
};
