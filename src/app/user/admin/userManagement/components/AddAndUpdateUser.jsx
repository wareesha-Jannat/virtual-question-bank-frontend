"use client";

import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { useAddUserMutation, useUpdateUserMutation } from "./mutations";
import styles from "../../AdminPages.module.css";

export const AddAndUpdateUser = ({
  editMode = false, // Check if it's an update
  existingUser = null, // Optional: question to update
  onUpdate, // Optional: function to handle the update
  queryVariables,
}) => {
  const initialFormData = {
    name: "",
    email: "",
    role: "Student",
  };

  const [formData, setFormData] = useState(initialFormData);
 
  const addUserMutation = useAddUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  // Pre-fill form data when editing a question
  useEffect(() => {
    if (editMode && existingUser) {
      const updateFormData = {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      };

      setFormData(updateFormData);
    }
  }, [editMode, existingUser]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      // If editing, call the update function
      updateUserMutation.mutate(
        { userId: existingUser._id, formData, ...queryVariables },
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
     

      addUserMutation.mutate(formData, {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
        
            setFormData(initialFormData);
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
          <div className={styles.formField}>
            <label htmlFor="name" className={styles.formLabel}>
              Name
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              type="email"
              className={styles.formControl}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="role" className={styles.formLabel}>
              Role
            </label>
            <select
              className={styles.formControl}
              id="role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              required
            >
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <button
            type="submit"
            className={`${styles.primaryButton} ${styles.formSubmit}`}
            name="addQuestion"
            disabled={addUserMutation.isPending || updateUserMutation.isPending}
          >
            {editMode ? (
              updateUserMutation.isPending ? (
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
            ) : addUserMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Adding...</span>
              </>
            ) : (
              "Add User"
            )}
          </button>
        </form>
      </div>
  );
};
