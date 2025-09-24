import React, { useState, useEffect } from 'react';

const AssessmentPreview = ({ assessment }) => {
  const [responses, setResponses] = useState(() => {
    try {
      // Load saved responses from localStorage
      const saved = localStorage.getItem(`assessment-responses-${assessment?.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load saved responses:', error);
      return {};
    }
  });
  const [errors, setErrors] = useState({});

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (assessment?.id) {
      try {
        localStorage.setItem(`assessment-responses-${assessment.id}`, JSON.stringify(responses));
      } catch (error) {
        console.error('Failed to save responses:', error);
      }
    }
  }, [responses, assessment?.id]);

  const handleResponseChange = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
    if (errors[questionId]) {
      setErrors({ ...errors, [questionId]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    assessment.sections?.forEach(section => {
      section.questions?.forEach(question => {
        if (question.required && !responses[question.id]) {
          newErrors[question.id] = 'This field is required';
        }
        
        if (question.validation && responses[question.id]) {
          const value = responses[question.id];
          const validation = question.validation;
          
          if (validation.minLength && value.length < validation.minLength) {
            newErrors[question.id] = `Minimum ${validation.minLength} characters required`;
          }
          
          if (validation.maxLength && value.length > validation.maxLength) {
            newErrors[question.id] = `Maximum ${validation.maxLength} characters allowed`;
          }
          
          if (validation.min && parseFloat(value) < validation.min) {
            newErrors[question.id] = `Minimum value is ${validation.min}`;
          }
          
          if (validation.max && parseFloat(value) > validation.max) {
            newErrors[question.id] = `Maximum value is ${validation.max}`;
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Assessment submitted:', responses);
    }
  };

  const renderQuestion = (question) => {
    let shouldShow = true;
    if (question.conditional && question.conditional.dependsOn) {
      const dependentValue = responses[question.conditional.dependsOn];
      switch (question.conditional.condition) {
        case 'equals':
          shouldShow = dependentValue === question.conditional.value;
          break;
        case 'not_equals':
          shouldShow = dependentValue !== question.conditional.value;
          break;
        case 'contains':
          shouldShow = dependentValue && dependentValue.toString().includes(question.conditional.value);
          break;
        default:
          shouldShow = dependentValue === question.conditional.value;
      }
    }
    
    if (!shouldShow) return null;

    switch (question.type) {
      case 'single-choice':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            {question.options?.map(option => (
              <div key={option} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      case 'multi-choice':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            {question.options?.map(option => (
              <div key={option} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = responses[question.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    handleResponseChange(question.id, updated);
                  }}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      case 'short-text':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              className="input w-full"
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
            />
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      case 'long-text':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              className="textarea w-full"
              rows={4}
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
            />
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      case 'numeric':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="number"
              className="input w-full"
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
            />
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div key={question.id} className="form-group">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="file"
              className="input w-full"
              onChange={(e) => handleResponseChange(question.id, e.target.files[0]?.name || '')}
            />
            {errors[question.id] && (
              <div className="error">{errors[question.id]}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!assessment?.title) {
    return (
      <div className="text-center text-gray-500 py-8">
        Start building your assessment to see the preview
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-semibold text-xl mb-4">{assessment.title}</h2>
      
      {assessment.sections?.map(section => (
        <div key={section.id} className="mb-6">
          <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
          {section.questions?.map(renderQuestion)}
        </div>
      ))}
      
      <button type="submit" className="btn btn-primary">
        Submit Assessment
      </button>
    </form>
  );
};

export default AssessmentPreview;