"use client";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import "bootstrap/dist/css/bootstrap.min.css";
import { useQuery } from "@tanstack/react-query";
import { useMarkAsReadMutation } from "./mutations";

export function NotificationComponent() {
  const router = useRouter();
  const markAsReadMutation = useMarkAsReadMutation();
  // Fetch notifications from the backend
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/getNotifications`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch notifications");
      return data;
    },
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 2,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const notifications = data?.notifications || [];
  const userId = data?.userId || null;

  // Call the function to fetch notifications
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, [data]);

  return (
    <div className="container-xxl">
      <h2 className="mb-4">Notifications</h2>

      {isLoading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <div className="accordion" id="notificationAccordion">
          {notifications.length > 0 ? (
            notifications?.map((notification) => (
              <div
                className="accordion-item mb-3 shadow-sm"
                key={notification._id}
              >
                <h2
                  className="accordion-header"
                  id={`heading${notification._id}`}
                >
                  <button
                    className={`accordion-button ${
                      notification.isReadBy.includes(userId)
                        ? "collapsed"
                        : "bg-light"
                    } d-flex align-items-center`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${notification._id}`}
                    onClick={() => markAsReadMutation.mutate(notification._id)} // Mark as read on click
                  >
                    <i
                      className={`bi bi-bell me-3 ${
                        !notification.isReadBy.includes(userId)
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    ></i>
                    <strong>{notification.title}</strong>
                    {!notification.isReadBy.includes(userId) && (
                      <span className="badge bg-danger ms-2">New</span>
                    )}
                    <span className="ms-auto text-muted">
                      {formatDistanceToNow(parseISO(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapse${notification._id}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#notificationAccordion"
                >
                  <div className="accordion-body">{notification.message}</div>
                </div>
              </div>
            ))
          ) : (
            <div>No notifications Available</div>
          )}
        </div>
      )}
    </div>
  );
}
