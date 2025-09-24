import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const AssessmentTimer = ({ duration = 60, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        
        // Warning when 5 minutes left
        if (prev <= 300 && !isWarning) {
          setIsWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      isWarning ? 'bg-red-100 text-red-700' : ''
    }`} style={{
      backgroundColor: isWarning ? '#fee2e2' : '#F3F2F0',
      color: isWarning ? '#dc2626' : '#000000',
      border: `1px solid ${isWarning ? '#fca5a5' : '#e0e0e0'}`
    }}>
      {isWarning ? <AlertTriangle size={20} /> : <Clock size={20} />}
      <span className="font-mono font-semibold">
        Time Left: {formatTime(timeLeft)}
      </span>
      {isWarning && <span className="text-sm">(Auto-submit soon!)</span>}
    </div>
  );
};

export default AssessmentTimer;