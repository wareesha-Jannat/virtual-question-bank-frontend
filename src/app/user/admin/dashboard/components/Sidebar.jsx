import Link from "next/link";
import styles from "./Sidebar.module.css";
import { toast } from "react-toastify";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import "bootstrap-icons/font/bootstrap-icons.css";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/app/components/RoleProvider";

export const Sidebar = ({ isOpen }) => {
  const router = useRouter();
  const { role, setRole } = useRole();
  const pathname = usePathname(); // Get the current path
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/logout`,
        {
          method: "POST",
          credentials: "include", // required to set cookies
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        queryClient.clear();
        setRole("Unauthorized");
        router.push("/");
        return;
      }
      if (!res.ok) {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error occurred, try again");
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? "" : styles.sidebarClosed}`}>
      <ul>
        <li
          className={pathname === "/user/admin/dashboard" ? styles.Active : ""}
        >
          <Link
            href="/user/admin/dashboard"
            className="d-flex align-items-center"
          >
            <i className="bi bi-grid-fill me-2"></i> Dashboard
          </Link>
        </li>

        <li
          className={
            pathname === "/user/admin/userManagement" ? styles.Active : ""
          }
        >
          <Link
            href="/user/admin/userManagement"
            className="d-flex align-items-center"
          >
            <i className="bi bi-people-fill me-2"></i> User Management
          </Link>
        </li>

        <li
          className={
            pathname === "/user/admin/QuestionManagement" ? styles.Active : ""
          }
        >
          <Link
            href="/user/admin/QuestionManagement"
            className="d-flex align-items-center"
          >
            <i className="bi bi-question-circle-fill me-2"></i> Question
            Management
          </Link>
        </li>

        <li
          className={
            pathname === "/user/admin/notificationManagement"
              ? styles.Active
              : ""
          }
        >
          <Link
            href="/user/admin/notificationManagement"
            className="d-flex align-items-center"
          >
            <i className="bi bi-bell-fill me-2"></i> Notification Management
          </Link>
        </li>

        <li
          className={
            pathname === "/user/admin/analyticsAndReporting"
              ? styles.Active
              : ""
          }
        >
          <Link
            href="/user/admin/analyticsAndReporting"
            className="d-flex align-items-center"
          >
            <i className="bi bi-bar-chart-fill me-2"></i> Analytics And
            Reporting
          </Link>
        </li>

        <li
          className={
            pathname === "/user/admin/supportRequestManagement"
              ? styles.Active
              : ""
          }
        >
          <Link
            href="/user/admin/supportRequestManagement"
            className="d-flex align-items-center"
          >
            <i className="bi bi-life-preserver me-2"></i> Support Requests
            Management
          </Link>
        </li>

        <li>
          <button
            onClick={handleLogout}
            className="btn text-white fw-bold text-start w-100"
          >
            <i className="bi bi-box-arrow-right fs-5 me-2"></i> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};
