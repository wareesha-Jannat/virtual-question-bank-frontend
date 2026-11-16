"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddAndUpdateUser } from "./AddAndUpdateUser.jsx";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { useDeleteUserMutation } from "./mutations.js";
import { useDebounce } from "@/app/hooks/useDebounce.js";
import Loader from "@/app/components/Loader.jsx";
import styles from "../../AdminPages.module.css";

export function UserManagement() {
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search
  const [filterRole, setFilterRole] = useState(""); // State for role filter
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const [deleteUserId, setDeleteUserId] = useState(null);

  const router = useRouter();

  const debouncedSearch = useDebounce(searchTerm);
  const deleteUserMutation = useDeleteUserMutation();
  const usersPerPage = 5;

  //Questions query
  const { data: queryData, isLoading } = useQuery({
    queryKey: [
      "users",
      { currentPage, debouncedSearch, filterRole, usersPerPage },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: usersPerPage,
        search: debouncedSearch,
        role: filterRole,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/?${params.toString()}`,
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
      if (!res.ok) throw new Error(data.message || "Failed to fetch questions");
      return data;
    },
    keepPreviousData: true,
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

  const totalPages = queryData?.totalPages ?? 0;
  const existingUsers = queryData?.users ?? [];

  const handleDelete = async (user) => {
    setDeleteUserId(user._id);
    deleteUserMutation.mutate(
      {
        userId: user._id,
        currentPage,
        debouncedSearch,
        filterRole,
        usersPerPage,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
            setDeleteUserId(null);
          }
        },
        onError: (error) => {
          toast.error(data.message);
          setDeleteUserId(null);
        },
      },
    );
  };

  const handleEdit = (user) => {
    setEditingUser(user); // Set the user to be edited
    setShowModal(true); // Show modal
  };

  const handleCloseModal = () => {
    setEditingUser(null); // Reset the editing user
    setShowModal(false);
  };

  // Pagination logic

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-people" />
        </span>
        <div>
          <span className={styles.eyebrow}>Administration</span>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageDescription}>
            Manage accounts, roles, and access to the question bank.
          </p>
        </div>
      </header>

      <section className={styles.panel} aria-labelledby="add-user-heading">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="add-user-heading" className={styles.panelTitle}>
              Add a user
            </h2>
            <p className={styles.panelDescription}>
              Create an account and assign its application role.
            </p>
          </div>
        </div>
        <AddAndUpdateUser />
      </section>

      <section className={styles.panel} aria-labelledby="users-list-heading">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="users-list-heading" className={styles.panelTitle}>
              User directory
            </h2>
            <p className={styles.panelDescription}>
              Search, filter, and manage existing accounts.
            </p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={`${styles.searchField} ${styles.formField}`}>
            <span className="visually-hidden">Search by name or email</span>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name or email"
              className={`${styles.formControl} ${styles.searchInput}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <label className={`${styles.filterSelect} ${styles.formField}`}>
            <span className="visually-hidden">Filter by role</span>
            <select
              className={styles.formControl}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
            </select>
          </label>
          <button
            className={`${styles.secondaryButton} ${styles.clearButton}`}
            onClick={() => {
              setSearchTerm("");
              setFilterRole("");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className={styles.tableEmpty}>
                    <Loader />
                  </td>
                </tr>
              ) : existingUsers.length > 0 ? (
                existingUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td className={styles.tableNumber}>
                      {(currentPage - 1) * usersPerPage + (index + 1)}
                    </td>
                    <td className={styles.tableSubject}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className={styles.tableStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          user.isActive
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.tableActions}>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className={styles.secondaryButton}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.dangerButton}
                          onClick={() => handleDelete(user)}
                          disabled={deleteUserMutation.isPending}
                        >
                          {deleteUserId == user._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.tableEmpty}>
                    No users available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <nav aria-label="User directory pages">
          <ul className={styles.pagination}>
            <li
              className={`${styles.pageItem} ${
                currentPage === 1 ? styles.pageItemDisabled : ""
              }`}
            >
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={styles.pageItem}>
                <button
                  className={`${styles.pageButton} ${
                    currentPage === index + 1 ? styles.pageButtonActive : ""
                  }`}
                  aria-current={currentPage === index + 1 ? "page" : undefined}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`${styles.pageItem} ${
                currentPage === totalPages ? styles.pageItemDisabled : ""
              }`}
            >
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </section>

      {showModal && (
        <div className={styles.modalOverlay} tabIndex="-1" role="dialog">
          <div
            className={`${styles.modalDialog} modal-dialog-scrollable`}
            role="document"
          >
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Update User</h2>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Close update user dialog"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </div>
              <div className={styles.modalBody}>
                <AddAndUpdateUser
                  editMode={true}
                  existingUser={editingUser}
                  onUpdate={handleCloseModal}
                  queryVariables={{
                    currentPage,
                    debouncedSearch,
                    filterRole,
                    usersPerPage,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
