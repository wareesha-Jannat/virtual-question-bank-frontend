import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../css/howitworks.module.css";

export const HowItWorks = () => {
  return (
    <div id="Howitworks" className={`${styles.howitworks} py-4`}>
      <div className="container-xxl text-center">
        <h2 className="mb-5">How It Works</h2>
        <div className="row mb-3">
          <div className="col-md-3 mb-3">
            <i className="bi bi-person-plus-fill h1 mb-3"></i>
            <h4>Sign Up</h4>
            <p>
              Create an account and log in to get started with the Virtual
              Question Bank.
            </p>
          </div>
          <div className="col-md-3 mb-3">
            <i className="bi bi-journal-bookmark-fill h1 mb-3"></i>
            <h4>Select Subject</h4>
            <p>
              Browse through various subjects and topics to find the questions
              you need.
            </p>
          </div>
          <div className="col-md-3 mb-3">
            <i className="bi bi-pencil-fill h1 mb-3"></i>
            <h4>Practice Questions</h4>
            <p>Test yourself with our extensive collection of questions.</p>
          </div>
          <div className="col-md-3">
            <i className="bi bi-bar-chart-fill h1 mb-3"></i>
            <h4>Track Performance</h4>
            <p>Analyze your performance and improve with detailed feedback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
