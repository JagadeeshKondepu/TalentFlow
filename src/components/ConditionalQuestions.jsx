import React from 'react';

const ConditionalQuestions = ({ questions, responses, onResponseChange }) => {
  const shouldShowQuestion = (question) => {
    if (!question.condition) return true;
    
    const { dependsOn, value } = question.condition;
    return responses[dependsOn] === value;
  };

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        if (!shouldShowQuestion(question)) return null;
        
        return (
          <div key={question.id} className="question-item">
            <label className="form-label">
              {question.title}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            
            {question.type === 'single-choice' && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={(e) => onResponseChange(question.id, e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            
            {question.type === 'multi-choice' && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={option}
                      checked={responses[question.id]?.includes(option)}
                      onChange={(e) => {
                        const current = responses[question.id] || [];
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter(item => item !== option);
                        onResponseChange(question.id, updated);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            
            {question.type === 'short-text' && (
              <input
                type="text"
                className="input"
                value={responses[question.id] || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
                maxLength={question.validation?.maxLength}
              />
            )}
            
            {question.type === 'long-text' && (
              <textarea
                className="textarea"
                value={responses[question.id] || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
                maxLength={question.validation?.maxLength}
                rows={4}
              />
            )}
            
            {question.type === 'numeric' && (
              <input
                type="number"
                className="input"
                value={responses[question.id] || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
                min={question.validation?.min}
                max={question.validation?.max}
              />
            )}
            
            {question.type === 'file-upload' && (
              <input
                type="file"
                className="input"
                onChange={(e) => {
                  // File upload stub - just store filename
                  onResponseChange(question.id, e.target.files[0]?.name || '');
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConditionalQuestions;