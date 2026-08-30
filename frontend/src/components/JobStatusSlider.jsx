import React from 'react';

const REPEAT = 8;

const JobStatusSlider = ({ statuses = [], speed = 22 }) => {
  if (!statuses.length) return null;

  const group = Array.from({ length: REPEAT }).flatMap(() => statuses);

  return (
    <div className="job-status-slider" aria-live="polite">
      <div
        className="job-status-track"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="job-status-group">
          {group.map((status, i) => (
            <span key={`a-${status._id || status.label}-${i}`} className="job-status-item">
              {status.label}
            </span>
          ))}
        </div>
        <div className="job-status-group" aria-hidden="true">
          {group.map((status, i) => (
            <span key={`b-${status._id || status.label}-${i}`} className="job-status-item">
              {status.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobStatusSlider;