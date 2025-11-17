"use client";

import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { useAddUserMutation, useUpdateUserMutation } from "./mutations";

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
    <>
      <div className="mt-4 ">
        {editMode ? "" : <h3 className="heading"> Add New User</h3>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              className="form-select"
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
            className="btn btn-success d-flex align-items-center gap-2"
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
    </>
  );
};
