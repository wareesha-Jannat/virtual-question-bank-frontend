import React, { useState } from 'react';
import { toast } from 'react-toastify';

export const PracticeComponent = ({
  questions,
  onBackToView,
}) => {
  const [userAnswers, setUserAnswers] = useState({}); // Track answers for each question
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // Store feedback for correctness of answer
  const [isDisabled, setIsDisabled] = useState(false);  // Store the disabled state for buttons and inputs (e.g, to disable after submission)

   // Handle answer change for the selected question
  const handleAnswerChange = (questionId, value) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value, // Update answer for the specific question
    }));
    setSelectedQuestionId(questionId);
  };

  // Handle answer submit
  const handleSubmit = async () => {
    if (!userAnswers[selectedQuestionId]) {
      toast.error('Please provide an answer before submitting.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/evaluateResponse`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswer: userAnswers[selectedQuestionId],
          selectedQuestionId,
        }),
      });

      const data = await res.json();
  
      if (res.ok) {
        // Update feedback state for the specific question
        setIsCorrect(data.isCorrect);
        setIsDisabled(true); // Re-enable submissions after reset
      } else {
        toast.error(data.message || 'Failed to submit answer.');
      }
    } catch (error) {
      toast.error('Server error');
      
    }
  };

  
  const handleReset = () => {
    setUserAnswers((prevAnswer) => ({
      ...prevAnswer,
      [selectedQuestionId]: '', // Reset the answer for the selected question
    }));
    setSelectedQuestionId(null);
    setIsCorrect(null);
    setIsDisabled(false); // Re-enable submissions after reset
  };

   
  return (
    <>

    <h2 className='heading'>Practice Mode</h2>
      <div className='my-2 text-end'>
        {/* Button to navigate back to view questions */}
        <button className='btn btn-secondary' onClick={onBackToView}>
          Back to View Questions
        </button>
      </div>

      <div>


        <div className='mt-4'>
          {questions.length === 0 ? (
            <div>No questions available.</div>
          ) : (
            questions.map((q) => (
              <div key={q._id} className='border p-3 rounded mb-2'>
                <h6 className='headingQuestion'>{q.questionText}</h6>
               
                {/* Render different question types (MCQ or Descriptive) */}
                {q.questionType === 'MCQ' && (
                  <div>
                    {q.options.map((option, index) => {
                      const isSelected = userAnswers[q._id] === option;

                      return (
                        <div key={index} className='d-flex align-items-center mb-2'>
                          <label className='d-flex align-items-center gap-2'>
                          <input
                            type='radio'
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(q._id, option)}
                            className='form-check-input '
                          />
                          {option}</label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.questionType === 'Descriptive' && (
                  <div>
                    <textarea
                      className='form-control'
                      rows='4'
                      placeholder='Write your answer here...'
                      value={userAnswers[q._id] || ''} // Default to empty if not set
                      onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                      disabled={isDisabled} // Disable textarea after submission
                    />
                  </div>
                )}
                  {/* Submit and Reset buttons */}
                <div className='d-flex justify-content-between align-items-center mt-3'>
                  <button className='btn btn-primary' onClick={handleSubmit} disabled={isDisabled} >
                    Submit Answer
                  </button>
                  <button className='btn btn-secondary' onClick={handleReset}>
                    Reset
                  </button>
                </div>
                 {/* Show feedback and explanation after submitting */}
                {q._id === selectedQuestionId && isCorrect !== null && (
                  <>
                  <div className={`mt-3 alert ${isCorrect ? 'alert-success' : 'alert-danger'}`}>
                    {isCorrect ? 'Your answer is correct!' : 'Your answer is incorrect.'}
                  </div>

                  <div className='mt-2 alert alert-info'>
                    <p> <b>The correct answer is: </b> {q.correctAnswer}</p>
                    <p> <b>Explanation: </b> {q.explanation}</p>
                  </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
