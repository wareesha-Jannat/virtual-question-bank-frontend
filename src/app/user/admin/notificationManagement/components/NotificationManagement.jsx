"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "../../AdminPages.module.css";

export function NotificationManagement() {
  const initialFormData = {
    title: "",
    message: "",
    receiver: "users",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  // Handle input changes and update the formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Send the notification to the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Reset form fields
        setFormData(initialFormData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-bell" />
        </span>
        <div>
          <span className={styles.eyebrow}>Administration</span>
          <h1 className={styles.pageTitle}>Notification Management</h1>
          <p className={styles.pageDescription}>
            Compose and deliver updates to the right audience.
          </p>
        </div>
      </header>

      <section className={styles.panel} aria-labelledby="create-notification">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="create-notification" className={styles.panelTitle}>
              Create and send notification
            </h2>
            <p className={styles.panelDescription}>
              Choose a concise title, message, and recipient group.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="notification-title" className={styles.formLabel}>
              Title
            </label>
            <input
              id="notification-title"
              type="text"
              className={styles.formControl}
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formField}>
            <label htmlFor="notification-receiver" className={styles.formLabel}>
              Receivers
            </label>
            <select
              id="notification-receiver"
              className={styles.formControl}
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
              required
            >
              <option value="users">All Users</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
            </select>
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label htmlFor="notification-message" className={styles.formLabel}>
              Message
            </label>
            <textarea
              id="notification-message"
              className={`${styles.formControl} ${styles.formTextarea}`}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className={`${styles.primaryButton} ${styles.formSubmit}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <i className="bi bi-send" aria-hidden="true" />
                <span>Send Notification</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
