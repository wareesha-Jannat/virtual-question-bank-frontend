"use client";
import { useState } from "react";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useCreateRequestMutation } from "./mutations";
import { useInfiniteQuery } from "@tanstack/react-query";
import Loader from "@/app/components/Loader";
import styles from "../../StudentPages.module.css";

export function SupportRequest() {
  const initialFormData = {
    subject: "",
    messageText: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const debouncedSearch = useDebounce(searchTerm);
  const createRequestMutation = useCreateRequestMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    createRequestMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Request Created successfully");
          setFormData(initialFormData);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["userRequests", debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support-requests?${params.toString()}`,
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

  const requests = data?.pages.flatMap((page) => page.requests) || [];

  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-life-preserver"></i>
        </span>
        <div>
          <span className={styles.pageEyebrow}>We&apos;re here to help</span>
          <h1 className={styles.pageTitle}>Support requests</h1>
          <p className={styles.pageDescription}>
            Send a question to our support team and follow its status here.
          </p>
        </div>
      </header>

      <div className={styles.supportLayout}>
        <section className={styles.panel} aria-labelledby="create-request-title">
          <h2 id="create-request-title" className={styles.panelHeading}>
            <i className="bi bi-chat-square-text" aria-hidden="true"></i>
            Make a request for help
          </h2>
          <form onSubmit={handleSubmit} className={styles.supportForm}>
            <div className={styles.formField}>
              <label htmlFor="support-subject" className={styles.formLabel}>
                Subject
              </label>
              <input
                type="text"
                id="support-subject"
                className={styles.formInput}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="support-message" className={styles.formLabel}>
                Message
              </label>
              <textarea
                id="support-message"
                className={styles.formTextarea}
                name="messageText"
                value={formData.messageText}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.actionButton}
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send" aria-hidden="true"></i>
                    Create request
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section
          className={`${styles.panel} ${styles.supportList}`}
          aria-labelledby="support-requests-title"
        >
          <h2 id="support-requests-title" className={styles.panelHeading}>
            <i className="bi bi-inbox" aria-hidden="true"></i>
            Your support requests
          </h2>

          <div className={styles.searchToolbar}>
            <label
              className={styles.visuallyHidden}
              htmlFor="support-search"
            >
              Search support requests
            </label>
            <input
              type="text"
              id="support-search"
              className={styles.searchInput}
              placeholder="Search requests by subject or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className={styles.searchButton}
              onClick={() => refetch()}
            >
              <i className="bi bi-search" aria-hidden="true"></i>
              Search
            </button>
          </div>

          <div className={styles.tableWrap} aria-busy={isLoading}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Message</th>
                  <th scope="col">Response</th>
                  <th scope="col">Responded by</th>
                  <th scope="col">Status</th>
                  <th scope="col">Made at</th>
                  <th scope="col">Responded at</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className={styles.emptyTableCell}>
                      <Loader />
                    </td>
                  </tr>
                ) : requests.length > 0 ? (
                  requests.map((request, index) => (
                    <tr key={request._id}>
                      <td className={styles.tableCellNumber}>{index + 1}</td>
                      <td className={styles.tableCellSubject}>
                        {request.subject}
                      </td>
                      <td className={styles.tableCellText}>
                        {request.message}
                      </td>
                      <td className={styles.tableCellText}>
                        {request.responseText ? request.responseText : "N/A"}
                      </td>
                      <td className={styles.tableCellSubject}>
                        {request.respondedAdminId
                          ? request.respondedAdminId.name
                          : "N/A"}
                      </td>
                      <td className={styles.tableCellStatus}>
                        <span
                          className={`${styles.statusBadge} ${
                            request.status === "pending"
                              ? styles.statusPending
                              : styles.statusResolved
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className={styles.tableCellDate}>
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className={styles.tableCellDate}>
                        {request.status === "pending"
                          ? "N/A"
                          : formatDateTime(request.updatedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.emptyTableCell}>
                      <i className="bi bi-inbox" aria-hidden="true"></i>
                      <span>No support requests found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className={styles.tableFooter}>
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className={styles.loadMoreButton}
                aria-busy={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load more</span>
                    <i className="bi bi-arrow-down" aria-hidden="true"></i>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
