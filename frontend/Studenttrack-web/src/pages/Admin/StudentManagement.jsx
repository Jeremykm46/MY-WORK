import { useState, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiUser, FiRefreshCw, FiX } from 'react-icons/fi';
import { studentsAPI } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', studentId: '', department: '', yearOfStudy: '', phone: '' };

export default function StudentManagement() {
  const [students, setStudents]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studentsAPI.getAll({ page, limit: 15, search: search || undefined });
      setStudents(data.data);
      setPagination(data.meta);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search]);

  useDeferredEffect(() => { load(); }, [load]);
  useDeferredEffect(() => { setPage(1); }, [search]);

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, studentId: s.student_id, department: s.department || '', yearOfStudy: s.year_of_study || '', phone: s.phone || '' });
    setEditTarget(s); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) { await studentsAPI.update(editTarget.id, form); toast.success('Student updated'); }
      else { await studentsAPI.create(form); toast.success('Student created — credentials emailed'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Deactivate ${s.name}?`)) return;
    try { await studentsAPI.remove(s.id); toast.success('Student deactivated'); load(); }
    catch { toast.error('Operation failed'); }
  };

  const F = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">{pagination?.total ?? 0} students enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn btn-outline btn-sm"><FiRefreshCw size={14} /></button>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><FiPlus size={16} /> Add Student</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID or email..." />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><FiX size={14} /></button>}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}><FiUser size={40} color="#CBD5E1" /><p style={{ color: '#94A3B8', marginTop: 12 }}>No students found</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Student ID</th><th>Department</th><th>Year</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: '#94A3B8' }}>{(page - 1) * 15 + i + 1}</td>
                  <td><div style={{ fontWeight: 600, color: '#1E293B' }}>{s.name}</div><div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.email}</div></td>
                  <td><code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem' }}>{s.student_id}</code></td>
                  <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{s.department || '—'}</td>
                  <td style={{ color: '#64748B', fontSize: '0.875rem' }}>Year {s.year_of_study || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{s.last_login ? new Date(s.last_login).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ background: '#EDE9FE', border: 'none', color: '#7C3AED', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={13} /></button>
                      <button onClick={() => handleDelete(s)} style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="btn btn-outline btn-sm">← Prev</button>
          <span style={{ padding: '8px 16px', background: '#F1F5F9', borderRadius: 8, fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage} className="btn btn-outline btn-sm">Next →</button>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B' }}>{editTarget ? 'Edit Student' : 'Add New Student'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', req: true },
                { label: 'Email *', key: 'email', type: 'email', req: true },
                { label: 'Student ID *', key: 'studentId', type: 'text', req: !editTarget, disabled: !!editTarget },
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Year of Study', key: 'yearOfStudy', type: 'number' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(({ label, key, type, req, disabled }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} {...F(key)} required={req} disabled={disabled} style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editTarget ? 'Update' : 'Create Student'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
