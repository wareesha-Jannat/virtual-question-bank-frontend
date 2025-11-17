"use client";
import { useState } from "react";
import { format, isValid } from "date-fns";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useCreateRequestMutation } from "./mutations";
import { useInfiniteQuery } from "@tanstack/react-query";

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

  // Handle input changes and update the formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    createRequestMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Request Created successfully");
          setFormData(initialFormData); // Reset form fields
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, status } =
    useInfiniteQuery({
      queryKey: ["userRequests", debouncedSearch],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) params.append("cursor", pageParam);
        if (debouncedSearch) params.append("search", debouncedSearch);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/support/getRequests${params}`,
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

  const requests = data?.pages.flatMap((page) => page.requests) || [];

  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <h2 className="mb-4">Support Request</h2>
        <div className="col-12">
          <h3 className="mb-3 heading">Make a Request for Help</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                name="messageText"
                value={formData.messageText}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
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
                "Create Request"
              )}
            </button>
          </form>
        </div>

        {/* Display support requests */}
        <div className="col-12 mt-5">
          <h3 className="mb-3 heading">Support Requests</h3>

          <div className="d-flex align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search requests by subject or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn btn-outline-primary ms-2"
              onClick={() => refetch()}
            >
              Search
            </button>
          </div>
          {status === "loading" && (
            <>
              <Loader />
            </>
          )}

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr className="text-nowrap">
                  <th>#</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Response</th>
                  <th>Responded By</th>
                  <th>Status</th>
                  <th>Made At</th>
                  <th>Responded At</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((request, index) => (
                    <tr key={request._id}>
                      <td>{index + 1}</td>
                      <td className="text-nowrap">{request.subject}</td>
                      <td style={{ minWidth: "200px" }}>{request.message}</td>
                      <td style={{ minWidth: "200px" }}>
                        {request.responseText ? request.responseText : "N/A"}
                      </td>
                      <td className="text-nowrap">
                        {request.respondedAdminId
                          ? request.respondedAdminId.name
                          : "N/A"}
                      </td>
                      <td>{request.status}</td>
                      <td className="text-nowrap">
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className="text-nowrap">
                        {request.status === "pending"
                          ? "N/A"
                          : formatDateTime(request.updatedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No support requests found</td>
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
}
