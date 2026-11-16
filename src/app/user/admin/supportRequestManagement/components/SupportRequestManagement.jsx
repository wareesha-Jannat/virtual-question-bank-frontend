"use client";
import { useState } from "react";
import { isValid, format } from "date-fns";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader";
import { useDebounce } from "@/app/hooks/useDebounce";
import {
  useRequestDeleteMutation,
  useRequestUpdateMutation,
} from "./mutations";
import styles from "../../AdminPages.module.css";

export const SupportRequestManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [responseText, setResponseText] = useState("");
  const router = useRouter();
  const debouncedSearch = useDebounce(searchTerm);

  const deleteRequestMutation = useRequestDeleteMutation();
  const saveRequestMutation = useRequestUpdateMutation();

  const {
    data: requestData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["newRequests"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support-requests?type=new`,
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
      if (!res.ok) throw new Error(data.message || "Failed to fetch requests");
      return data;
    },
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 5,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const newRequests = requestData?.newRequests || [];

  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    status,
    isLoading: loading,
  } = useInfiniteQuery({
    queryKey: ["respondedRequests", debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/support-requests?type=responded&${params.toString()}`,
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
      if (!res.ok) throw new Error("Failed to get responded requests");
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const respondedRequests = data?.pages.flatMap((page) => page.requests) || [];

  // Function to open the modal for a specific request
  const handleRespond = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setResponseText(""); // Reset response text on close
  };

  // Function to handle form submission using FormData
  const handleSaveResponse = async (e) => {
    e.preventDefault();

    // Create an object to send to the backend
    const requestData = {
      requestId: selectedRequest._id,
      responseText: responseText,
    };

    saveRequestMutation.mutate(requestData, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          handleCloseModal();
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  };

  const handleDeleteRequest = (reqId) => {
    deleteRequestMutation.mutate(
      { reqId, debouncedSearch },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message || "Request deleted successfully");
          }
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-life-preserver" />
        </span>
        <div>
          <span className={styles.eyebrow}>Administration</span>
          <h1 className={styles.pageTitle}>Support Requests</h1>
          <p className={styles.pageDescription}>
            Respond to new requests and review resolved conversations.
          </p>
        </div>
      </header>

      <section className={styles.panel} aria-labelledby="new-requests-heading">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="new-requests-heading" className={styles.panelTitle}>
              New Requests
            </h2>
            <p className={styles.panelDescription}>
              Requests awaiting an administrator response.
            </p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.supportTable}`}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Request By</th>
                <th scope="col">Subject</th>
                <th scope="col">Message</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className={styles.tableEmpty}>
                    <Loader />
                  </td>
                </tr>
              ) : newRequests && newRequests.length > 0 ? (
                newRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td className={styles.tableNumber}>{index + 1}</td>
                    <td className={styles.tableSubject}>
                      {request.userId.name}
                    </td>
                    <td className={styles.tableSubject}>{request.subject}</td>
                    <td className={styles.supportText}>{request.message}</td>
                    <td className={styles.tableDate}>
                      {formatDateTime(request.createdAt)}
                    </td>
                    <td className={styles.tableStatus}>
                      <span
                        className={`${styles.statusBadge} ${styles.statusPending}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className={styles.tableActions}>
                      <button
                        className={styles.primaryButton}
                        onClick={() => handleRespond(request)}
                      >
                        <i className="bi bi-reply" aria-hidden="true" />
                        Respond
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.tableEmpty}>
                    No new requests available
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan="7" className={styles.tableEmpty}>
                    Error fetching requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className={styles.panel}
        aria-labelledby="responded-requests-heading"
      >
        <div className={styles.panelHeader}>
          <div>
            <h2 id="responded-requests-heading" className={styles.panelTitle}>
              Responded Requests
            </h2>
            <p className={styles.panelDescription}>
              Search previously handled requests and review responses.
            </p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={`${styles.searchField} ${styles.formField}`}>
            <span className="visually-hidden">
              Search requests by subject or message
            </span>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="text"
              className={`${styles.formControl} ${styles.searchInput}`}
              placeholder="Search requests by subject or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <button
            className={styles.secondaryButton}
            onClick={() => refetch()}
          >
            Search
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.supportTable}`}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Request By</th>
                <th scope="col">Subject</th>
                <th scope="col">Message</th>
                <th scope="col">Response</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Responded At</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.tableEmpty}>
                    <Loader />
                  </td>
                </tr>
              ) : respondedRequests && respondedRequests.length > 0 ? (
                respondedRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td className={styles.tableNumber}>{index + 1}</td>
                    <td className={styles.tableSubject}>
                      {request?.userId?.name}
                    </td>
                    <td className={styles.tableSubject}>
                      {request?.subject}
                    </td>
                    <td className={styles.supportText}>{request?.message}</td>
                    <td className={styles.supportText}>
                      {request?.responseText ? request?.responseText : "N/A"}
                    </td>
                    <td className={styles.tableDate}>
                      {formatDateTime(request?.createdAt)}
                    </td>
                    <td className={styles.tableStatus}>
                      <span
                        className={`${styles.statusBadge} ${styles.statusResolved}`}
                      >
                        {request?.status}
                      </span>
                    </td>
                    <td className={styles.tableDate}>
                      {formatDateTime(request?.updatedAt)}
                    </td>
                    <td className={styles.tableActions}>
                      <button
                        onClick={() => handleDeleteRequest(request._id)}
                        className={styles.dangerButton}
                        aria-label={`Delete request from ${request?.userId?.name || "user"}`}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.tableEmpty}>
                    No responded requests available
                  </td>
                </tr>
              )}
              {status === "error" && (
                <tr>
                  <td colSpan="9" className={styles.tableEmpty}>
                    Error loading requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={`${styles.loadMoreButton} mt-3`}
          >
            {isFetchingNextPage ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More</span>
            )}
          </button>
        )}
      </section>

      {showModal && selectedRequest && (
        <div className={styles.modalOverlay} tabIndex="-1" role="dialog">
          <div className={styles.modalDialog} role="document">
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Respond to Request</h2>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Close response dialog"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </div>
              <div className={styles.modalBody}>
                <form onSubmit={handleSaveResponse}>
                  <div className={`${styles.formField} mb-3`}>
                    <label className={styles.formLabel}>Subject</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      name="subject"
                      defaultValue={selectedRequest.subject}
                      readOnly
                    />
                  </div>
                  <div className={`${styles.formField} mb-3`}>
                    <label className={styles.formLabel}>Message</label>
                    <textarea
                      className={`${styles.formControl} ${styles.formTextarea}`}
                      name="message"
                      defaultValue={selectedRequest.message}
                      readOnly
                    />
                  </div>
                  <div className={`${styles.formField} mb-3`}>
                    <label className={styles.formLabel}>Response</label>
                    <textarea
                      className={`${styles.formControl} ${styles.formTextarea}`}
                      name="responseText"
                      placeholder="Write your response here..."
                      required
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saveRequestMutation.isPending}
                    className={styles.primaryButton}
                  >
                    {saveRequestMutation.isPending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Response"
                    )}
                  </button>
                </form>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
