"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUserData } from "@/app/hooks/useUserData";
import { useUpdatePersonalInfoMutation } from "./mutations";
export const PersonalInfo = () => {
  const router = useRouter();
  //fetchData
  const { data } = useUserData();
  const userData = data?.user || null;
  const updateInfoMutation = useUpdatePersonalInfoMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "Female", // default value
  });

  useEffect(() => {
    if (userData) {
      const initialFormData = {
        name: userData?.name,
        email: userData?.email,
        age: userData?.age,
        gender: userData?.gender,
      };
      setFormData(initialFormData);
    }
  }, [userData]);

  //handle Form change

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };
  //handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    updateInfoMutation.mutate(
      { userId: userData._id, formData },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
          }
        },
        onError: (err) => {
          if (err.message === "UNAUTHORIZED") {
            toast.error(err.message);
            router.push("/");
          }
        },
      }
    );
  };

  return (
    <>
      <div className="container mt-4">
        <div className="row  ">
          <h4 className="heading">Personal Information</h4>
          <div className="card p-4 shadow-sm mt-3">
            <div className="col-11">
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
                    value={formData?.name}
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
                    value={formData?.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="age" className="form-label">
                    Age
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="age"
                    name="age"
                    value={formData?.age}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    className="form-select"
                    id="gender"
                    name="gender"
                    value={formData?.gender}
                    onChange={handleFormChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={updateInfoMutation.isPending}
                >
                  {updateInfoMutation.isPending ? (
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
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
