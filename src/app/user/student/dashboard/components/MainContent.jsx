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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/dashboardDataStudent`,
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

  return (
    <>
      <div className="container-xxl">
        <h1>Welcome {dashboardData.name}!</h1>
        <p>Here is a quick overview of your Dashboard</p>

        {/* Cards Section */}
        <div className={styles.cards}>
          <div className="bg-info text-dark">
            <h3>
              <i className="bi bi-person h4"></i> Practice Questions
            </h3>
            <p>Total: {dashboardData.practiceQuestions}</p>
          </div>
          <div className="bg-success text-dark">
            <h3>
              <i className="bi bi-question-circle h4"></i> Correct
              answers(Practice Questions)
            </h3>
            <p>Total: {dashboardData.correctAnswers}</p>
          </div>
          <div className="bg-warning text-dark">
            <h3>
              <i className="bi bi-book h4"></i> Exam Taken
            </h3>
            <p>Total: {dashboardData.examTaken}</p>
          </div>
          <div className="bg-danger text-dark">
            <h3>
              <i className="bi bi-file-earmark-text h4"></i> Average Percentage
            </h3>
            <p>Total: {dashboardData.averagePercentage}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row mt-5 justify-content-around">
          <div className="col-md-7 mb-5">
            <UserActivityChart data={dashboardData.userActivityData} />
          </div>
          <div className="col-md-5">
            <ExamResultDistributionChart data={dashboardData.examChartData} />
          </div>
        </div>

        {/* Tables Section */}
        <div className="row mt-2">
          <div className="col-12">
            <h2>Recent Activity</h2>
            <div className="table-responsive">
              <table className="table table-hover mt-2">
                <thead className="table-primary">
                  <tr>
                    <th>Activity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <tr
                        key={index}
                        className="text-nowrap"
                        style={{ minWidth: "200px" }}
                      >
                        <td>{activity.action}</td>
                        <td>
                          {formatDistanceToNow(parseISO(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
