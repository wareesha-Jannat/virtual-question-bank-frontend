"use client";
import { useState } from "react";
import { toast } from "react-toastify";

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/createNotification`,
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
    <div className="container-fluid">
      <div className="row">
        <h1 className="mb-4"> Notification Management</h1>
        <div className="col-12">
          <h3 className="mb-3 heading">Create and send notification</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Receivers</label>
              <select
                className="form-select"
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
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Notification"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
