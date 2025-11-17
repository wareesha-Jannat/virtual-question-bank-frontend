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
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exams/startExam`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examDetails),
        }
      );
      const data = await response.json();

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exams/finishExam`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examSession: submittedExamSession }),
        }
      );
      const data = await response.json();

      if (response.status === 200) {
        toast.success(data.message);
        localStorage.removeItem("examSession");
        router.push("./question"); // Redirect to question page if finished without detailed results
      } else if (response.status === 201) {
        toast.success(data.message);
        setResultData(data.populatedResult);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/detailResult`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examSessionId: examsessionId }),
        }
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
      <div className="container-xxl text-center mt-5">
        <h2>
          <Loader />
        </h2>
      </div>
    );
  }

  // Display message if no exam session is available
  // Display message if no exam session is available
  if (!examSession && mode === "exam") {
    return (
      <div className="container-xxl text-center mt-5">
        <h2>No Exam Session Found</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto", marginTop: "10px" }}>
          To start an exam, please ensure there are enough questions available
          in the question bank. At least <strong>40%</strong> of the required
          questions must match your selected criteria.
        </p>

        <button
          className="btn btn-secondary mt-4"
          onClick={() => router.push("/question")}
        >
          Back to Questions
        </button>
      </div>
    );
  }

  // Display exam component during active exam session
  if (examSession && mode === "exam") {
    return (
      <div
        className="container-fluid d-flex align-items-center justify-content-center "
        style={{ backgroundColor: "antiquewhite" }}
      >
        <div className="row d-flex container-xxl align-items-center justify-content-center p-4">
          <ExamComponent
            examSession={examSession}
            onSubmitExam={handleSubmitExam}
          />
        </div>
      </div>
    );
  }

  // Display result component after exam is submitted
  if (resultData && mode === "result") {
    return (
      <div
        className="container-fluid d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "antiquewhite" }}
      >
        <div className="row d-flex container-xxl align-items-center justify-content-center p-4">
          <ResultComponent
            result={resultData}
            onViewDetail={handleDetailResult}
          />
        </div>
      </div>
    );
  }

  // Display detailed result component for question-by-question analysis
  if (detailResult && mode === "detail result") {
    return (
      <div
        className="container-fluid d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "antiquewhite" }}
      >
        <div className="row container-xxl d-flex align-items-center justify-content-center p-4">
          <DetailResultComponent
            exam={detailResult}
            onBack={handleBackToResult}
          />
        </div>
      </div>
    );
  }

  // Return null if no valid mode or data is available to render
  return null;
}
