import { useState, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX } from 'react-icons/fi';
import { lecturersAPI } from '../../services/api';
import { useDeferredEffect } from '../../hooks/useDeferredEffect';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', staffId: '', department: '', specialisation: '', phone: '' };

export default function LecturerManagement() {
  const [lecturers, setLecturers]   = useState([]);
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
      const { data } = await lecturersAPI.getAll({ page, limit: 15, search: search || undefined });
      setLecturers(data.data);
      setPagination(data.meta);
    } catch { toast.error('Failed to load lecturers'); }
    finally { setLoading(false); }
  }, [page, search]);

  useDeferredEffect(() => { load(); }, [load]);
  useDeferredEffect(() => { setPage(1); }, [search]);

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setShowModal(true); };
  const openEdit = (l) => {
    setForm({ name: l.name, email: l.email, staffId: l.staff_id, department: l.department || '', specialisation: l.specialisation || '', phone: l.phone || '' });
    setEditTarget(l); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) { await lecturersAPI.update(editTarget.id, form); toast.success('Lecturer updated'); }
      else { await lecturersAPI.create(form); toast.success('Lecturer created — credentials emailed'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (l) => {
    if (!window.confirm(`Deactivate ${l.name}?`)) return;
    try { await lecturersAPI.remove(l.id); toast.success('Lecturer deactivated'); load(); }
    catch { toast.error('Operation failed'); }
  };

  const F = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Lecturer Management</h1>
          <p className="page-subtitle">{pagination?.total ?? 0} lecturers registered</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn btn-outline btn-sm"><FiRefreshCw size={14} /></button>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><FiPlus size={16} /> Add Lecturer</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, staff ID or email..." />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><FiX size={14} /></button>}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
        ) : lecturers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No lecturers found</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Staff ID</th><th>Department</th><th>Specialisation</th><th>Courses</th><th>Actions</th></tr></thead>
            <tbody>
              {lecturers.map((l, i) => (
                <tr key={l.id}>
                  <td style={{ color: '#94A3B8' }}>{(page - 1) * 15 + i + 1}</td>
                  <td><div style={{ fontWeight: 600, color: '#1E293B' }}>{l.name}</div><div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{l.email}</div></td>
                  <td><code style={{ background: '#EDE9FE', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem', color: '#7C3AED' }}>{l.staff_id}</code></td>
                  <td style={{ color: '#64748B', fontSize: '0.875rem' }}>{l.department || '—'}</td>
                  <td style={{ color: '#64748B', fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.specialisation || '—'}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700 }}>—</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(l)} style={{ background: '#EDE9FE', border: 'none', color: '#7C3AED', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiEdit2 size={13} /></button>
                      <button onClick={() => handleDelete(l)} style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={13} /></button>
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
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B' }}>{editTarget ? 'Edit Lecturer' : 'Add New Lecturer'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', req: true },
                { label: 'Email *', key: 'email', type: 'email', req: true },
                { label: 'Staff ID *', key: 'staffId', type: 'text', req: !editTarget, disabled: !!editTarget },
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Specialisation', key: 'specialisation', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(({ label, key, type, req, disabled }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} {...F(key)} required={req} disabled={disabled} style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editTarget ? 'Update' : 'Create Lecturer'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
