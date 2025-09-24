import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '../services/assessmentService';
import AssessmentPreviewPane from './AssessmentPreviewPane';
import { Plus, Trash2, Save } from 'lucide-react';

const AssessmentBuilder = ({ jobId, domain, onClose }) => {
  const [assessment, setAssessment] = useState({
    title: `${domain || 'General'} Assessment`,
    domain: domain || 'General',
    sections: [
      { title: 'Section 1', questions: [{ type: 'single-choice', title: '', options: ['', '', '', ''], correctAnswer: 0, required: true }] }
    ]
  });
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      try {
        setError(null);
        return await assessmentService.createAssessment({ ...data, jobId });
      } catch (err) {
        const errorMessage = err.message || 'Failed to create assessment';
        setError(errorMessage);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']);
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Assessment creation failed:', error);
    }
  });

  // Validate required props after hooks
  if (!jobId) {
    console.error('AssessmentBuilder: Missing jobId prop');
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="text-center py-8 text-red-600">
            Error: Job ID is required
          </div>
        </div>
      </div>
    );
  }

  const addSection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newSections = [...assessment.sections];
    newSections.push({
      title: `Section ${newSections.length + 1}`,
      questions: [{ type: 'single-choice', title: '', options: ['', '', '', ''], correctAnswer: 0, required: true }]
    });
    setAssessment({ ...assessment, sections: newSections });
  };

  const addQuestion = (sectionIndex) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newSections = [...assessment.sections];
      newSections[sectionIndex].questions.push({
        type: 'single-choice',
        title: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        required: true,
        validation: { min: 0, max: 100, minLength: 0, maxLength: 500 }
      });
      setAssessment({ ...assessment, sections: newSections });
    };
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const newSections = [...assessment.sections];
    newSections[sectionIndex].questions[questionIndex][field] = value;
    setAssessment({ ...assessment, sections: newSections });
  };

  const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
    const newSections = [...assessment.sections];
    newSections[sectionIndex].questions[questionIndex].options[optionIndex] = value;
    setAssessment({ ...assessment, sections: newSections });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    if (assessment.sections[sectionIndex].questions.length > 1) {
      const newSections = [...assessment.sections];
      newSections[sectionIndex].questions.splice(questionIndex, 1);
      setAssessment({ ...assessment, sections: newSections });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate assessment before saving
    if (!assessment.title?.trim()) {
      setError('Assessment title is required');
      return;
    }
    
    if (!assessment.sections?.length) {
      setError('At least one section is required');
      return;
    }
    
    try {
      createMutation.mutate(assessment);
    } catch (err) {
      setError('Failed to save assessment: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose || (() => {})}>
      <div className="modal" style={{ maxWidth: '1200px', maxHeight: '90vh', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div className="assessment-builder grid grid-2 gap-6" style={{ height: '100%' }}>
          <div className="builder-panel" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-xl">Create {domain || 'General'} Assessment</h2>
              <button onClick={onClose || (() => {})} className="btn btn-secondary">×</button>
            </div>

        <div className="mb-4">
          <label className="form-label">Assessment Title</label>
          <input
            type="text"
            className="input"
            value={assessment.title}
            onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
          />
        </div>

        <div className="space-y-6">
          {assessment.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="card">
              <h3 className="font-semibold mb-3">{section.title}</h3>
              
              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-4 p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label">Question {questionIndex + 1}</label>
                    {section.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(sectionIndex, questionIndex)}
                        className="btn btn-secondary"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <select
                    className="select mb-2"
                    value={question.type}
                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                  >
                    <option value="single-choice">Single Choice</option>
                    <option value="multi-choice">Multi Choice</option>
                    <option value="short-text">Short Text</option>
                    <option value="long-text">Long Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="file-upload">File Upload</option>
                  </select>
                  
                  <input
                    type="text"
                    className="input mb-3"
                    placeholder="Enter question..."
                    value={question.title}
                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'title', e.target.value)}
                  />

                  {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                    <div className="grid grid-2 gap-2 mb-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${sectionIndex}-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(sectionIndex, questionIndex, 'correctAnswer', optionIndex)}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'numeric' && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        className="input"
                        placeholder="Min value"
                        value={question.validation?.min || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'validation', { ...question.validation, min: e.target.value })}
                      />
                      <input
                        type="number"
                        className="input"
                        placeholder="Max value"
                        value={question.validation?.max || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'validation', { ...question.validation, max: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {(question.type === 'short-text' || question.type === 'long-text') && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        className="input"
                        placeholder="Min length"
                        value={question.validation?.minLength || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'validation', { ...question.validation, minLength: e.target.value })}
                      />
                      <input
                        type="number"
                        className="input"
                        placeholder="Max length"
                        value={question.validation?.maxLength || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'validation', { ...question.validation, maxLength: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                      />
                      Required
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <label>Show if:</label>
                      <select
                        className="select"
                        value={question.condition?.dependsOn || ''}
                        onChange={(e) => {
                          const condition = e.target.value ? { dependsOn: e.target.value, value: '' } : null;
                          updateQuestion(sectionIndex, questionIndex, 'condition', condition);
                        }}
                      >
                        <option value="">Always show</option>
                        {assessment.sections.flatMap(s => s.questions).map((q, idx) => (
                          <option key={idx} value={`q${idx}`}>Question {idx + 1}</option>
                        ))}
                      </select>
                      
                      {question.condition && (
                        <input
                          type="text"
                          className="input"
                          placeholder="equals value"
                          value={question.condition.value}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'condition', { ...question.condition, value: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion(sectionIndex)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={addSection}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Section
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              {createMutation.isPending ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        
          </div>
          
          <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <AssessmentPreviewPane assessment={assessment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilder;