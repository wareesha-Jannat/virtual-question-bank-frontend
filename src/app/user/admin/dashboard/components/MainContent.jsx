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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard/dashboardData`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <h2>Welcome {dashboardData?.name}!</h2>
        <p>Here is a quick overview of your Dashboard</p>

        {/* Cards Section */}
        <div className={styles.cards}>
          <div className="bg-info text-dark">
            <h3>
              <i className="bi bi-person h3"></i> Users
            </h3>
            <p>Total: {dashboardData?.users}</p>
          </div>
          <div className="bg-success text-dark">
            <h3>
              <i className="bi bi-question-circle h3"></i> Questions
            </h3>
            <p>Total: {dashboardData?.questions}</p>
          </div>
          <div className="bg-warning text-dark">
            <h3>
              <i className="bi bi-book h3"></i> Subjects
            </h3>
            <p>Total: {dashboardData?.subjects}</p>
          </div>
          <div className="bg-danger text-dark">
            <h3>
              <i className="bi bi-file-earmark-text h3"></i> Exams Taken
            </h3>
            <p>Total: {dashboardData?.examsTaken}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row mt-5 justify-content-around">
          <div className="col-md-7 mb-5">
            <UserActivityChart data={dashboardData?.userActivityData} />
          </div>
          <div className="col-md-5">
            <ExamResultDistributionChart data={dashboardData?.examChartData} />
          </div>
        </div>

        {/* Tables Section */}
        <div className="row mt-2">
          <div className="col-12">
            <h2>Recent Activity</h2>
            <div className="table-responsive">
              <table className="table table-hover mt-3">
                <thead className="table-primary">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Activity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <tr
                        key={index}
                        className="text-nowrap"
                        style={{ minWidth: "200px" }}
                      >
                        <td>
                          {activity.user ? activity.user.name : "User Deleted"}
                        </td>
                        <td>{activity.role}</td>
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
