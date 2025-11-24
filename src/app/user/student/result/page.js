"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { ResultPage } from "./components/ResultPage.jsx";
import { ResultComponent } from "@/app/examSession/components/ResultComponent.jsx";
import { DetailResultComponent } from "@/app/examSession/components/DetailResultComponent.jsx";
import { useQueryClient } from "@tanstack/react-query";

export default function Result() {
  const [mode, setMode] = useState("resultTable");
  const [resultData, setResultData] = useState({});
  const [detailResult, setDetailResult] = useState({});
  const queryClient = useQueryClient();

  const handleViewResult = async (resultId) => {
    const data = await queryClient.fetchQuery({
      queryKey: ["result", resultId],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/getSingleResult`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ resultId }),
          }
        );
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.message || "Failed to get result");
        return data;
      },
      staleTime: Infinity,
      cacheTime: 5 * 1000 * 60,
      onError: (err) => {
        toast.error(err.message);
      },
    });

    setResultData(data || {});
    setMode("result");
  };

  const handleBackToTable = () => {
    setMode("resultTable");
  };

  const handleDetailResult = async (examSessionId) => {
    const data = await queryClient.fetchQuery({
      queryKey: ["detailResult", examSessionId],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/detailResult`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ examSessionId }),
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to get result");
        return data;
      },
      staleTime: Infinity,
      cacheTime: 5 * 1000 * 60,
      onError: (err) => {
        toast.error(err.message);
      },
    });

    setDetailResult(data || {});
    setMode("detailResult");
  };
  //back to result

  if (mode === "resultTable") {
    return (
      <>
        <ResultPage handleViewResult={handleViewResult} />
      </>
    );
  }
  if (resultData && mode === "result") {
    return (
      <>
        <div
          className="container-fluid"
          style={{ backgroundColor: "antiquewhite" }}
        >
          <div className="row d-flex align-items-center justify-content-center p-4">
            <ResultComponent
              result={resultData}
              dashboardMode={true}
              onViewDetail={handleDetailResult}
              onBack={handleBackToTable}
            />
          </div>
        </div>
      </>
    );
  }
  if (detailResult && mode === "detailResult") {
    return (
      <div
        className="container-fluid"
        style={{ backgroundColor: "antiquewhite" }}
      >
        <div className="row d-flex align-items-center justify-content-center p-4">
          <DetailResultComponent
            exam={detailResult}
            dashboardMode={true}
            onBack={handleBackToTable}
          />
        </div>
      </div>
    );
  }
}
