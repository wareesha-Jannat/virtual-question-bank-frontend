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
import Loader from "@/app/components/Loader";
import styles from "../../AdminPages.module.css";

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
    enabled: !!selectedSubject, // fetch only when subject is selected !!(convert value into boolean)
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

  const { data, isError, isLoading } = useQuery({
    queryKey: [
      "reporting",
      { dateRange, selectedDifficulty, selectedSubject, selectedTopic },
    ],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insights/reports`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subjectName: subjectList.find(
              (subject) => subject.value === selectedSubject,
            )?.label,
            topicName: topicList.find(
              (topic) => topic.value === selectedTopic,
            )?.label,
            difficulty: selectedDifficulty,
            dateRange,
          }),
        },
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
    indexOfLastQuestion,
  );

  // Handle search
  const filteredData = questionWiseData?.filter(
    (item) =>
      item.questionNumber.toString().includes(searchTerm) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <div ref={reportRef} className={styles.reportContent}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Reporting Overview</h2>
            <p className={styles.panelDescription}>
              Refine the report and review the resulting trends and question
              details.
            </p>
          </div>
        </div>

        <section className={styles.panel} aria-labelledby="report-filters">
          <div className={styles.panelHeader}>
            <h3 id="report-filters" className={styles.panelTitle}>
              Report filters
            </h3>
          </div>
          <div className={styles.sectionGrid}>
            <div className={styles.formField}>
              <label htmlFor="report-subject" className={styles.formLabel}>
                Select Subject
              </label>
              <Select
                inputId="report-subject"
                options={subjectList}
                value={
                  subjectList.find(
                    (option) => option.value === selectedSubject,
                  ) || null
                }
                onChange={handleSubjectChange}
                isSearchable
                placeholder="Enter a subject"
                autoComplete="off"
                className={styles.reactSelect}
                classNamePrefix="vqb"
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="report-topic" className={styles.formLabel}>
                Select Topic
              </label>
              <Select
                inputId="report-topic"
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
                className={styles.reactSelect}
                classNamePrefix="vqb"
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="report-difficulty" className={styles.formLabel}>
                Select Difficulty
              </label>
              <select
                id="report-difficulty"
                className={styles.formControl}
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="report-start-date" className={styles.formLabel}>
                Start Date
              </label>
              <input
                id="report-start-date"
                type="date"
                className={styles.formControl}
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="report-end-date" className={styles.formLabel}>
                End Date
              </label>
              <input
                id="report-end-date"
                type="date"
                className={styles.formControl}
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        <div className={styles.chartGrid}>
          <section className={styles.chartPanel} aria-labelledby="score-heading">
            <div className={styles.panelHeader}>
              <h3 id="score-heading" className={styles.panelTitle}>
                Exam Score Distribution
              </h3>
            </div>
            <div className={styles.chartViewport}>
              {isLoading || !data ? (
                <div className={styles.loadingState}>
                  <Loader />
                </div>
              ) : !isError && scoreDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreDistributionData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="var(--vqb-primary)"
                      label
                    >
                      {scoreDistributionData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "var(--vqb-primary)",
                              "var(--vqb-accent)",
                              "var(--vqb-warning)",
                              "var(--vqb-info)",
                            ][index % 4]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-pie-chart" aria-hidden="true" />
                  <p className="mb-0">No Data</p>
                </div>
              )}
            </div>
          </section>

          <section
            className={styles.chartPanel}
            aria-labelledby="question-analysis-heading"
          >
            <div className={styles.panelHeader}>
              <h3
                id="question-analysis-heading"
                className={styles.panelTitle}
              >
                Question-wise Analysis
              </h3>
            </div>
            <div className={styles.chartViewport}>
              {isLoading || !data ? (
                <div className={styles.loadingState}>
                  <Loader />
                </div>
              ) : !isError && paginatedData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paginatedData}>
                    <XAxis dataKey="questionNumber" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="correct"
                      fill="var(--vqb-accent)"
                      name="Correct Answers"
                    />
                    <Bar
                      dataKey="incorrect"
                      fill="var(--vqb-danger)"
                      name="Incorrect Answers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyState}>
                  <i className="bi bi-bar-chart" aria-hidden="true" />
                  <p className="mb-0">No Data</p>
                </div>
              )}
            </div>
            <div className={styles.chartPagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className={styles.pageIndicator}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </section>
        </div>

        <section
          className={styles.panel}
          aria-labelledby="question-details-heading"
        >
          <div className={styles.panelHeader}>
            <div>
              <h3
                id="question-details-heading"
                className={styles.panelTitle}
              >
                Question-wise Details
              </h3>
              <p className={styles.panelDescription}>
                Search question text or its sequence number.
              </p>
            </div>
          </div>
          <label className={`${styles.searchField} ${styles.formField}`}>
            <span className="visually-hidden">Search question details</span>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="text"
              className={`${styles.formControl} ${styles.searchInput}`}
              placeholder="Search question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Question</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Incorrect</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || !data ? (
                  <tr>
                    <td colSpan="4" className={styles.tableEmpty}>
                      <Loader />
                    </td>
                  </tr>
                ) : filteredData?.length > 0 ? (
                  filteredData?.map((item) => (
                    <tr key={item.questionNumber}>
                      <td className={styles.tableNumber}>
                        {item.questionNumber}
                      </td>
                      <td className={`${styles.tableText} ${styles.questionText}`}>
                        {item.question}
                      </td>
                      <td>{item.correct}</td>
                      <td>{item.incorrect}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.tableEmpty}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <button
        className={`${styles.primaryButton} mt-3`}
        onClick={downloadReportAsPDF}
      >
        <i className="bi bi-download" aria-hidden="true" />
        Download Report as PDF
      </button>
    </>
  );
};
