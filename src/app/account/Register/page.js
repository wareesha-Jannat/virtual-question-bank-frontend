"use client";
import styles from "../Auth.module.css";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { registerSchema } from "../../validation/schemas.jsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "@/app/components/RoleProvider";

export default function Register() {
  const router = useRouter();
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
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register`,
        {
          method: "POST",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        reset();
        router.push("/account/Login");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("server error, please try again");
    }
  };
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="register-title">
        <header className={styles.header}>
          <span className={styles.brand} aria-hidden="true">
            <i className="bi bi-journal-check"></i>
          </span>
          <span className={styles.eyebrow}>Virtual Question Bank</span>
          <h1 id="register-title" className={styles.title}>Create your account</h1>
          <p className={styles.description}>Get started with your personalized learning space.</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="name"
              autoComplete="name"
              placeholder="Your name"
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              {...register("name")}
              className={`${styles.input} ${errors.name ? styles.inputInvalid : ""}`}
            />
            {errors.name && (
              <span id="register-name-error" className={styles.error} role="alert">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              {...register("email")}
              className={`${styles.input} ${errors.email ? styles.inputInvalid : ""}`}
            />
            {errors.email && (
              <span id="register-email-error" className={styles.error} role="alert">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                placeholder="Create a password"
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-error" : "register-password-hint"}
                {...register("password")}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputInvalid : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.visibilityButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.password ? (
              <span id="register-password-error" className={styles.error} role="alert">
                {errors.password.message}
              </span>
            ) : (
              <p id="register-password-hint" className={styles.fieldHint}>
                Use at least 5 characters.
              </p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="passwordConfirmation" className={styles.label}>
              Confirm password <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="passwordConfirmation"
                autoComplete="new-password"
                placeholder="Enter your password again"
                aria-required="true"
                aria-invalid={Boolean(errors.passwordConfirmation)}
                aria-describedby={errors.passwordConfirmation ? "register-confirm-error" : undefined}
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
              <span id="register-confirm-error" className={styles.error} role="alert">
                {errors.passwordConfirmation.message}
              </span>
            )}
          </div>
          <button type="submit" className={styles.primaryButton}>
            Create account
          </button>
        </form>
        <p className={styles.footer}>
          Already have an account?
          <Link href="/account/Login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
