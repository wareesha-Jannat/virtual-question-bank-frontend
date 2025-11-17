import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../css/features.module.css";

export const Features = () => {
  return (
    <div id="Features" className={`${styles.features} py-5 bg-light`}>
      <div className="container-xxl text-center">
        <h2 className="mb-5">Features</h2>
        <div className="row justify-content-around">
          <div className="col-md-3 mb-3">
            <i className="bi bi-journal-text h1 "></i>
            <h3>Extensive Question Bank</h3>
            <p>
              Access categorized questions across different subjects and topics
              for comprehensive preparation.
            </p>
          </div>
          <div className="col-md-3 mb-3">
            <i className="bi bi-check-circle h1"></i>
            <h3>Real-Time Feedback</h3>
            <p>
              Receive instant explanations for each answer, helping you
              understand and improve.
            </p>
          </div>
          <div className="col-md-3 mb-3">
            <i className="bi bi-alarm h1 "></i>
            <h3>Simulated Exams</h3>
            <p>
              Take timed practice exams and get detailed performance reports to
              track your progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
