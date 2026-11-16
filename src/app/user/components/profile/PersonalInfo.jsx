"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUserData } from "@/app/hooks/useUserData";
import { useUpdatePersonalInfoMutation } from "./mutations";
import styles from "./ProfileComponent.module.css";
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
    <section className={styles.formCard} aria-labelledby="personal-info-title">
      <h2 id="personal-info-title" className={styles.sectionTitle}>
        Personal information
      </h2>
      <p className={styles.sectionDescription}>
        Keep the details associated with your account up to date.
      </p>
      <form onSubmit={handleSubmit} aria-busy={updateInfoMutation.isPending}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="name" className={styles.formLabel}>
              Name
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="name"
              name="name"
              value={formData?.name}
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
              value={formData?.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="age" className={styles.formLabel}>
              Age
            </label>
            <input
              type="text"
              className={styles.formControl}
              id="age"
              name="age"
              value={formData?.age}
              onChange={handleFormChange}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="gender" className={styles.formLabel}>
              Gender
            </label>
            <select
              className={styles.formControl}
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
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.primaryButton}
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
              <>
                <i className="bi bi-check2" aria-hidden="true"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
