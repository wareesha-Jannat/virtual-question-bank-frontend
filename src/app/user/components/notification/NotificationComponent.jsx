"use client";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { useMarkAsReadMutation } from "./mutations";
import styles from "./NotificationComponent.module.css";

export function NotificationComponent() {
  const router = useRouter();
  const markAsReadMutation = useMarkAsReadMutation();
  // Fetch notifications from the backend
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
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

  // Call the function to fetch notifications
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, [data]);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-bell"></i>
        </span>
        <div>
          <span className={styles.eyebrow}>Updates</span>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.description}>
            Important messages and updates for your account.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingState} role="status" aria-label="Loading notifications">
          <div className="spinner-border" aria-hidden="true"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className={`accordion ${styles.accordion}`} id="notificationAccordion">
          {notifications.map((notification) => (
            <div
              className={`accordion-item ${styles.item}`}
              key={notification._id}
            >
              <h2
                className={`accordion-header ${styles.itemHeader}`}
                id={`heading${notification._id}`}
              >
                <button
                  className={`accordion-button ${styles.trigger} ${
                    notification.isReadBy ? "collapsed" : styles.unreadTrigger
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${notification._id}`}
                  onClick={() => markAsReadMutation.mutate(notification._id)}
                >
                  <span
                    className={`${styles.notificationIcon} ${
                      !notification.isReadBy ? styles.unreadIcon : ""
                    }`}
                    aria-hidden="true"
                  >
                    <i className="bi bi-bell"></i>
                  </span>
                  <span className={styles.notificationTitle}>
                    {notification.title}
                  </span>
                  {!notification.isReadBy && (
                    <span className={styles.newBadge}>New</span>
                  )}
                  <time className={styles.time} dateTime={notification.createdAt}>
                    {formatDistanceToNow(parseISO(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </button>
              </h2>
              <div
                id={`collapse${notification._id}`}
                className="accordion-collapse collapse"
                data-bs-parent="#notificationAccordion"
              >
                <div className={`accordion-body ${styles.body}`}>
                  {notification.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className={styles.emptyState} role="status" aria-live="polite">
          <span className={styles.emptyIcon} aria-hidden="true">
            <i className="bi bi-bell-slash"></i>
          </span>
          <h2 className={styles.emptyTitle}>You&apos;re all caught up</h2>
          <p className={styles.emptyDescription}>
            There are no notifications right now. New messages will appear here.
          </p>
        </section>
      )}
    </main>
  );
}
