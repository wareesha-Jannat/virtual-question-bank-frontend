import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { BarChartComponent } from "./BarChartComponent";
import { PieChartComponent } from "./PieChartComponent";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

export const Analytics = () => {
  // State to store the fetched data

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 4; // Number of subjects per page

  const router = useRouter();

  const { data, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyticsAndReporting/analyticsData`,
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

  return (
    <div>
      <h3 className="mb-4 heading">Analytics Overview</h3>

      {/* Question Usage Bar Chart */}
      <div className="mb-4">
        <h5>Question Usage</h5>
        {!isError && currentSubjects.length > 0 ? (
          <BarChartComponent data={currentSubjects} />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center bg-light border rounded p-4 mt-3"
            style={{ height: "100%" }}
          >
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-danger fs-3 mb-2"></i>
              <p className="text-danger fw-semibold mb-0">No Data</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary me-2"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1} // Disable on the first page
        >
          Previous
        </button>
        <span className="me-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages} // Disable on the last page
        >
          Next
        </button>
      </div>

      {/* User Engagement Pie Chart */}
      <div className="mb-4">
        <h5 className="headingQuestion">User Engagement</h5>
        {!isError && userEngagementData.length > 0 ? (
          <PieChartComponent data={userEngagementData} />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center bg-light border rounded p-4 mt-3"
            style={{ height: "100%" }}
          >
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-danger fs-3 mb-2"></i>
              <p className="text-danger fw-semibold mb-0">No Data</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Bar Chart */}
      <div className="mb-4">
        <h5 className="headingQuestion mb-4">Performance Metrics</h5>
        {!isError && performanceData.length > 0 ? (
          <BarChartComponent data={performanceData} />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center bg-light border rounded p-4 mt-3"
            style={{ height: "100%" }}
          >
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-danger fs-3 mb-2"></i>
              <p className="text-danger fw-semibold mb-0">No Data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
