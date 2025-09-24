import React, { useState } from 'react';
import { Copy, Star } from 'lucide-react';

const AssessmentLibrary = ({ onSelectTemplate }) => {
  const [templates] = useState([
    {
      id: 'template-1',
      title: 'Frontend Developer Assessment',
      difficulty: 'Medium',
      questionCount: 15,
      avgScore: 72,
      tags: ['JavaScript', 'React', 'CSS']
    },
    {
      id: 'template-2', 
      title: 'Backend Developer Assessment',
      difficulty: 'Hard',
      questionCount: 20,
      avgScore: 68,
      tags: ['Node.js', 'Database', 'API']
    },
    {
      id: 'template-3',
      title: 'General Programming Assessment',
      difficulty: 'Easy',
      questionCount: 10,
      avgScore: 78,
      tags: ['Logic', 'Problem Solving']
    }
  ]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Assessment Library</h3>
      <div className="space-y-3">
        {templates.map(template => (
          <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{template.title}</h4>
              <button
                className="btn btn-secondary text-sm"
                onClick={() => onSelectTemplate(template)}
              >
                <Copy size={14} />
                Use Template
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
              <span>{template.questionCount} questions</span>
              <span>Avg: {template.avgScore}%</span>
            </div>
            <div className="flex gap-1 mt-2">
              {template.tags.map(tag => (
                <span key={tag} className="tag text-xs">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentLibrary;