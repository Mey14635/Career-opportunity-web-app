// src/pages/admin/views/StudentsView.jsx
import { useState, useMemo } from 'react';
import { Search, X, Mail, Phone, ExternalLink } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import { NAVY, GOLD } from '../constants';

export default function StudentsView({ studentsData, searchQuery = '' }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ─── COMBINED FILTER: uses both global searchQuery and local searchTerm ──
  const filteredStudents = useMemo(() => {
    const search = (searchQuery || '') + ' ' + (localSearchTerm || '');
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (terms.length === 0) return studentsData;

    return studentsData.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const studentId = (s.studentId || '').toLowerCase();
      const course = (s.course || '').toLowerCase();
      const email = (s.email || s.personalEmail || '').toLowerCase();

      // match all terms (AND logic)
      return terms.every(term =>
        fullName.includes(term) ||
        studentId.includes(term) ||
        course.includes(term) ||
        email.includes(term)
      );
    });
  }, [studentsData, searchQuery, localSearchTerm]);

  const openModal = (student) => setSelectedStudent(student);
  const closeModal = () => setSelectedStudent(null);

  const getStudentStatus = (student) => {
    if (student.profileCompleted === true) return 'Complete';
    if (student.profileCompleted === false) return 'Incomplete';
    return student.verificationStatus || 'Complete';
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Students</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Manage and inspect registered student accounts and profiles.</p>
        </div>
        {/* ─── LOCAL SEARCH INPUT ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', padding: '10px 16px', borderRadius: 8, width: 300, border: '1px solid #e2e8f0' }}>
          <Search size={16} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Search by name of student"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#1e293b' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
              {['STUDENT NAME', 'COURSE OF STUDY', 'ACADEMIC YEAR', 'PROFILE STATUS', 'ACTIONS'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{`${s.firstName} ${s.lastName}`}</td>
                  <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{s.course}</td>
                  <td style={{ padding: '20px 24px', fontSize: 14, color: '#94a3b8' }}>{s.yearOfStudy || 'N/A'}</td>
                  <td style={{ padding: '20px 24px' }}><StatusBadge status={getStudentStatus(s)} /></td>
                  <td style={{ padding: '20px 24px' }}>
                    <button
                      onClick={() => openModal(s)}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── STUDENT PROFILE MODAL ──────────────────────────────────── */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(2px)',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '32px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color="#64748b" />
            </button>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                {selectedStudent.course}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              {selectedStudent.studentId && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Student ID</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#1e293b' }}>
                    {selectedStudent.studentId}
                  </p>
                </div>
              )}

              {selectedStudent.yearOfStudy && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Academic Year</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#1e293b' }}>
                    {selectedStudent.yearOfStudy}
                  </p>
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Email</label>
                <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="#94a3b8" />
                  {selectedStudent.personalEmail || selectedStudent.email || 'Not provided'}
                </p>
              </div>

              {selectedStudent.phone && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Phone</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#94a3b8" />
                    {selectedStudent.phone}
                  </p>
                </div>
              )}
            </div>

            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {selectedStudent.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 12,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.interests && selectedStudent.interests.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {selectedStudent.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 12,
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.portfolioUrl && (
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Portfolio / GitHub</label>
                <p style={{ margin: '4px 0 0 0', fontSize: 14 }}>
                  <a
                    href={selectedStudent.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: GOLD, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {selectedStudent.portfolioUrl} <ExternalLink size={14} />
                  </a>
                </p>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Profile Status</label>
              <div style={{ marginTop: 4 }}>
                <StatusBadge status={getStudentStatus(selectedStudent)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}