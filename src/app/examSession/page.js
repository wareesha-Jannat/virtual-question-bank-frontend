"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ExamComponent } from "./components/ExamComponent";
import { ResultComponent } from "./components/ResultComponent";
import { DetailResultComponent } from "./components/DetailResultComponent";
import Loader from "../components/Loader";

export default function ExamSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [examSession, setExamSession] = useState(null); // Holds current exam session details
  const [loading, setLoading] = useState(true); // Manages loading state for initial data
  const [resultData, setResultData] = useState(null); // Holds result data after exam submission
  const [detailResult, setDetailResult] = useState(null); // Holds detailed results for review
  const [mode, setMode] = useState("exam"); // Manages display mode: 'exam', 'result', or 'detail result'

  // Retrieve and decode exam details from URL parameters on component mount
  useEffect(() => {
    const encodedDetails = searchParams.get("examDetails");
    const storedSession = localStorage.getItem("examSession");

    if (storedSession) {
      setExamSession(JSON.parse(storedSession));
      setLoading(false); // Stop loading as we have data
      return;
    }
    if (encodedDetails) {
      try {
        const details = JSON.parse(decodeURIComponent(encodedDetails));
        handleStartExam(details); // Start the exam with provided details
      } catch (error) {
        toast.error("Failed to load exam details.");
        setLoading(false);
      }
    } else {
      toast.error("No exam details found in the URL.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      //warning before leaving the page: shows a dialog with default message asking for confirmation before leaving page
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //   beforeunload = "Don't leave my page accidentally."

  // popstate + pushState = "Don't go backward in browser history."
  useEffect(() => {
    const preventBackNavigation = () => {
      history.pushState(null, null, location.href);
    };

    window.addEventListener("popstate", preventBackNavigation);

    // Push a dummy state to block back navigation
    history.pushState(null, null, location.href);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  // Starts an exam session by sending details to the backend
  const handleStartExam = async (examDetails) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exam-sessions/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examDetails),
        },
      );
      const data = await response.json();
      console.log("exam Data", data);
      if (response.status === 401) {
        router.push("/account/Login"); // Redirect to login if not authenticated
        return;
      } else if (response.status === 201) {
        toast.success("Exam started successfully!");
        setExamSession(data); // Set exam session data on success
        localStorage.setItem("examSession", JSON.stringify(data)); // Save to local storage
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false); // Stop loading state after request completes
    }
  };

  // Handles exam submission by sending data to backend and fetching results
  const handleSubmitExam = async (submittedExamSession) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exam-sessions/${submittedExamSession._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examSession: submittedExamSession }),
        },
      );
      const data = await response.json();

      if (response.status === 200) {
        toast.success(data.message);
        localStorage.removeItem("examSession");
        router.push("./question"); // Redirect to question page if finished without detailed results
      } else if (response.status === 201) {
        toast.success(data.message);
        setResultData(data.result);
        localStorage.removeItem("examSession"); // Set result data for display
        setMode("result"); // Switch to result display mode
      }
    } catch (error) {
      toast.error("Server error in submitting exam");
    }
  };

  // Fetches detailed results of the exam session when requested
  const handleDetailResult = async (examsessionId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/detail/${examsessionId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (response.status === 200) {
        setDetailResult(data); // Set detailed result data
        setMode("detail result"); // Switch to detailed result display mode
      }
    } catch (error) {}
  };

  // Returns to result summary view from detailed result view
  const handleBackToResult = () => {
    setMode("result");
  };

  // Display loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--vqb-surface)",
        }}
      >
        <Loader />
      </div>
    );
  }

  // Display message if no exam session is available
  if (!examSession && mode === "exam") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--vqb-surface)",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "var(--vqb-surface-card)",
            border: "1px solid var(--vqb-border)",
            borderRadius: "var(--vqb-radius-lg)",
            boxShadow: "var(--vqb-shadow-lg)",
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <i
            className="bi bi-exclamation-circle"
            style={{
              fontSize: "3rem",
              color: "var(--vqb-warning)",
              display: "block",
              marginBottom: "1rem",
            }}
          ></i>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--vqb-text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            No Exam Session Found
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--vqb-text-muted)",
              lineHeight: 1.65,
              marginBottom: "1.75rem",
            }}
          >
            To start an exam, please ensure there are enough questions available
            in the question bank. At least <strong>40%</strong> of the required
            questions must match your selected criteria.
          </p>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.6rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "1.5px solid var(--vqb-border)",
              borderRadius: "var(--vqb-radius-pill)",
              background: "var(--vqb-surface-alt)",
              color: "var(--vqb-text-secondary)",
              cursor: "pointer",
            }}
            onClick={() => router.push("/question")}
          >
            <i className="bi bi-arrow-left"></i> Back to Questions
          </button>
        </div>
      </div>
    );
  }

  // Display exam component during active exam session
  if (examSession && mode === "exam") {
    return <ExamComponent examSession={examSession} onSubmitExam={handleSubmitExam} />;
  }

  // Display result component after exam is submitted
  if (resultData && mode === "result") {
    return (
      <ResultComponent
        result={resultData}
        onViewDetail={handleDetailResult}
      />
    );
  }

  // Display detailed result component for question-by-question analysis
  if (detailResult && mode === "detail result") {
    return (
      <DetailResultComponent
        exam={detailResult}
        onBack={handleBackToResult}
      />
    );
  }

  // Return null if no valid mode or data is available to render
  return null;
}
