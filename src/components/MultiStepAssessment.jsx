import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Play, Square } from 'lucide-react';
import AssessmentTimer from './AssessmentTimer';

const MultiStepAssessment = ({ assessment, candidateId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const steps = [
    { id: 'aptitude', title: 'Aptitude Questions', icon: '🧠' },
    { id: 'communication', title: 'Communication Skills', icon: '💬' },
    { id: 'subjective', title: 'Subjective Questions', icon: '📝' },
    { id: 'coding', title: 'Coding Challenge', icon: '💻' },
    { id: 'feedback', title: 'Feedback', icon: '⭐' }
  ];

  const sampleQuestions = {
    aptitude: [
      {
        id: 'apt1',
        question: 'What is 15% of 240?',
        options: ['36', '32', '40', '38'],
        correct: '36'
      },
      {
        id: 'apt2', 
        question: 'If a train travels 120 km in 2 hours, what is its speed?',
        options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
        correct: '60 km/h'
      }
    ],
    communication: [
      {
        id: 'comm1',
        question: 'Describe your ideal work environment in 100 words.',
        type: 'text'
      },
      {
        id: 'comm2',
        question: 'Record a 2-minute introduction about yourself.',
        type: 'audio'
      }
    ],
    subjective: [
      {
        id: 'subj1',
        question: 'Describe a challenging project you worked on and how you overcame obstacles.',
        minWords: 200
      }
    ],
    coding: [
      {
        id: 'code1',
        question: 'Write a function to reverse a string without using built-in methods.',
        testCases: [
          { input: '"hello"', output: '"olleh"' },
          { input: '"world"', output: '"dlrow"' }
        ]
      }
    ],
    feedback: [
      {
        id: 'feed1',
        question: 'How was your assessment experience? Any suggestions for improvement?'
      }
    ]
  };

  const handleTimeUp = () => {
    console.log('Time up! Auto-submitting assessment...');
    handleSubmit();
  };

  const handleSubmit = () => {
    const submissionData = {
      candidateId,
      assessmentId: assessment?.id,
      responses,
      submittedAt: new Date().toISOString(),
      timeSpent: 60 - Math.floor(Math.random() * 20) // Mock time spent
    };
    
    try {
      localStorage.setItem(`assessment-submission-${candidateId}`, JSON.stringify(submissionData));
      alert('Assessment submitted successfully!');
    } catch (error) {
      console.error('Failed to save assessment submission:', error);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  const renderAptitudeStep = () => (
    <div className="space-y-6">
      {sampleQuestions.aptitude.map((q, idx) => (
        <div key={q.id} className="card">
          <h3 className="font-medium mb-4">{idx + 1}. {q.question}</h3>
          <div className="space-y-2">
            {q.options.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={option}
                  checked={responses[q.id] === option}
                  onChange={(e) => setResponses({...responses, [q.id]: e.target.value})}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCommunicationStep = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-medium mb-4">1. {sampleQuestions.communication[0].question}</h3>
        <textarea
          className="textarea w-full"
          rows={5}
          value={responses.comm1 || ''}
          onChange={(e) => setResponses({...responses, comm1: e.target.value})}
          placeholder="Write your response here..."
        />
        <div className="text-sm text-gray-500 mt-2">
          Words: {(responses.comm1 || '').split(' ').filter(w => w.length > 0).length}/100
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium mb-4">2. {sampleQuestions.communication[1].question}</h3>
        <div className="flex items-center gap-4">
          <button
            className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <Square size={16} /> : <Play size={16} />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              Recording...
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSubjectiveStep = () => (
    <div className="card">
      <h3 className="font-medium mb-4">1. {sampleQuestions.subjective[0].question}</h3>
      <textarea
        className="textarea w-full"
        rows={8}
        value={responses.subj1 || ''}
        onChange={(e) => setResponses({...responses, subj1: e.target.value})}
        placeholder="Provide a detailed response..."
      />
      <div className="text-sm text-gray-500 mt-2">
        Words: {(responses.subj1 || '').split(' ').filter(w => w.length > 0).length}/200 minimum
      </div>
    </div>
  );

  const renderCodingStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <label className="font-medium">Language:</label>
        <select
          className="select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="card">
        <h3 className="font-medium mb-4">1. {sampleQuestions.coding[0].question}</h3>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Test Cases:</h4>
          {sampleQuestions.coding[0].testCases.map((test, idx) => (
            <div key={idx} className="text-sm bg-gray-100 p-2 rounded mb-1">
              Input: {test.input} → Expected: {test.output}
            </div>
          ))}
        </div>

        <textarea
          className="textarea w-full font-mono"
          rows={12}
          value={responses.code1 || ''}
          onChange={(e) => setResponses({...responses, code1: e.target.value})}
          placeholder={`// Write your ${selectedLanguage} code here\nfunction reverseString(str) {\n  // Your implementation\n}`}
        />
        
        <button className="btn btn-primary mt-2">
          Run Tests
        </button>
      </div>
    </div>
  );

  const renderFeedbackStep = () => (
    <div className="card">
      <h3 className="font-medium mb-4">1. {sampleQuestions.feedback[0].question}</h3>
      <textarea
        className="textarea w-full"
        rows={6}
        value={responses.feed1 || ''}
        onChange={(e) => setResponses({...responses, feed1: e.target.value})}
        placeholder="Share your thoughts about the assessment..."
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderAptitudeStep();
      case 1: return renderCommunicationStep();
      case 2: return renderSubjectiveStep();
      case 3: return renderCodingStep();
      case 4: return renderFeedbackStep();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Assessment</h1>
        <AssessmentTimer duration={60} onTimeUp={handleTimeUp} />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              idx === currentStep ? 'bg-blue-100 text-blue-700' : 
              idx < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className="text-lg">{step.icon}</span>
              <span className="font-medium">{step.title}</span>
              {idx < currentStep && <CheckCircle size={16} />}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${idx < currentStep ? 'bg-green-300' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {currentStep === steps.length - 1 ? (
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Assessment
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepAssessment;