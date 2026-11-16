"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../../../validation/schemas.jsx";
import { toast } from "react-toastify";
import { useState } from "react";
import styles from "./ProfileComponent.module.css";

export const ChangePassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setLoading(false);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("server error");
    }
  };

  return (
    <section className={styles.formCard} aria-labelledby="change-password-title">
      <h2 id="change-password-title" className={styles.sectionTitle}>
        Change password
      </h2>
      <p className={styles.sectionDescription}>
        Choose a new password to help keep your account secure.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} aria-busy={loading}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="oldPassword" className={styles.formLabel}>
              Old password
            </label>
            <div className={styles.passwordField}>
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.oldPassword)}
                aria-describedby={
                  errors.oldPassword ? "old-password-error" : undefined
                }
                {...register("oldPassword")}
                className={`${styles.formControl} ${styles.passwordInput}`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className={styles.visibilityButton}
                aria-label={showOldPassword ? "Hide old password" : "Show old password"}
                aria-pressed={showOldPassword}
              >
                <i
                  className={`bi ${showOldPassword ? "bi-eye-slash" : "bi-eye"}`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            {errors.oldPassword && (
              <span id="old-password-error" className={styles.formError} role="alert">
                {errors.oldPassword.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="newPassword" className={styles.formLabel}>
              New password
            </label>
            <div className={styles.passwordField}>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={
                  errors.newPassword ? "new-password-error" : undefined
                }
                {...register("newPassword")}
                className={`${styles.formControl} ${styles.passwordInput}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={styles.visibilityButton}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                aria-pressed={showNewPassword}
              >
                <i
                  className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            {errors.newPassword && (
              <span id="new-password-error" className={styles.formError} role="alert">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="passwordConfirmation" className={styles.formLabel}>
              Confirm new password
            </label>
            <div className={styles.passwordField}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="passwordConfirmation"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.passwordConfirmation)}
                aria-describedby={
                  errors.passwordConfirmation
                    ? "confirm-password-error"
                    : undefined
                }
                {...register("passwordConfirmation")}
                className={`${styles.formControl} ${styles.passwordInput}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.visibilityButton}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
              >
                <i
                  className={`bi ${
                    showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            {errors.passwordConfirmation && (
              <span
                id="confirm-password-error"
                className={styles.formError}
                role="alert"
              >
                {errors.passwordConfirmation.message}
              </span>
            )}
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-shield-check" aria-hidden="true"></i>
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
