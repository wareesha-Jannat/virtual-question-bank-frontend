"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddAndUpdateUser } from "./AddAndUpdateUser.jsx";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { useDeleteUserMutation } from "./mutations.js";
import { useDebounce } from "@/app/hooks/useDebounce.js";

export function UserManagement() {
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search
  const [filterRole, setFilterRole] = useState(""); // State for role filter
  const [currentPage, setCurrentPage] = useState(1); // State for pagination

  const router = useRouter();

  const debouncedSearch = useDebounce(searchTerm);
  const deleteUserMutation = useDeleteUserMutation();
  const usersPerPage = 5;

  //Questions query
  const { data: queryData } = useQuery({
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
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/users/getUsers?${params.toString()}`,
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
          }
        },
        onError: (error) => {
          toast.error(data.message);
        },
      }
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
    <div>
      {/* Add new user Component */}
      <div className="container-fluid">
        <div className="row">
          <h1>User Management</h1>
          <div className="col-12">
            <AddAndUpdateUser />
          </div>
        </div>
      </div>

      {/* Search and Filter UI */}
      <div className="mt-4">
        <div className="row">
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Search by name or email"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
              {/* Add other roles as needed */}
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setFilterRole("");
                setCurrentPage(1); // Reset to first page on filter clear
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* List of User table */}
      <div className="mt-3 container-fluid ">
        <div className="row">
          <h3 className="heading ">List of Users</h3>
          <div className="col-12 mt-2">
            <div className="table-responsive">
              <table className="table table-striped table-hover ">
                <thead>
                  <tr className="table-success text-nowrap">
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingUsers.length > 0 ? (
                    existingUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>
                          {(currentPage - 1) * usersPerPage + (index + 1)}
                        </td>
                        <td style={{ minWidth: "200px" }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? "Active" : "Inactive"}</td>
                        <td style={{ minWidth: "200px" }}>
                          <div className="d-flex  ">
                            <button
                              className="btn btn-primary btn-sm me-3"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                              onClick={() => handleDelete(user)}
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
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
                      <td colSpan="6" className="text-center">
                        No users available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bootstrap Modal for Editing user */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            style={{ marginTop: "70px" }}
            className=" modal-dialog modal-dialog-scrollable  modal-md"
          >
            <div className="modal-content">
              <div className="heading modal-header">
                <h5 className=" modal-title ms-2 fs-3">Update User </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Reuse AddAndUpdateUser Component for Editing */}
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
