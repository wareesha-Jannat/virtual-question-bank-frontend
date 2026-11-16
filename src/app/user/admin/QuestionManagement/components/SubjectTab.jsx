import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { FormatList } from "@/app/utils";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useAddSubjectMutation, useDeleteSubjectMutation } from "./mutations";
import { TopicManagement } from "./TopicManagement";
import styles from "../../AdminPages.module.css";

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
    <>
      <div className={`${styles.sectionGrid} ${styles.subjectGrid}`}>
        <section
          className={`${styles.panel} ${styles.subjectPanel}`}
          aria-labelledby="add-subject-heading"
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 id="add-subject-heading" className={styles.panelTitle}>
                Add New Subject
              </h2>
              <p className={styles.panelDescription}>
                Create a subject to organize questions in the bank.
              </p>
            </div>
          </div>
          <form onSubmit={handleAddSubject} className={styles.formGrid}>
            <div className={`${styles.formField} ${styles.formWide}`}>
              <label htmlFor="subject" className={styles.formLabel}>
                Subject
              </label>
              <input
                type="text"
                className={styles.formControl}
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter Subject Name"
                autoComplete="off"
                required
              />
            </div>
            <button
              type="submit"
              disabled={addSubjectMutation.isPending}
              className={`${styles.primaryButton} ${styles.formSubmit}`}
            >
              {addSubjectMutation.isPending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Adding</span>
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg" aria-hidden="true" />
                  <span>Add Subject</span>
                </>
              )}
            </button>
          </form>
        </section>

        <section
          className={`${styles.panel} ${styles.subjectPanel}`}
          aria-labelledby="delete-subject-heading"
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 id="delete-subject-heading" className={styles.panelTitle}>
                Delete Subject
              </h2>
              <p className={styles.panelDescription}>
                Deleting a subject also removes its topics and related
                questions.
              </p>
            </div>
          </div>
          <form onSubmit={handleDeleteSubject} className={styles.formGrid}>
            <div className={`${styles.formField} ${styles.formWide}`}>
              <label htmlFor="delete-subject" className={styles.formLabel}>
                Subject
              </label>
              <Select
                options={subjectList}
                value={
                  subjectList.find(
                    (option) => option.value === selectedSubject,
                  ) || null
                }
                id="delete-subject"
                onChange={handleSelectChange}
                placeholder="Enter Subject to Delete"
                isSearchable
                autoComplete="off"
                required
                className={styles.reactSelect}
                classNamePrefix="vqb"
              />
            </div>
            <button
              type="submit"
              className={`${styles.dangerButton} ${styles.formSubmit}`}
              disabled={!selectedSubject || deleteSubjectMutation.isPending}
            >
              {deleteSubjectMutation.isPending ? (
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
                  <span>Delete Subject</span>
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <TopicManagement subjectList={subjectList} />
    </>
  );
};
