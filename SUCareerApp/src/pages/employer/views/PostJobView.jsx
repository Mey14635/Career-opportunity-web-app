import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { createJob, updateJob } from '../../../services/firestoreService';
import { NAVY, GOLD, inputStyle, labelStyle } from '../constants';
import DocCheckbox from '../../../components/employer/DocCheckbox';

const standardDocumentOptions = [
  { key: 'cv', label: 'CV / Resume' },
  { key: 'coverLetter', label: 'Cover Letter' },
  { key: 'transcripts', label: 'Academic Transcripts' },
];

export default function PostJobView({ employerId, companyName, editingJob = null, onCancel, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  // ─── FORM STATE ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: editingJob?.title || '',
    department: editingJob?.department || '',
    category: editingJob?.category || 'Technology',
    jobType: editingJob?.jobType || 'Internship',
    location: editingJob?.location || '',
    duration: editingJob?.duration || '',
    positions: editingJob?.positions || 1,
    deadline: editingJob?.deadline?.toDate?.()?.toISOString().split('T')[0] || '',
    stipend: editingJob?.stipend || '',
    applicationEmail: editingJob?.applicationEmail || '',
    applicationSubject: editingJob?.applicationSubject || '',
    description: editingJob?.description || '',
    requirement: editingJob?.requirement || '',
  });

  // ─── DOCUMENTS STATE ──────────────────────────────────────────────────
  const [documents, setDocuments] = useState({
    cv: { required: true, format: 'any' },
    coverLetter: { required: false, format: 'any' },
    transcripts: { required: false, format: 'any' },
  });
  
  const [customDocuments, setCustomDocuments] = useState([]);
  const [newDocName, setNewDocName] = useState('');

  // ─── FORMAT OPTIONS ──────────────────────────────────────────────────
  const formatOptions = [
    { value: 'any', label: 'Any Format' },
    { value: 'pdf', label: 'PDF only' },
    { value: 'docx', label: 'DOCX only' },
    { value: 'link', label: 'Link (URL)' },
  ];

  const getFormatLabel = (format) => formatOptions.find(f => f.value === format)?.label || 'Any Format';

  // ─── POPULATE FORM WHEN EDITING ────────────────────────────────────────
  useEffect(() => {
    if (editingJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: editingJob.title || '',
        department: editingJob.department || '',
        category: editingJob.category || 'Technology',
        jobType: editingJob.jobType || 'Internship',
        location: editingJob.location || '',
        duration: editingJob.duration || '',
        positions: editingJob.positions || 1,
        deadline: editingJob.deadline?.toDate?.()?.toISOString().split('T')[0] || '',
        stipend: editingJob.stipend || '',
        applicationEmail: editingJob.applicationEmail || '',
        applicationSubject: editingJob.applicationSubject || '',
        description: editingJob.description || '',
        requirement: editingJob.requirement || '',
      });

      const structuredDocs = Array.isArray(editingJob.requiredDocuments) ? editingJob.requiredDocuments : [];
      const docString = editingJob.requiredDocument || '';
      const findStructuredDoc = (label) => structuredDocs.find((doc) => doc?.label === label || doc?.name === label);
      
      // Parse standard docs
      setDocuments({
        cv: {
          required: Boolean(findStructuredDoc('CV / Resume')) || docString.toLowerCase().includes('cv') || docString.toLowerCase().includes('resume'),
          format: findStructuredDoc('CV / Resume')?.format || 'any',
        },
        coverLetter: {
          required: Boolean(findStructuredDoc('Cover Letter')) || docString.toLowerCase().includes('cover letter'),
          format: findStructuredDoc('Cover Letter')?.format || 'any',
        },
        transcripts: {
          required: Boolean(findStructuredDoc('Academic Transcripts')) || docString.toLowerCase().includes('transcript'),
          format: findStructuredDoc('Academic Transcripts')?.format || 'any',
        },
      });

      // Parse custom docs from the additionalDocs field (if it exists)
      const standardLabels = standardDocumentOptions.map((item) => item.label);
      const structuredCustomDocs = structuredDocs
        .filter((doc) => !standardLabels.includes(doc?.label || doc?.name))
        .map((doc) => ({ name: doc.label || doc.name, format: doc.format || 'any' }));
      const customDocs = editingJob.additionalDocs ? editingJob.additionalDocs.split(',').map(d => d.trim()).filter(Boolean) : [];
      setCustomDocuments(structuredCustomDocs.length > 0 ? structuredCustomDocs : customDocs.map(name => ({ name, format: 'any' })));
    }
  }, [editingJob]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── DOCUMENT HANDLERS ────────────────────────────────────────────────
  const toggleDocument = (docKey) => {
    setDocuments(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], required: !prev[docKey].required }
    }));
  };

  const setDocumentFormat = (docKey, format) => {
    setDocuments(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], format }
    }));
  };

  const addCustomDocument = () => {
    if (newDocName.trim() && !customDocuments.some(d => d.name.toLowerCase() === newDocName.trim().toLowerCase())) {
      setCustomDocuments(prev => [...prev, { name: newDocName.trim(), format: 'any' }]);
      setNewDocName('');
    }
  };

  const removeCustomDocument = (index) => {
    setCustomDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomDocFormat = (index, format) => {
    setCustomDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, format } : doc
    ));
  };

  // ─── BUILD REQUIRED DOCUMENTS ─────────────────────────────────────────
  const buildRequiredDocItems = () => {
    const docs = [];

    standardDocumentOptions.forEach((item) => {
      const documentConfig = documents[item.key];

      if (documentConfig.required) {
        docs.push({
          key: item.key,
          label: item.label,
          format: documentConfig.format,
          formatLabel: getFormatLabel(documentConfig.format),
          inputType: documentConfig.format === 'link' ? 'url' : 'file',
        });
      }
    });

    customDocuments.forEach(doc => {
      docs.push({
        key: doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: doc.name,
        format: doc.format,
        formatLabel: getFormatLabel(doc.format),
        inputType: doc.format === 'link' ? 'url' : 'file',
        custom: true,
      });
    });

    return docs;
  };

  const buildRequiredDocsLabel = () => {
    const docs = buildRequiredDocItems().map((doc) => (
      doc.format !== 'any' ? `${doc.label} (${doc.formatLabel})` : doc.label
    ));

    return docs.join(', ') || 'None specified';
  };

  // ─── SUBMIT ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const jobData = {
      title: formData.title,
      companyName: companyName,
      employerId,
      department: formData.department,
      category: formData.category,
      jobType: formData.jobType,
      location: formData.location,
      duration: formData.duration,
      positions: parseInt(formData.positions) || 1,
      deadline: new Date(formData.deadline),
      stipend: formData.stipend,
      applicationEmail: formData.applicationEmail,
      applicationSubject: formData.applicationSubject,
      description: formData.description,
      requirement: formData.requirement,
      requiredDocuments: buildRequiredDocItems(),
      status: editingJob ? editingJob.status : 'pending',
      metrics: editingJob?.metrics || { views: 0, applications: 0 },
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobData);
        alert('✅ Job updated successfully!');
      } else {
        await createJob(jobData);
        alert('✅ Job posted successfully! It will appear after admin approval.');
      }
      onSuccess();
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
        <h1 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 800, color: NAVY }}>
          {editingJob ? 'Edit Job' : 'Post a Job'}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          {editingJob ? 'Update your job listing.' : 'Create a new listing for students.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─── JOB DETAILS ────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={labelStyle}>Job Details</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Company Name</label>
            <input type="text" value={companyName} disabled style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#475569', cursor: 'not-allowed'}} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Job Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Frontend Developer Intern" style={inputStyle} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Department (Optional)</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Research & Innovation, Marketing, Supply Chain" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} style={{...inputStyle, appearance: 'auto'}} required>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Consulting">Consulting</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Job Type *</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} style={{...inputStyle, appearance: 'auto'}} required>
                <option value="Internship">Internship</option>
                <option value="Graduate Program">Graduate Program</option>
                <option value="Full Time">Full Time</option>
                <option value="Part-time">Part-time</option>
                <option value="Experienced Hire">Experienced Hire</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Duration *</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 Months, 6 Months, 1 Year" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Number of Positions *</label>
              <input type="number" name="positions" value={formData.positions} onChange={handleChange} placeholder="e.g. 3" style={inputStyle} required min="1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Nairobi, Remote" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Application Deadline *</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Stipend / Salary (Optional)</label>
              <input type="text" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. Ksh 25,000 per month" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Application Email *</label>
              <input type="email" name="applicationEmail" value={formData.applicationEmail} onChange={handleChange} placeholder="e.g. careers@company.com" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Application Subject (Optional)</label>
              <input type="text" name="applicationSubject" value={formData.applicationSubject} onChange={handleChange} placeholder="e.g. 'SU-ISERC Intern'" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Job Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Describe the role, responsibilities, and any additional details..." style={{...inputStyle, resize: 'vertical'}} required />
          </div>

          <div>
            <label style={labelStyle}>Requirements / Qualifications *</label>
            <textarea name="requirement" value={formData.requirement} onChange={handleChange} rows="3" placeholder="e.g. Bachelor's degree, specific skills, experience..." style={{...inputStyle, resize: 'vertical'}} required />
          </div>
        </div>

        {/* ─── REVAMPED REQUIRED DOCUMENTS SECTION ────────────────────── */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={labelStyle}>Required Documents</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
            Select required documents and specify the file format for each.
          </p>

          {/* ─── Standard Documents ────────────────────────────────────── */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: NAVY, marginBottom: '10px' }}>Standard Documents</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <DocCheckbox
                  label="CV / Resume"
                  sub=""
                  checked={documents.cv.required}
                  onChange={() => toggleDocument('cv')}
                />
              </div>
              <div style={{ minWidth: '140px' }}>
                <select
                  value={documents.cv.format}
                  onChange={(e) => setDocumentFormat('cv', e.target.value)}
                  style={{...inputStyle, padding: '6px 12px', fontSize: '12px'}}
                >
                  {formatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <DocCheckbox
                  label="Cover Letter"
                  sub=""
                  checked={documents.coverLetter.required}
                  onChange={() => toggleDocument('coverLetter')}
                />
              </div>
              <div style={{ minWidth: '140px' }}>
                <select
                  value={documents.coverLetter.format}
                  onChange={(e) => setDocumentFormat('coverLetter', e.target.value)}
                  style={{...inputStyle, padding: '6px 12px', fontSize: '12px'}}
                >
                  {formatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <DocCheckbox
                  label="Academic Transcripts"
                  sub=""
                  checked={documents.transcripts.required}
                  onChange={() => toggleDocument('transcripts')}
                />
              </div>
              <div style={{ minWidth: '140px' }}>
                <select
                  value={documents.transcripts.format}
                  onChange={(e) => setDocumentFormat('transcripts', e.target.value)}
                  style={{...inputStyle, padding: '6px 12px', fontSize: '12px'}}
                >
                  {formatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Custom Documents ──────────────────────────────────────── */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: NAVY, marginBottom: '10px' }}>Custom Documents</h4>
            
            {customDocuments.map((doc, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500, color: NAVY, fontSize: '14px' }}>• {doc.name}</span>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <select
                    value={doc.format}
                    onChange={(e) => updateCustomDocFormat(index, e.target.value)}
                    style={{...inputStyle, padding: '6px 12px', fontSize: '12px'}}
                  >
                    {formatOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomDocument(index)}
                  style={{ padding: '4px 8px', background: '#fee2e2', border: 'none', borderRadius: '4px', color: '#dc2626', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g. Portfolio, Reference Letter, GitHub Link"
                style={{...inputStyle, flex: 1}}
              />
              <button
                type="button"
                onClick={addCustomDocument}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: NAVY, color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Add any custom document requirements not listed above.
            </p>
          </div>

          {/* ─── Summary Preview ──────────────────────────────────────────── */}
          <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>📄 Documents Required:</p>
            <p style={{ fontSize: '13px', color: NAVY, fontWeight: 500 }}>
              {buildRequiredDocsLabel()}
            </p>
          </div>
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
            {submitting ? (editingJob ? 'Updating...' : 'Posting...') : (editingJob ? 'Update Job' : 'Publish Job')}
          </button>
        </div>
      </form>
    </div>
  );
}
