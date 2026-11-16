import Loader from "@/app/components/Loader";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "../../StudentPages.module.css";

export const ResultPage = ({ handleViewResult }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["resultData", debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/results?${params.toString()}`,
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

  const results = data?.pages.flatMap((page) => page.results) || [];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageIcon} aria-hidden="true">
          <i className="bi bi-journal-check"></i>
        </span>
        <div>
          <span className={styles.pageEyebrow}>Exam history</span>
          <h1 className={styles.pageTitle}>Exam results</h1>
          <p className={styles.pageDescription}>
            Review your completed exams and open a full result when you need more detail.
          </p>
        </div>
      </header>

      <section className={`${styles.panel} ${styles.tablePanel}`}>
        <div className={styles.tableToolbar}>
          <label className={styles.visuallyHidden} htmlFor="result-search">
            Search exam results
          </label>
          <input
            type="text"
            id="result-search"
            className={styles.searchInput}
            placeholder="Search by Subject or Date (MM/DD/YYYY)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap} aria-busy={isLoading}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Subject</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Topics</th>
                <th scope="col">Percentage</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTableCell}>
                    <Loader />
                  </td>
                </tr>
              ) : results && results.length > 0 ? (
                results.map((result, index) => (
                  <tr key={result.resultId}>
                    <td className={styles.tableCellNumber}>{index + 1}</td>
                    <td className={styles.tableCellSubject}>
                      {result.subjectName || "Unknown Subject"}
                    </td>
                    <td className={styles.tableCellDate}>
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className={styles.tableCellStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          result.isPass ? styles.statusPass : styles.statusFail
                        }`}
                      >
                        {result.isPass ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className={styles.tableCellTopics}>{result.topics}</td>
                    <td className={styles.tableCellPercentage}>
                      {result.percentage.toFixed(2)}%
                    </td>
                    <td className={styles.tableCellAction}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => handleViewResult(result.resultId)}
                      >
                        <i className="bi bi-clipboard" aria-hidden="true"></i>
                        View complete result
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.emptyTableCell}>
                    <i className="bi bi-inbox" aria-hidden="true"></i>
                    <span>No results found.</span>
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
  );
};
