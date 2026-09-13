import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pagesCSS/Referjobsection.css';
import companyimage from '../images/blog.jpg';
// Same env var used across the rest of the app (see Posts.jsx)
const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || '';

function QuestionField({ question, value, onChange }) {
  const handleCheckboxToggle = (option) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(option)) {
      onChange(current.filter((v) => v !== option));
    } else {
      onChange([...current, option]);
    }
  };

  switch (question.type) {
    case 'textarea':
      return (
        <textarea
          className="rjw9x-form-textarea"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          className="rjw9x-form-input"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );
    case 'email':
      return (
        <input
          type="email"
          className="rjw9x-form-input"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          className="rjw9x-form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );
    case 'radio':
      return (
        <div className="rjw9x-radio-group">
          {question.options.map((opt, i) => (
            <label key={i} className="rjw9x-radio-option">
              <input
                type="radio"
                name={question._id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                required={question.required}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="rjw9x-checkbox-group">
          {question.options.map((opt, i) => (
            <label key={i} className="rjw9x-checkbox-option">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={() => handleCheckboxToggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'select':
      return (
        <select
          className="rjw9x-form-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        >
          <option value="">Select an option</option>
          {question.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'file':
      return (
        <input
          type="file"
          className="rjw9x-form-file"
          onChange={(e) => onChange(e.target.files[0])}
          required={question.required}
        />
      );
    default:
      return (
        <input
          type="text"
          className="rjw9x-form-input"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );
  }
}

// Small reusable "copy to clipboard" button used for the application ID.
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers / non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rjw9x-copy-btn"
      aria-label="Copy application ID"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}

function ApplyModal({ posting, applicationType, onClose }) {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('applicationType', applicationType);
      payload.append('postingId', posting._id);
      payload.append('applicantName', applicantName);
      payload.append('applicantEmail', applicantEmail);
      payload.append('applicantPhone', applicantPhone);
      if (resumeFile) payload.append('resume', resumeFile);

      const formattedAnswers = (posting.questions || []).map((q) => ({
        questionId: q._id,
        answer: answers[q._id] ?? ''
      }));
      payload.append('answers', JSON.stringify(formattedAnswers));

      const res = await axios.post(`${API_BASE}/api/public/applications`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessId(res.data.applicationId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rjw9x-modal-overlay">
      <div className="rjw9x-modal">
        {successId ? (
          <div className="rjw9x-success-wrap">
            <p className="rjw9x-success-title">Application submitted</p>
            <p className="rjw9x-success-text">Keep this application ID to check your status later.</p>
            <div className="rjw9x-success-id-row">
              <p className="rjw9x-success-id">{successId}</p>
              <CopyButton text={successId} />
            </div>
            <button onClick={onClose} className="rjw9x-success-close-btn">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="rjw9x-modal-form">
            <div className="rjw9x-modal-top">
              <div>
                <h3 className="rjw9x-modal-title">
                  {applicationType === 'referral' ? posting.roleTitle : posting.title}
                </h3>
                <p className="rjw9x-modal-subtitle">
                  {applicationType === 'referral' ? posting.companyName : posting.company}
                </p>
              </div>
              <button type="button" onClick={onClose} className="rjw9x-modal-close">✕</button>
            </div>

            {error && <p className="rjw9x-modal-error">{error}</p>}

            <input
              className="rjw9x-form-input"
              placeholder="Your full name"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
            />
            <input
              type="email"
              className="rjw9x-form-input"
              placeholder="Your email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              required
            />
            <input
              className="rjw9x-form-input"
              placeholder="Phone (optional)"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
            />
            <div className="rjw9x-form-group">
              <label className="rjw9x-form-label">Resume (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="rjw9x-form-file"
              />
            </div>

            {posting.questions?.map((q) => (
              <div className="rjw9x-form-group" key={q._id}>
                <label className="rjw9x-form-label">
                  {q.questionText}{q.required ? ' *' : ''}
                </label>
                <QuestionField
                  question={q}
                  value={answers[q._id]}
                  onChange={(v) => setAnswer(q._id, v)}
                />
              </div>
            ))}

            <button type="submit" disabled={submitting} className="rjw9x-submit-btn">
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StatusChecker() {
  const [applicationId, setApplicationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/api/public/applications/status/${applicationId.trim()}`);
      setResult(res.data.application);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rjw9x-status-card">
      <p className="rjw9x-status-title">Check your application status</p>
      <form onSubmit={check} className="rjw9x-status-form">
        <input
          className="rjw9x-status-input"
          placeholder="e.g. REF-4F9A21"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        />
        <button type="submit" disabled={loading} className="rjw9x-status-btn">
          {loading ? '...' : 'Check'}
        </button>
      </form>
      {error && <p className="rjw9x-status-error">{error}</p>}
      {result && (
        <div className="rjw9x-status-result">
          <p className="rjw9x-status-result-title">
            {result.postingSnapshot?.roleTitle} — {result.postingSnapshot?.companyName}
          </p>
          <span
            className="rjw9x-status-badge"
            style={{ backgroundColor: `${result.currentStatus?.color}22`, color: result.currentStatus?.color }}
          >
            {result.currentStatus?.label}
          </span>
          {result.currentStatus?.note && <p className="rjw9x-status-note">{result.currentStatus.note}</p>}
        </div>
      )}
    </div>
  );
}

function StatusModal({ onClose }) {
  return (
    <div className="rjw9x-modal-overlay" onClick={onClose}>
      <div className="rjw9x-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rjw9x-modal-top">
          <div>
            <h3 className="rjw9x-modal-title">Application status</h3>
            <p className="rjw9x-modal-subtitle">Enter the ID you received when you applied.</p>
          </div>
          <button type="button" onClick={onClose} className="rjw9x-modal-close">✕</button>
        </div>
        <StatusChecker />
      </div>
    </div>
  );
}

// Referral and job postings share the exact same card look — only the
// fields read from the posting differ.
function PostingCard({ posting, kind, onApply }) {
  const isReferral = kind === 'referral';
  const title = isReferral ? posting.roleTitle : posting.title;
  const company = isReferral ? posting.companyName : posting.company;

  return (
    <div className="rjw9x-card">
      <div className="rjw9x-card-image-wrap">
        <img
          src={companyimage}
          alt={company || 'Company logo'}
          className="rjw9x-card-image"
        />
      </div>

      <div className="rjw9x-card-content">
        <p className="rjw9x-card-meta">{company}</p>
        <h3 className="rjw9x-card-title">{title}</h3>
        <p className="rjw9x-card-summary">{posting.description}</p>

        <div className="rjw9x-card-tags">
          {posting.location && <span className="rjw9x-card-tag">{posting.location}</span>}
          {posting.jobType && <span className="rjw9x-card-tag">{posting.jobType}</span>}
          {isReferral && posting.experienceLevel && (
            <span className="rjw9x-card-tag">{posting.experienceLevel}</span>
          )}
          {!isReferral && posting.salaryRange?.isDisclosed && posting.salaryRange?.min && (
            <span className="rjw9x-card-tag">
              {posting.salaryRange.currency} {posting.salaryRange.min}–{posting.salaryRange.max}
            </span>
          )}
        </div>

        <div className="rjw9x-card-footer">
          {!isReferral && posting.applyMode === 'external' ? (
            <a
              href={posting.applyLink}
              target="_blank"
              rel="noreferrer"
              className="rjw9x-apply-btn"
            >
              Apply on company site
            </a>
          ) : (
            <button onClick={() => onApply(posting, kind)} className="rjw9x-apply-btn">
              {isReferral ? 'Ask for a referral' : 'Apply now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReferJobSection() {
  const [tab, setTab] = useState('referral');
  const [referrals, setReferrals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [referralRes, jobRes] = await Promise.all([
          axios.get(`${API_BASE}/api/public/referral-postings`),
          axios.get(`${API_BASE}/api/public/job-postings`)
        ]);
        setReferrals(referralRes.data.postings);
        setJobs(jobRes.data.postings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openApply = (posting, kind) => setApplyTarget({ posting, kind });

  const activeList = tab === 'referral' ? referrals : jobs;
  const isEmpty = !loading && activeList.length === 0;

  return (
    <section className="rjw9x-section">
      <div className="rjw9x-header">
        <h1 className="tyagi-hero-title">
          Work
          <span className="tyagi-hero-gradient"> with me</span>
        </h1>
      </div>

      <div className="rjw9x-tab-nav">
        <div className="rjw9x-tab-buttons">
          <button
            className={`rjw9x-tab-btn ${tab === 'referral' ? 'rjw9x-tab-btn-active' : ''}`}
            onClick={() => setTab('referral')}
          >
            Refer
          </button>
          <button
            className={`rjw9x-tab-btn ${tab === 'jobs' ? 'rjw9x-tab-btn-active' : ''}`}
            onClick={() => setTab('jobs')}
          >
            Jobs
          </button>
          <button
            className="rjw9x-tab-btn"
            onClick={() => setShowStatusModal(true)}
          >
            Check Status
          </button>
        </div>
      </div>

      <div className="rjw9x-content-area">
        {loading ? (
          <p className="rjw9x-loading-text">Loading...</p>
        ) : isEmpty ? (
          <div className="rjw9x-empty-state">
            <p className="rjw9x-empty-text">
              {tab === 'referral'
                ? 'No open referrals right now — check back soon.'
                : 'No open roles posted right now.'}
            </p>
          </div>
        ) : (
          <div className="rjw9x-grid">
            {activeList.map((p) => (
              <PostingCard key={p._id} posting={p} kind={tab === 'referral' ? 'referral' : 'job'} onApply={openApply} />
            ))}
          </div>
        )}
      </div>

      {applyTarget && (
        <ApplyModal
          posting={applyTarget.posting}
          applicationType={applyTarget.kind}
          onClose={() => setApplyTarget(null)}
        />
      )}

      {showStatusModal && <StatusModal onClose={() => setShowStatusModal(false)} />}
    </section>
  );
}