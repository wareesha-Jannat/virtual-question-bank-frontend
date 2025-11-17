import { useEffect, useState, useRef, useMemo } from "react";
import Select from "react-select";
import jsPDF from "jspdf";
import { FormatList } from "@/app/utils";
import html2canvas from "html2canvas";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useTopics } from "@/app/hooks/useTopics";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const Reporting = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: subjectsData } = useSubjects();

  const subjectList = useMemo(() => {
    if (!subjectsData?.subjects) return [];
    return FormatList(subjectsData.subjects);
  }, [subjectsData]);

  // ✅ Fetch topics for selected subject
  const { data: topicsData } = useTopics(selectedSubject, {
    enabled: !!selectedSubject, // fetch only when subject is selected
  });

  const topicList = useMemo(() => {
    if (!topicsData?.topics) return [];
    return FormatList(topicsData.topics);
  }, [topicsData]);

  useEffect(() => {
    if (!selectedSubject && subjectList.length > 0) {
      setSelectedSubject(subjectList[0].value);
    }
  }, [subjectList]);

  useEffect(() => {
    if (selectedSubject && !selectedTopic && topicList.length > 0) {
      setSelectedTopic(topicList[0].value);
    }
  }, [subjectList, topicList]);

  const { data, isError } = useQuery({
    queryKey: [
      "reporting",
      { dateRange, selectedDifficulty, selectedSubject, selectedTopic },
    ],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyticsAndReporting/reportingData`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectId: selectedSubject,
            topicId: selectedTopic,
            difficulty: selectedDifficulty,
            dateRange,
          }),
        }
      );
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 5,
    enabled: !!selectedSubject && !!selectedTopic,
    onError: (err) => {
      if (err.message === "Unauthorized") {
        router.push("/account/Login");
        return;
      }
      toast.error(err.message || "Something went wrong");
    },
  });

  const scoreDistributionData = data?.scoreDistributionData || [];
  const questionWiseData = data?.questionWiseData || [];

  // Handle pagination
  const totalPages = Math.ceil(questionWiseData?.length / itemsPerPage);
  const indexOfLastQuestion = currentPage * itemsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
  const paginatedData = questionWiseData?.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  // Handle search
  const filteredData = questionWiseData?.filter(
    (item) =>
      item.questionNumber.toString().includes(searchTerm) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption.value);
  };

  const handleTopicChange = (selectedOption) => {
    setSelectedTopic(selectedOption.value);
  };

  const reportRef = useRef();

  const downloadReportAsPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    // Specify the dimensions for each PDF page
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Create the canvas and capture the report content
    const canvas = await html2canvas(reportElement, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if the content overflows the page height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save("report.pdf");
  };

  return (
    <>
      <div ref={reportRef} style={{ padding: "20px" }}>
        <h3 className="mb-4 heading">Reporting Overview</h3>

        {/* Filters */}
        <div className="mb-4 row">
          <div className="col-md-6 mb-3">
            <label>Select Subject:</label>
            <Select
              options={subjectList}
              value={
                subjectList.find(
                  (option) => option.value === selectedSubject
                ) || null
              }
              onChange={handleSubjectChange}
              isSearchable
              placeholder="Enter a subject"
              autoComplete="off"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Select Topic:</label>
            <Select
              options={topicList}
              value={
                topicList.find((option) => option.value === selectedTopic) ||
                null
              }
              onChange={handleTopicChange}
              placeholder="Enter a topic"
              autoComplete="off"
              isSearchable
              isDisabled={!selectedSubject}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Select Difficulty:</label>
            <select
              className="form-control"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label>Start Date:</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>

          <div className="col-md-3 mb-3">
            <label>End Date:</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
        </div>

        {/* Score Distribution Pie Chart */}
        <div className="mb-4">
          <h5 className="headingQuestion"> Exam Score Distribution</h5>
          <div style={{ width: "100%", height: "300px" }}>
            {!isError && scoreDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {scoreDistributionData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="d-flex justify-content-center align-items-center bg-light border rounded p-4 mt-3"
                style={{ height: "100%" }}
              >
                <div className="text-center">
                  <i className="bi bi-exclamation-triangle text-danger fs-3 mb-2"></i>
                  <p className="text-danger fw-semibold mb-0">No Data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question-wise Analysis Bar Chart with Pagination */}
        <div className="mb-4">
          <h5 className="headingQuestion">Question-wise Analysis</h5>
          <div style={{ width: "100%", height: "300px" }}>
            {!isError && paginatedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paginatedData}>
                  <XAxis dataKey="questionNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="correct"
                    fill="#82ca9d"
                    name="Correct Answers"
                  />
                  <Bar
                    dataKey="incorrect"
                    fill="#ff7f7f"
                    name="Incorrect Answers"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="d-flex justify-content-center align-items-center bg-light border rounded p-4 mt-3"
                style={{ height: "100%" }}
              >
                <div className="text-center">
                  <i className="bi bi-exclamation-triangle text-danger fs-3 mb-2"></i>
                  <p className="text-danger fw-semibold mb-0">No Data</p>
                </div>
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between mt-2">
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Table for Question-wise Details with Search */}
        <div className="mb-4">
          <h5 className="headingQuestion">Question-wise Details</h5>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search question text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr className=" table-success ">
                  <th>#</th>
                  <th>Question</th>
                  <th>Correct</th>
                  <th>Incorrect</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.length > 0 ? (
                  filteredData?.map((item) => (
                    <tr key={item.questionNumber}>
                      <td>{item.questionNumber}</td>
                      <td style={{ minWidth: "400px" }}>{item.question}</td>
                      <td>{item.correct}</td>
                      <td>{item.incorrect}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Download Report as PDF Button */}
      <button className="btn btn-primary" onClick={downloadReportAsPDF}>
        Download Report as PDF
      </button>
    </>
  );
};
