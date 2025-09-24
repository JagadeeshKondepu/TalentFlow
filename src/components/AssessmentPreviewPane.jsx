import React, { useState } from 'react';
import ConditionalQuestions from './ConditionalQuestions';

const AssessmentPreviewPane = ({ assessment }) => {
  const [responses, setResponses] = useState({});

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  if (!assessment || !assessment.sections) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">Live Preview</h3>
        <p className="text-gray-500">Add sections and questions to see preview</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Live Preview</h3>
      <div className="assessment-preview">
        <h2 className="font-bold text-xl mb-6">{assessment.title}</h2>
        
        {assessment.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
            
            <ConditionalQuestions
              questions={section.questions}
              responses={responses}
              onResponseChange={handleResponseChange}
            />
          </div>
        ))}
        
        <button className="btn btn-primary mt-6">
          Submit Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentPreviewPane;