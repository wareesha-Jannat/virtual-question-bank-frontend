import { useDebounce } from "@/app/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

export const ResultPage = ({ handleViewResult }) => {
  // State for the single search query
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["resultData", debouncedSearch],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) params.append("cursor", pageParam);
        if (debouncedSearch) params.append("search", debouncedSearch);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/getResults`,
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
    <div className="container-fluid mt-2">
      <div className="row">
        <h2 className="heading">Exam Results</h2>

        {/* Single Search Input */}
        <div className="col-12 mt-2 mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Subject or Date (MM/DD/YYYY)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-12 mt-2">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr className="text-nowrap table-success">
                  <th>#</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Topics</th>
                  <th>Percentage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results && results.length > 0 ? (
                  results.map((result, index) => (
                    <tr key={result.resultId}>
                      <td>{index + 1}</td>
                      <td className="text-nowrap">
                        {result.subjectName || "Unknown Subject"}
                      </td>
                      <td>{new Date(result.date).toLocaleDateString()}</td>
                      <td>{result.isPass ? "Pass" : "Fail"}</td>
                      <td style={{ minWidth: "200px" }}>{result.topics}</td>
                      <td>{result.percentage.toFixed(2)}%</td>
                      <td className="text-nowrap">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewResult(result.resultId)}
                        >
                          <i className="bi bi-clipboard me-2"></i>View Complete
                          Result
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn btn-info d-flex align-items-center justify-content-center gap-2 px-4 py-2 fw-semibold shadow-sm"
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
                  <span className="text-white">Load More</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
