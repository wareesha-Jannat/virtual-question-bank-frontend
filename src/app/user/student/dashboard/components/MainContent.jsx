"use client";

import ExamResultDistributionChart from "../../../admin/dashboard/components/ExamResultDistributionChart.jsx";
import styles from "./MainContent.module.css";
import UserActivityChart from "../../../admin/dashboard/components/UserActivityChart.jsx";
import { toast } from "react-toastify";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useRouter } from "next/navigation.js";
import Loader from "@/app/components/Loader.jsx";
import { useQuery } from "@tanstack/react-query";

export function MainContent() {
  const initData = {
    name: "",
    practiceQuestions: 0,
    correctAnswers: 0,
    examTaken: 0,
    averagePercentage: 0,
    recentActivity: [],
    examChartData: [],
    userActivityData: [],
  };

  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-student"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/student`,
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
      if (!res.ok) throw new Error(data.message || "Failed to fetch data");
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
      <div>
        <Loader />
      </div>
    );
  }

  const statCards = [
    {
      icon: "bi-collection-play",
      iconClass: styles.statIconBlue,
      label: "Practice Questions",
      value: dashboardData.practiceQuestions,
    },
    {
      icon: "bi-check-circle",
      iconClass: styles.statIconGreen,
      label: "Correct Answers",
      value: dashboardData.correctAnswers,
    },
    {
      icon: "bi-journal-check",
      iconClass: styles.statIconAmber,
      label: "Exams Taken",
      value: dashboardData.examTaken,
    },
    {
      icon: "bi-graph-up",
      iconClass: styles.statIconRed,
      label: "Avg. Percentage",
      value: `${dashboardData.averagePercentage}%`,
    },
  ];

  return (
    <div className="container-xxl">
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <i className={`bi bi-person-workspace ${styles.welcomeIcon}`}></i>
        <div>
          <p className={styles.welcomeTitle}>
            Welcome back, {dashboardData.name || "Student"}!
          </p>
          <p className={styles.welcomeSub}>
            Here is a quick overview of your activity and progress.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.cards}>
        {statCards.map((card, i) => (
          <div key={i} className={styles.statCard}>
            <div className={`${styles.statIcon} ${card.iconClass}`}>
              <i className={`bi ${card.icon}`}></i>
            </div>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <p className={styles.sectionHeading}>
            <i className="bi bi-bar-chart-line"></i> Activity Over Time
          </p>
          <UserActivityChart data={dashboardData.userActivityData} />
        </div>
        <div className={styles.chartCard}>
          <p className={styles.sectionHeading}>
            <i className="bi bi-pie-chart"></i> Exam Results
          </p>
          <ExamResultDistributionChart data={dashboardData.examChartData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activityCard}>
        <p className={styles.sectionHeading}>
          <i className="bi bi-clock-history"></i> Recent Activity
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.action}</td>
                    <td>
                      <span className={styles.timeBadge}>
                        {formatDistanceToNow(parseISO(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan="2">No recent activity yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
