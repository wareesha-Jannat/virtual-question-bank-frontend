"use client";

import ExamResultDistributionChart from "./ExamResultDistributionChart.jsx";
import styles from "./MainContent.module.css";
import UserActivityChart from "./UserActivityChart.jsx";
import { toast } from "react-toastify";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useRouter } from "next/navigation.js";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader.jsx";

export function MainContent() {
  const initData = {
    name: "",
    users: 0,
    questions: 0,
    subjects: 0,
    examsTaken: 0,
    recentActivity: [],
    examChartData: [],
    userActivityData: [],
  };
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/admin`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch dashboard data");
      return data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const dashboardData = data || initData;
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader />
      </div>
    );
  }

  const statCards = [
    {
      icon: "bi-people",
      iconClass: styles.statIconBlue,
      label: "Total users",
      value: dashboardData.users,
    },
    {
      icon: "bi-patch-question",
      iconClass: styles.statIconGreen,
      label: "Questions",
      value: dashboardData.questions,
    },
    {
      icon: "bi-journal-bookmark",
      iconClass: styles.statIconAmber,
      label: "Subjects",
      value: dashboardData.subjects,
    },
    {
      icon: "bi-file-earmark-check",
      iconClass: styles.statIconRed,
      label: "Exams taken",
      value: dashboardData.examsTaken,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section
        className={styles.welcomeBanner}
        aria-labelledby="admin-welcome-title"
      >
        <span className={styles.welcomeIcon} aria-hidden="true">
          <i className="bi bi-person-workspace"></i>
        </span>
        <div>
          <h1 id="admin-welcome-title" className={styles.welcomeTitle}>
            Welcome{dashboardData.name ? `, ${dashboardData.name}` : ""}!
          </h1>
          <p className={styles.welcomeSub}>
            Here is a quick overview of your platform.
          </p>
        </div>
      </section>

      <section className={styles.cards} aria-label="Platform statistics">
        {statCards.map((card) => (
          <article key={card.label} className={styles.statCard}>
            <span
              className={`${styles.statIcon} ${card.iconClass}`}
              aria-hidden="true"
            >
              <i className={`bi ${card.icon}`}></i>
            </span>
            <span className={styles.statBody}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={styles.chartsRow} aria-label="Dashboard analytics">
        <article className={styles.chartPanel}>
          <UserActivityChart data={dashboardData?.userActivityData} />
        </article>
        <article className={styles.chartPanel}>
          <ExamResultDistributionChart data={dashboardData?.examChartData} />
        </article>
      </section>

      <section
        className={styles.activityCard}
        aria-labelledby="recent-activity-title"
      >
        <h2 id="recent-activity-title" className={styles.sectionHeading}>
          <i className="bi bi-clock-history" aria-hidden="true"></i>
          Recent activity
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Activity</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => {
                  const userName = activity.user
                    ? activity.user.name
                    : "User Deleted";
                  const initials = userName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("");

                  return (
                    <tr key={index}>
                      <td>
                        <span className={styles.userCell}>
                          <span
                            className={styles.userAvatar}
                            aria-hidden="true"
                          >
                            {initials || "?"}
                          </span>
                          {userName}
                        </span>
                      </td>
                      <td>
                        <span className={styles.roleBadge}>{activity.role}</span>
                      </td>
                      <td>{activity.action}</td>
                      <td>
                        <time
                          className={styles.timeBadge}
                          dateTime={activity.timestamp}
                        >
                          {formatDistanceToNow(parseISO(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </time>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan="4">No recent activity</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
