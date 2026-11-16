"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BarChartComponent } from "@/app/user/admin/analyticsAndReporting/components/BarChartComponent";
import { PieChartComponent } from "@/app/user/admin/analyticsAndReporting/components/PieChartComponent";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader";
import styles from "../../StudentPages.module.css";

const EmptyState = () => (
  <div className={styles.emptyState} role="status">
    <i className="bi bi-bar-chart" aria-hidden="true"></i>
    <p>No Data</p>
  </div>
);

export const PerformanceComponent = () => {
  const initData = {
    examTakenPerSubject: [],
    practiceQuestionStats: [],
    examPerformance: [],
    overallScores: [],
  };

  const [currentPageSubject, setCurrentPageSubject] = useState(1);
  const [currentPagePerformance, setCurrentPagePerformance] = useState(1);
  const [itemsPerPage] = useState(5);

  const router = useRouter();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["performanceData"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insights/performance`,
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
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const performanceData = data || initData;
  const indexOfLastPageSubject = currentPageSubject * itemsPerPage;
  const indexOfFirstPageSubject = indexOfLastPageSubject - itemsPerPage;
  const paginatedSubjects = performanceData.examTakenPerSubject?.slice(
    indexOfFirstPageSubject,
    indexOfLastPageSubject,
  );

  const indexOfLastPagePerformance = currentPagePerformance * itemsPerPage;
  const indexOfFirstPagePerformance = indexOfLastPagePerformance - itemsPerPage;
  const paginatedPerformance = performanceData.examPerformance?.slice(
    indexOfFirstPagePerformance,
    indexOfLastPagePerformance,
  );

  const totalPagesSubject = Math.ceil(
    performanceData.examTakenPerSubject.length / itemsPerPage,
  );
  const totalPagesPerformance = Math.ceil(
    performanceData.examPerformance.length / itemsPerPage,
  );
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-graph-up-arrow"></i>
        </span>
        <div>
          <span className={styles.pageEyebrow}>Your progress</span>
          <h1 className={styles.pageTitle}>Performance overview</h1>
          <p className={styles.pageDescription}>
            Review your practice activity and exam performance.
          </p>
        </div>
      </header>

      <div className={styles.performanceGrid}>
        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <h2 className={styles.panelHeading}>
            <i className="bi bi-journal-check" aria-hidden="true"></i>
            Exams taken per subject
          </h2>
          <div className={styles.chartCanvas}>
            {!isError && paginatedSubjects && paginatedSubjects.length > 0 ? (
              <BarChartComponent data={paginatedSubjects} />
            ) : (
              <EmptyState />
            )}
          </div>
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => setCurrentPageSubject(currentPageSubject - 1)}
              disabled={currentPageSubject === 1}
            >
              <i className="bi bi-arrow-left" aria-hidden="true"></i>
              Previous
            </button>
            <span className={styles.pageNumber}>
              Page {currentPageSubject} of {totalPagesSubject}
            </span>
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => setCurrentPageSubject(currentPageSubject + 1)}
              disabled={currentPageSubject === totalPagesSubject}
            >
              Next
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <h2 className={styles.panelHeading}>
            <i className="bi bi-pie-chart" aria-hidden="true"></i>
            Practice questions: correct vs. incorrect
          </h2>
          <div className={styles.chartCanvas}>
            {!isError && performanceData.practiceQuestionStats.length > 0 ? (
              <PieChartComponent
                data={performanceData.practiceQuestionStats}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <h2 className={styles.panelHeading}>
            <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
            Exam performance by subject
          </h2>
          <div className={styles.chartCanvas}>
            {!isError && paginatedPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paginatedPerformance}>
                  <XAxis dataKey="subjectName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="correctAnswers"
                    fill="#82ca9d"
                    name="Correct Answers"
                  />
                  <Bar
                    dataKey="incorrectAnswers"
                    fill="#ff8042"
                    name="Incorrect Answers"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() =>
                setCurrentPagePerformance(currentPagePerformance - 1)
              }
              disabled={currentPagePerformance === 1}
            >
              <i className="bi bi-arrow-left" aria-hidden="true"></i>
              Previous
            </button>
            <span className={styles.pageNumber}>
              Page {currentPagePerformance} of {totalPagesPerformance}
            </span>
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() =>
                setCurrentPagePerformance(currentPagePerformance + 1)
              }
              disabled={currentPagePerformance === totalPagesPerformance}
            >
              Next
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <h2 className={styles.panelHeading}>
            <i className="bi bi-trophy" aria-hidden="true"></i>
            Overall scores: average, highest, lowest
          </h2>
          <div className={styles.chartCanvas}>
            {!isError && performanceData.overallScores.length > 0 ? (
              <BarChartComponent data={performanceData.overallScores} />
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
