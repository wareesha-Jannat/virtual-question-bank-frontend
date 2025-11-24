"use client";
import { useState, useEffect } from "react";
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

export const PerformanceComponent = () => {
  // State to store fetched data
  const initData = {
    examTakenPerSubject: [],
    practiceQuestionStats: [],
    examPerformance: [],
    overallScores: [],
  };

  // Pagination states for the examTakenPerSubject and examPerformance charts
  const [currentPageSubject, setCurrentPageSubject] = useState(1);
  const [currentPagePerformance, setCurrentPagePerformance] = useState(1);
  const [itemsPerPage] = useState(5); // Number of subjects per page

  const router = useRouter();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["performanceData"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyticsAndReporting/performanceData`,
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

  // Calculate the paginated data for subjects and exam performance

  const indexOfLastPageSubject = currentPageSubject * itemsPerPage;
  const indexOfFirstPageSubject = indexOfLastPageSubject - itemsPerPage;
  const paginatedSubjects = performanceData.examTakenPerSubject?.slice(
    indexOfFirstPageSubject,
    indexOfLastPageSubject
  );

  const indexOfLastPagePerformance = currentPagePerformance * itemsPerPage;
  const indexOfFirstPagePerformance = indexOfLastPagePerformance - itemsPerPage;
  const paginatedPerformance = performanceData.examPerformance?.slice(
    indexOfFirstPagePerformance,
    indexOfLastPagePerformance
  );

  // Calculate total pages for both paginated performanceData
  const totalPagesSubject = Math.ceil(
    performanceData.examTakenPerSubject.length / itemsPerPage
  );
  const totalPagesPerformance = Math.ceil(
    performanceData.examPerformance.length / itemsPerPage
  );
  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Performance Overview</h3>

      {/* Exam Taken Per Subject Bar Chart */}
      <div className="mb-4">
        <h5 className="heading mb-3">Exams Taken Per Subject</h5>

        {!isError && paginatedSubjects && paginatedSubjects.length > 0 ? (
          <BarChartComponent data={paginatedSubjects} />
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
        {/* Pagination for Subjects */}
        <div className="d-flex justify-content-between mt-2">
          <button
            className="btn btn-primary"
            onClick={() => setCurrentPageSubject(currentPageSubject - 1)}
            disabled={currentPageSubject === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPageSubject} of {totalPagesSubject}
          </span>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentPageSubject(currentPageSubject + 1)}
            disabled={currentPageSubject === totalPagesSubject}
          >
            Next
          </button>
        </div>
      </div>

      {/* Practice Questions Correct vs Incorrect Pie Chart */}
      <div className="mb-4">
        <h5 className="heading mb-3">
          Practice Questions: Correct vs Incorrect
        </h5>

        {!isError && performanceData.practiceQuestionStats.length > 0 ? (
          <PieChartComponent data={performanceData.practiceQuestionStats} />
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

      {/* Exam Performance Per Session Bar Chart */}
      <div className="mb-4">
        <h5 className="heading mb-3">Exam Performance Per Subject</h5>
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

        {/* Pagination for Performance */}
        <div className="d-flex justify-content-between mt-2">
          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentPagePerformance(currentPagePerformance - 1)
            }
            disabled={currentPagePerformance === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPagePerformance} of {totalPagesPerformance}
          </span>
          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentPagePerformance(currentPagePerformance + 1)
            }
            disabled={currentPagePerformance === totalPagesPerformance}
          >
            Next
          </button>
        </div>
      </div>

      {/* Overall Scores Bar Chart */}
      <div className="mb-4">
        <h5 className="heading mb-3">
          Overall Scores: Average, Highest, Lowest
        </h5>

        {!isError && performanceData.overallScores.length > 0 ? (
          <BarChartComponent data={performanceData.overallScores} />
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
