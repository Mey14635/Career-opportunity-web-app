import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { NAVY, GOLD, inputStyle, labelStyle } from '../constants';
import DocCheckbox from '../../../components/employer/DocCheckbox';
import { createJob } from '../../../services/firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function PostJobView({ employerId, companyName, onCancel, onSuccess }) {
  const [requiredDocs, setRequiredDocs] = useState({
    cv: true,
    coverLetter: false,
    transcripts: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    
    // Build docs array EXACTLY how the Admin panel expects it (as an array, not a string)
    const docsList = [];
    if (requiredDocs.cv) docsList.push('CV / Resume');
    if (requiredDocs.coverLetter) docsList.push('Cover Letter');
    if (requiredDocs.transcripts) docsList.push('Academic Transcripts');

    try {
      // 1. Failsafe to grab the exact company name if the prop is missing
      let finalCompanyName = companyName;
      if (!finalCompanyName && employerId) {
        const empDoc = await getDoc(doc(db, 'employer_profiles', employerId));
        if (empDoc.exists()) {
          finalCompanyName = empDoc.data().companyName;
        } else {
          finalCompanyName = "Unknown Company";
        }
      }

// 2. Map data EXACTLY to what the Admin dashboard is looking for
      const jobData = {
        title: formData.get('title'),
        companyName: finalCompanyName,
        employerId: employerId,
        description: formData.get('description'),
        responsibilities: formData.get('responsibilities'), 
        docs: docsList, // FIXED: Matches selectedJob.docs
        category: formData.get('category'),
        jobType: formData.get('jobType'),
        workMode: formData.get('location'), // FIXED: Matches selectedJob.workMode
        startDate: formData.get('startDate'),
        duration: formData.get('duration'),
        positions: formData.get('openPositions'), // FIXED: Matches selectedJob.positions
        status: 'pending',
        deadline: new Date(formData.get('deadline')),
        metrics: { views: 0, applications: 0 },
      };

    //   // 2. Map data EXACTLY to what the Admin dashboard is looking for
    //   const jobData = {
    //     title: formData.get('title'),
    //     companyName: finalCompanyName,
    //     employerId: employerId,
    //     description: formData.get('description'),
    //     responsibilities: formData.get('responsibilities'), // Changed from 'requirement'
    //     requiredDocuments: docsList, // Passed as an array
    //     category: formData.get('category'),
    //     jobType: formData.get('jobType'),
    //     location: formData.get('location'),
    //     startDate: formData.get('startDate'), // Added
    //     duration: formData.get('duration'), // Added
    //     openPositions: Number(formData.get('openPositions')), // Added
    //     status: 'pending',
    //     deadline: new Date(formData.get('deadline')),
    //     metrics: { views: 0, applications: 0 },
    //   };

      await createJob(jobData);
      alert('✅ Job posted successfully! It will appear on your dashboard as pending.');
      if (onSuccess) onSuccess();
      
    } catch (err) {
      alert('❌ Error: ' + err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 800, color: NAVY }}>Post a Job</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Create a new listing for students.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─── JOB DETAILS ────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={labelStyle}>Job Details</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Job Title *</label>
            <input type="text" name="title" placeholder="e.g. Frontend Developer Intern" style={inputStyle} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" style={{...inputStyle, appearance: 'auto'}} required>
                <option value="">Select...</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Consulting</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Job Type *</label>
              <select name="jobType" style={{...inputStyle, appearance: 'auto'}} required>
                <option value="">Select...</option>
                <option>Internship</option>
                <option>Graduate Program</option>
                <option>Full Time</option>
                <option>Part-time</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Location *</label>
              <input type="text" name="location" placeholder="e.g. Nairobi" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input type="date" name="startDate" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Duration *</label>
              <input type="text" name="duration" placeholder="e.g. 3 Months" style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
               <label style={labelStyle}>Application Deadline *</label>
               <input type="date" name="deadline" style={inputStyle} required />
            </div>
            <div>
               <label style={labelStyle}>Open Positions *</label>
               <input type="number" name="openPositions" min="1" placeholder="e.g. 2" style={inputStyle} required />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Job Description *</label>
            <textarea name="description" rows="5" placeholder="Describe the role..." style={{...inputStyle, resize: 'vertical'}} required />
          </div>

          <div>
            <label style={labelStyle}>Key Responsibilities & Requirements *</label>
            <textarea name="responsibilities" rows="4" placeholder="What will they do? What skills are needed?" style={{...inputStyle, resize: 'vertical'}} required />
          </div>
        </div>

        {/* ─── REQUIRED DOCUMENTS ──────────────────────── */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={labelStyle}>Required Documents</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Select which documents applicants must submit.</p>

          <DocCheckbox 
            label="CV / Resume" 
            sub="PDF format only" 
            checked={requiredDocs.cv} 
            onChange={() => setRequiredDocs(prev => ({...prev, cv: !prev.cv}))} 
          />
          <DocCheckbox 
            label="Cover Letter" 
            sub="Addressed to the Hiring Manager" 
            checked={requiredDocs.coverLetter} 
            onChange={() => setRequiredDocs(prev => ({...prev, coverLetter: !prev.coverLetter}))} 
          />
          <DocCheckbox 
            label="Academic Transcripts" 
            sub="Official or progressive university transcripts" 
            checked={requiredDocs.transcripts} 
            onChange={() => setRequiredDocs(prev => ({...prev, transcripts: !prev.transcripts}))} 
          />
        </div>

        {/* ─── ACTIONS ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
            <ArrowLeft size={14} /> Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ 
            backgroundColor: GOLD, 
            color: NAVY, 
            border: 'none', 
            padding: '12px 28px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            fontFamily: 'Inter', 
            transition: 'opacity 0.2s',
            opacity: submitting ? 0.6 : 1
          }}>
            {submitting ? 'Posting...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}