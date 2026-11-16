"use client";

import Link from "next/link";
import styles from "../../../Auth.module.css";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordConfirmSchema } from "../../../../validation/schemas.jsx";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRole } from "@/app/components/RoleProvider.jsx";

export default function ResetPasswordConfirm() {
  const router = useRouter();
  const { id, token } = useParams();
  const { role } = useRole();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (role === "Admin") {
      router.push("/user/admin/dashboard");
    } else if (role === "Student") {
      router.push("/user/student/dashboard");
    }
  }, [role]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordConfirmSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/reset-password/${id}/${token}`,
        {
          method: "PATCH",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        router.push("/account/Login");
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("server error");
    }
  };
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-confirm-title">
        <header className={styles.header}>
          <span className={styles.brand} aria-hidden="true">
            <i className="bi bi-shield-lock"></i>
          </span>
          <span className={styles.eyebrow}>Account recovery</span>
          <h1 id="reset-confirm-title" className={styles.title}>Choose a new password</h1>
          <p className={styles.description}>Create a password you haven&apos;t used here before.</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              New password <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                placeholder="Enter a new password"
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "reset-password-error" : "reset-password-hint"}
                {...register("password")}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputInvalid : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.visibilityButton}
                aria-label={showPassword ? "Hide new password" : "Show new password"}
                aria-pressed={showPassword}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.password ? (
              <span id="reset-password-error" className={styles.error} role="alert">
                {errors.password.message}
              </span>
            ) : (
              <p id="reset-password-hint" className={styles.fieldHint}>
                Use at least 5 characters.
              </p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="passwordConfirmation" className={styles.label}>
              Confirm new password <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="passwordConfirmation"
                autoComplete="new-password"
                placeholder="Enter the new password again"
                aria-required="true"
                aria-invalid={Boolean(errors.passwordConfirmation)}
                aria-describedby={errors.passwordConfirmation ? "reset-confirm-error" : undefined}
                {...register("passwordConfirmation")}
                className={`${styles.input} ${styles.passwordInput} ${errors.passwordConfirmation ? styles.inputInvalid : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.visibilityButton}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                aria-pressed={showConfirmPassword}
              >
                <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.passwordConfirmation && (
              <span id="reset-confirm-error" className={styles.error} role="alert">
                {errors.passwordConfirmation.message}
              </span>
            )}
          </div>
          <button type="submit" className={styles.primaryButton}>
            Save new password
          </button>
        </form>
        <p className={styles.footer}>
          Need to return?
          <Link href="/account/Login" className={styles.link}>Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
