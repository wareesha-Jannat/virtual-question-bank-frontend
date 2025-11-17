"use client";
import { useState, useEffect } from "react";
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

export const SupportRequestManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [responseText, setResponseText] = useState("");
  const router = useRouter();
  const debouncedSearch = useDebounce(searchTerm);

  const deleteRequestMutation = useRequestDeleteMutation();
  const saveRequestMutation = useRequestUpdateMutation();

  const { data: requestData, isError } = useQuery({
    queryKey: ["newRequests"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support/getNewRequests`,
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

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, status } =
    useInfiniteQuery({
      queryKey: ["respondedRequests", debouncedSearch],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) params.append("cursor", pageParam);
        if (debouncedSearch) params.append("search", debouncedSearch);
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/support/getRespondedRequests?${params.toString()}`,
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
      }
    );
  };

  return (
    <div className="container-fluid mt-2">
      <h2>Support Requests</h2>

      {/* Table for New Support Requests */}
      <h4 className="heading my-3">New Requests</h4>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr className="text-nowrap table-info">
              <th>#</th>
              <th>Request By</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {newRequests && newRequests.length > 0 ? (
              newRequests.map((request, index) => (
                <tr key={request._id}>
                  <td>{index + 1}</td>
                  <td className="text-nowrap">{request.userId.name}</td>
                  <td className="text-nowrap">{request.subject}</td>
                  <td style={{ minWidth: "200px" }}>{request.message}</td>

                  <td className="text-nowrap">
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td>{request.status}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRespond(request)}
                    >
                      Respond
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No new requests available
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="7" className="text-center text-danger ">
                  Error fetching requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table for Responded Requests */}
      <h4 className="heading my-3">Responded Requests</h4>
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
      <table className="table table-bordered">
        <thead>
          <tr className="text-nowrap table-success">
            <th>#</th>
            <th>Request By</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Response</th>
            <th>Date</th>
            <th>Status</th>
            <th>Responded At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {respondedRequests && respondedRequests.length > 0 ? (
            respondedRequests.map((request, index) => (
              <tr key={request._id}>
                <td>{index + 1}</td>
                <td className="text-nowrap">{request.userId.name}</td>
                <td className="text-nowrap">{request.subject}</td>
                <td style={{ minWidth: "200px" }}>{request.message}</td>
                <td style={{ minWidth: "200px" }}>
                  {request.responseText ? request.responseText : "N/A"}
                </td>
                <td style={{ minWidth: "80px" }}>
                  {formatDateTime(request.createdAt)}
                </td>
                <td>{request.status}</td>
                <td style={{ minWidth: "80px" }}>
                  {formatDateTime(request.updatedAt)}
                </td>
                <td>
                  {" "}
                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="btn btn-danger "
                  >
                    <i className="bi bi-trash "></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No responded requests available
              </td>
            </tr>
          )}
          {status === "error" && (
            <tr>
              <td colSpan="7" className="text-center text-danger">
                Error loading requests
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

      {/* Bootstrap Modal for Responding to a Request */}
      {showModal && selectedRequest && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{ backgroundColor: "#f4f7fc " }}
            >
              <div className="modal-header heading ">
                <h5 className="modal-title">Respond to Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveResponse}>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      defaultValue={selectedRequest.subject}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      name="message"
                      defaultValue={selectedRequest.message}
                      readOnly
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Response</label>
                    <textarea
                      className="form-control"
                      name="responseText"
                      placeholder="Write your response here..."
                      required
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)} // Update responseText state
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={saveRequestMutation.isPending}
                    className="btn btn-success d-flex align-items-center gap-2"
                  >
                    {saveRequestMutation.isPending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Response"
                    )}
                  </button>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
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
