import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { BarChartComponent } from "./BarChartComponent";
import { PieChartComponent } from "./PieChartComponent";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader";
import styles from "../../AdminPages.module.css";

export const Analytics = () => {
  // State to store the fetched data

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 4; // Number of subjects per page

  const router = useRouter();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insights/analytics`,
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
        throw new Error(data.message || "Failed to get analytics data");

      return data;
    },
    staleTime: Infinity,
    cacheTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });
  const questionUsageData = data?.questionUsageData ?? [];
  const userEngagementData = data?.userEngagementData ?? [];
  const performanceData = data?.performanceData ?? [];
  const totalSubjects = data?.questionUsageData.length ?? 0;
  // Fetch data from the backend

  // Calculate the current subjects to display
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = questionUsageData?.slice(
    indexOfFirstSubject,
    indexOfLastSubject
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalSubjects / subjectsPerPage);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.chartGrid}>
        <section
          className={`${styles.chartPanel} ${styles.chartWide}`}
          aria-labelledby="question-usage-heading"
        >
          <div className={styles.panelHeader}>
            <div>
              <h2 id="question-usage-heading" className={styles.panelTitle}>
                Question Usage
              </h2>
              <p className={styles.panelDescription}>
                Questions organized by subject.
              </p>
            </div>
          </div>
          <div className={styles.chartCanvas}>
            {!isError && currentSubjects && currentSubjects.length > 0 ? (
              <BarChartComponent data={currentSubjects} />
            ) : (
              <div className={styles.emptyState}>
                <i className="bi bi-bar-chart" aria-hidden="true" />
                <p className="mb-0">No Data</p>
              </div>
            )}
          </div>
          <div className={styles.chartPagination}>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>

        <section
          className={styles.chartPanel}
          aria-labelledby="user-engagement-heading"
        >
          <div className={styles.panelHeader}>
            <h2 id="user-engagement-heading" className={styles.panelTitle}>
              User Engagement
            </h2>
          </div>
          <div className={styles.chartCanvas}>
            {!isError && userEngagementData.length > 0 ? (
              <PieChartComponent data={userEngagementData} />
            ) : (
              <div className={styles.emptyState}>
                <i className="bi bi-pie-chart" aria-hidden="true" />
                <p className="mb-0">No Data</p>
              </div>
            )}
          </div>
        </section>

        <section
          className={styles.chartPanel}
          aria-labelledby="performance-metrics-heading"
        >
          <div className={styles.panelHeader}>
            <h2 id="performance-metrics-heading" className={styles.panelTitle}>
              Performance Metrics
            </h2>
          </div>
          <div className={styles.chartCanvas}>
            {!isError && performanceData.length > 0 ? (
              <BarChartComponent data={performanceData} />
            ) : (
              <div className={styles.emptyState}>
                <i className="bi bi-graph-up" aria-hidden="true" />
                <p className="mb-0">No Data</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
