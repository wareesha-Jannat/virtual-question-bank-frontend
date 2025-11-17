import Link from "next/link";
import styles from "./Sidebar.module.css";
import { toast } from "react-toastify";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import "bootstrap-icons/font/bootstrap-icons.css";
import { useRole } from "@/app/components/RoleProvider";
import { useQueryClient } from "@tanstack/react-query";

export const Sidebar = ({ isOpen }) => {
  const router = useRouter();
  const { role, setRole } = useRole();

  const queryClient = useQueryClient();
  const pathname = usePathname(); // Get the current path

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
      const result = await res.json();
      if (res.ok) {
        queryClient.clear();
        setRole("Unauthorized");
        router.push("/");
        return;
      }
      if (!res.ok) {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error occurred, try again");
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? "" : styles.sidebarClosed}`}>
      <ul>
        <li
          className={
            pathname === "/user/student/dashboard" ? styles.Active : ""
          }
        >
          <Link href="/user/student/dashboard">
            <i className="bi bi-grid-fill me-2"></i> Dashboard
          </Link>
        </li>

        <li
          className={
            pathname === "/user/student/performance" ? styles.Active : ""
          }
        >
          <Link href="/user/student/performance">
            <i className="bi bi-bar-chart-fill me-2"></i> Performance
          </Link>
        </li>

        <li
          className={pathname === "/user/student/result" ? styles.Active : ""}
        >
          <Link href="/user/student/result">
            <i className="bi bi-clipboard-fill me-2"></i> Result
          </Link>
        </li>

        <li
          className={
            pathname === "/user/student/supportRequest" ? styles.Active : ""
          }
        >
          <Link href="/user/student/supportRequest">
            <i className="bi bi-life-preserver me-2"></i> Support Request
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
