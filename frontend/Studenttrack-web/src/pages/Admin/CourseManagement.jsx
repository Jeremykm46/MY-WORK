import { useState, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX } from 'react-icons/fi';
import { coursesAPI, lecturersAPI } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

const EMPTY = { code: '', name: '', description: '', creditHours: 3, department: '', semester: 'Semester 1', academicYear: '2025/2026', lecturerId: '' };

export default function CourseManagement() {
  const [courses, setCourses]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [lecturers, setLecturers]   = useState([]);
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
      const [courseRes, lecRes] = await Promise.all([
        coursesAPI.getAll({ page, limit: 15, search: search || undefined }),
        lecturersAPI.getAll({ limit: 100 }),
      ]);
      setCourses(courseRes.data.data);
      setPagination(courseRes.data.meta);
      setLecturers(lecRes.data.data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }, [page, search]);

  useDeferredEffect(() => { load(); }, [load]);
  useDeferredEffect(() => { setPage(1); }, [search]);

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({ code: c.code, name: c.name, description: c.description || '', creditHours: c.credit_hours, department: c.department || '', semester: c.semester, academicYear: c.academic_year, lecturerId: c.lecturer_id || '' });
    setEditTarget(c); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, lecturerId: form.lecturerId || null };
      if (editTarget) { await coursesAPI.update(editTarget.id, payload); toast.success('Course updated'); }
      else { await coursesAPI.create(payload); toast.success('Course created'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete course ${c.code}?`)) return;
    try { await coursesAPI.remove(c.id); toast.success('Course deleted'); load(); }
    catch { toast.error('Operation failed'); }
  };

  const F = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">{pagination?.total ?? 0} active courses</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn btn-outline btn-sm"><FiRefreshCw size={14} /></button>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><FiPlus size={16} /> Add Course</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or name..." />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><FiX size={14} /></button>}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No courses found</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Code</th><th>Course Name</th><th>Lecturer</th><th>Department</th><th>Credits</th><th>Students</th><th>Actions</th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><code style={{ background: '#DBEAFE', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem', color: '#2563EB', fontWeight: 700 }}>{c.code}</code></td>
                  <td><div style={{ fontWeight: 600, color: '#1E293B' }}>{c.name}</div><div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{c.semester} · {c.academic_year}</div></td>
                  <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{c.lecturer_name || <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>Unassigned</span>}</td>
                  <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{c.department || '—'}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600 }}>{c.credit_hours} cr</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700 }}>{c.enrolled_students}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ background: '#EDE9FE', border: 'none', color: '#7C3AED', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={13} /></button>
                      <button onClick={() => handleDelete(c)} style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B' }}>{editTarget ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Course Code *</label><input className="form-input" {...F('code')} required style={{ width: '100%' }} /></div>
                <div className="form-group"><label className="form-label">Credit Hours</label><input className="form-input" type="number" min="1" max="6" {...F('creditHours')} style={{ width: '100%' }} /></div>
              </div>
              <div className="form-group"><label className="form-label">Course Name *</label><input className="form-input" {...F('name')} required style={{ width: '100%' }} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" {...F('description')} rows={2} style={{ width: '100%', resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Department</label><input className="form-input" {...F('department')} style={{ width: '100%' }} /></div>
                <div className="form-group"><label className="form-label">Semester</label>
                  <select className="form-input" {...F('semester')} style={{ width: '100%' }}>
                    {['Semester 1','Semester 2','Semester 3'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Academic Year</label><input className="form-input" {...F('academicYear')} placeholder="2025/2026" style={{ width: '100%' }} /></div>
                <div className="form-group"><label className="form-label">Assign Lecturer</label>
                  <select className="form-input" value={form.lecturerId} onChange={e => setForm(p => ({ ...p, lecturerId: e.target.value }))} style={{ width: '100%' }}>
                    <option value="">— Unassigned —</option>
                    {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editTarget ? 'Update' : 'Create Course'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
