import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import OnboardingEmailPreview from '../components/OnboardingEmailPreview';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Stat Data ────────────────────────────────────────────────────────────────

const statsData = [
  {
    icon: 'person_check',
    iconColor: 'text-primary',
    iconBg: 'bg-primary-container/10 group-hover:bg-primary-container/20',
    trend: '+4.2%',
    label: 'Student Eligibility',
    value: '86.4%',
    sub: '2,410 Students eligible',
    subColor: 'text-outline',
  },
  {
    icon: 'rocket_launch',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary-container/10 group-hover:bg-secondary-container/20',
    trend: '+12%',
    label: 'Placement Rate',
    value: '72.1%',
    sub: 'Target: 85% by June',
    subColor: 'text-outline',
  },
  {
    icon: 'corporate_fare',
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary-container/10 group-hover:bg-tertiary-container/20',
    trend: null,
    label: 'Corporate Partners',
    value: '142',
    sub: '12 New this quarter',
    subColor: 'text-outline',
  },
  {
    icon: 'pending_actions',
    iconColor: 'text-error',
    iconBg: 'bg-error-container/20 group-hover:bg-error-container/30',
    trend: null,
    label: 'Pending Approvals',
    value: '28',
    sub: 'Requires immediate action',
    subColor: 'text-error font-bold',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, iconColor, iconBg, trend, label, value, sub, subColor }) {
  return (
    <div className="bg-surface-container-lowest p-p-md rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors ${iconBg}`}>
          <span
            className={`material-symbols-outlined ${iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        {trend && (
          <span className="text-secondary font-bold text-label-md flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
            {trend}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-label-md">{label}</p>
      <h3 className="text-[48px] font-extrabold text-on-surface leading-tight mt-1">{value}</h3>
      <p className={`text-caption mt-2 ${subColor}`}>{sub}</p>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ visible, companyName, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-2xl p-p-lg max-w-md w-full shadow-2xl transform transition-all duration-300 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
            >
              check_circle
            </span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-2">
            Drive Launched Successfully!
          </h3>
          <p className="text-body-md text-on-surface-variant mb-8">
            The recruitment drive for <strong>{companyName || 'the company'}</strong> has been
            posted. Eligible students will be notified instantly.
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Admin Profile Modal ─────────────────────────────────────────────────

function EditProfileModal({ visible, profile, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    headline: '',
    profile_image: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile && visible) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        headline: profile.headline || '',
        profile_image: profile.profile_image || '',
      });
      setError('');
    }
  }, [profile, visible]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        setForm((prev) => ({ ...prev, profile_image: compressed }));
      };
    };
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to save profile');
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>manage_accounts</span>
            </div>
            <h2 className="text-white font-bold text-title-lg">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden bg-surface-container">
                {form.profile_image ? (
                  <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-container text-primary text-[32px] font-bold">
                    {form.full_name ? form.full_name[0].toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {form.profile_image && (
              <button
                onClick={() => setForm((f) => ({ ...f, profile_image: '' }))}
                className="text-caption text-error hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          {/* Fields */}
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 xxxxxxxxxx' },
            { label: 'Title / Designation', key: 'headline', type: 'text', placeholder: 'e.g. Chief Placement Officer' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

function AddStudentModal({ visible, token, onClose, onAdded }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    enrollment_id: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm({ full_name: '', email: '', username: '', password: '', enrollment_id: '' });
      setError('');
      setSuccess(false);
    }
  }, [visible]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        const msg = d.detail === 'username_taken'
          ? 'Username already taken. Please choose another.'
          : d.detail === 'email_taken'
          ? 'Email already registered.'
          : d.detail || 'Failed to create student';
        throw new Error(msg);
      }
      const newStudent = await res.json();
      setSuccess(true);
      onAdded(newStudent);
      setTimeout(() => { onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>person_add</span>
            </div>
            <h2 className="text-white font-bold text-title-lg">Add New Student</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary-container text-secondary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '36px' }}>check_circle</span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Student Added!</h3>
            <p className="text-body-md text-on-surface-variant">
              <strong>{form.full_name}</strong> has been added to the system.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Student full name', required: true },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'student@example.com', required: true },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'Unique login username', required: true },
                { label: 'Temporary Password', key: 'password', type: 'password', placeholder: 'Min 6 characters', required: true },
                { label: 'Enrollment ID', key: 'enrollment_id', type: 'text', placeholder: 'e.g. CS2024001', required: false },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key} className={`space-y-1 ${key === 'enrollment_id' ? 'md:col-span-2' : ''}`}>
                  <label className="text-label-md text-on-surface font-semibold">
                    {label} {required && <span className="text-error">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required={required}
                    minLength={key === 'password' ? 6 : undefined}
                    className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                  />
                </div>
              ))}
            </div>

            <p className="text-caption text-on-surface-variant mt-2">
              <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>info</span>
              {' '}The student can update their profile and change their password after first login.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-8 py-3 bg-secondary text-on-secondary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {creating && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {creating ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ student, onConfirm, onCancel, deleting }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Red header strip */}
        <div className="bg-gradient-to-r from-error to-red-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>delete_forever</span>
          </div>
          <h2 className="text-white font-bold text-title-md">Delete Student</h2>
        </div>
        <div className="p-6">
          <p className="text-body-md text-on-surface mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-title-md font-extrabold text-on-surface mb-3">
            {student.full_name || student.username}
          </p>
          <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-caption text-error font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
              This will permanently delete the student and all their applications. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-3 bg-error text-on-error text-label-md font-semibold rounded-xl hover:bg-error/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>delete</span>
              )}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { token, user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Drive form state
  const [form, setForm] = useState({
    company: '', role: '', type: 'Full-Time Graduate',
    eligibility: '', package: '', drive_date: '',
  });
  const [launching, setLaunching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 8;

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch real students from backend
  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch { /* ignore */ } finally {
      setLoadingStudents(false);
    }
  }, [token]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLaunchDrive = async (e) => {
    e.preventDefault();
    setLaunching(true);
    setFormError('');
    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          company: form.company, role: form.role, type: form.type,
          eligibility: form.eligibility, package: form.package, drive_date: form.drive_date,
        }),
      });
      if (!res.ok) throw new Error('Failed to launch drive');
      setShowModal(true);
      setForm({ company: '', role: '', type: 'Full-Time Graduate', eligibility: '', package: '', drive_date: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/signin', { replace: true }); };
  const scrollToForm = () => { formRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      // Go back a page if the current page becomes empty
      const remaining = students.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / STUDENTS_PER_PAGE));
      if (studentPage > newTotalPages) setStudentPage(newTotalPages);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Search + Pagination
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    if (!q) return true;
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.enrollment_id || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const pagedStudents = filteredStudents.slice((studentPage - 1) * STUDENTS_PER_PAGE, studentPage * STUDENTS_PER_PAGE);

  // Admin display info
  const adminName = user?.full_name || user?.username || 'Admin';
  const adminTitle = user?.headline || 'Administrator';
  const adminAvatar = user?.profile_image;
  const adminInitial = adminName[0]?.toUpperCase() || 'A';

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <AdminSidebar onPostDrive={scrollToForm} />

      <main className="flex-1 md:ml-64 min-h-screen pb-20">
        {/* TopBar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-p-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-md ml-2 w-64 placeholder:text-outline/60 outline-none"
                placeholder="Search students, companies..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="h-8 w-px bg-outline-variant mx-1" />

            {/* Clickable profile area */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low px-3 py-1.5 rounded-xl transition-colors active:scale-[0.98]"
              title="Edit Profile"
            >
              <div className="text-right hidden sm:block">
                <p className="text-label-md font-bold text-on-surface">{adminName}</p>
                <p className="text-caption text-on-surface-variant">{adminTitle}</p>
              </div>
              <div className="relative">
                {adminAvatar ? (
                  <img
                    className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
                    src={adminAvatar}
                    alt={adminName}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container text-primary flex items-center justify-center font-bold text-label-md">
                    {adminInitial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-outline-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>edit</span>
                </span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="ml-1 flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors text-label-md"
              title="Logout"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto p-p-lg space-y-10">

          {/* ── Welcome Banner ── */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-caption text-primary font-semibold uppercase tracking-wider mb-1">Admin Portal</p>
              <h1 className="text-headline-lg font-extrabold text-on-surface">
                Welcome back, {adminName.split(' ')[0]} 👋
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">{adminTitle}</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] active:scale-95 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                Add Student
              </button>
              <button
                onClick={scrollToForm}
                className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-xl text-label-md font-semibold hover:bg-primary/5 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
                Launch Drive
              </button>
            </div>
          </div>

          {/* ── Section 1: Stats ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-lg font-bold text-on-surface">Institutional Intelligence</h2>
              <p className="text-body-md text-on-surface-variant">Real-time placement analytics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {statsData.map((s) => <StatCard key={s.label} {...s} />)}
            </div>
          </section>

          {/* ── Section 2+3: Drive Form + Live Feed ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Launch Drive Form */}
            <section className="lg:col-span-7" ref={formRef}>
              <div className="bg-white p-p-lg rounded-2xl border border-outline-variant shadow-sm h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary-container text-on-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">campaign</span>
                  </div>
                  <div>
                    <h2 className="text-headline-md font-bold text-on-surface">Launch Internship Drive</h2>
                    <p className="text-caption text-on-surface-variant">Drives will be visible to all eligible students</p>
                  </div>
                </div>

                {formError && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleLaunchDrive} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Company Name</label>
                      <input
                        name="company" value={form.company} onChange={handleFormChange}
                        required
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. Microsoft India"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Opportunity Type</label>
                      <select
                        name="type" value={form.type} onChange={handleFormChange}
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                      >
                        <option>Full-Time Graduate</option>
                        <option>Summer Internship</option>
                        <option>6-Month Co-op</option>
                        <option>Part-Time Internship</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Job Role</label>
                      <input
                        name="role" value={form.role} onChange={handleFormChange}
                        required
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. Software Engineer I"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Min CGPA Requirement</label>
                      <input
                        name="eligibility" value={form.eligibility} onChange={handleFormChange}
                        type="number" step="0.1" min="0" max="10"
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. 7.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Package (LPA)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">₹</span>
                        <input
                          name="package" value={form.package} onChange={handleFormChange}
                          className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pl-8 pr-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                          placeholder="e.g. 12.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface font-semibold">Drive Date</label>
                      <input
                        name="drive_date" value={form.drive_date} onChange={handleFormChange}
                        type="date"
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-4">
                    <button
                      type="button"
                      className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={launching}
                      className="px-8 py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                      {launching && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {launching ? 'Launching...' : 'Launch Drive'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Quick Stats Panel */}
            <section className="lg:col-span-5">
              <div className="bg-white p-p-lg rounded-2xl border border-outline-variant shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">people</span>
                    </div>
                    <h2 className="text-headline-md font-bold text-on-surface">Student Overview</h2>
                  </div>
                  <span className="px-3 py-1 bg-secondary-container/20 text-secondary text-caption rounded-full font-bold">
                    {students.length} Total
                  </span>
                </div>

                {loadingStudents ? (
                  <div className="flex-1 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '32px' }}>person_off</span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">No students yet</p>
                    <p className="text-caption text-on-surface-variant mt-1">Add your first student to get started</p>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] transition-transform shadow-sm"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                      Add First Student
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
                    {students.slice(0, 6).map((s) => {
                      const initials = s.full_name
                        ? s.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : s.username[0].toUpperCase();
                      return (
                        <div key={s.id} className="p-3 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-outline-variant">
                            {s.profile_image ? (
                              <img src={s.profile_image} alt={s.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center font-bold text-label-md">
                                {initials}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-label-md font-bold text-on-surface truncate">{s.full_name || s.username}</p>
                            <p className="text-caption text-outline truncate">{s.email || s.username}</p>
                          </div>
                          {s.enrollment_id && (
                            <span className="text-[10px] bg-primary-container/20 text-primary px-2 py-0.5 rounded font-semibold flex-shrink-0">
                              {s.enrollment_id}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => setShowAddStudent(true)}
                  className="w-full mt-6 py-2.5 border border-dashed border-primary/40 text-primary text-label-md font-semibold hover:bg-primary/5 transition-colors rounded-xl flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  Add New Student
                </button>
              </div>
            </section>
          </div>

          {/* ── Section 4: Student Management Table ── */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-p-lg border-b border-outline-variant">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">Student Management</h2>
                  <p className="text-body-md text-on-surface-variant">
                    {loadingStudents ? 'Loading...' : `${filteredStudents.length} of ${students.length} student${students.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowEmailPreview(true)}
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>drafts</span>
                    Preview Welcome Email
                  </button>
                  <button className="px-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_upload</span>
                    Bulk Import
                  </button>
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="px-6 py-2 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                    Add Student
                  </button>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                  placeholder="Search by name, email, username or enrollment ID…"
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline/60"
                />
                {studentSearch && (
                  <button
                    onClick={() => { setStudentSearch(''); setStudentPage(1); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    {['Student Name', 'Email', 'Enrollment ID', 'Account Status', 'Joined', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-label-md text-outline font-bold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                        <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading students...
                      </td>
                    </tr>
                  ) : pagedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>person_search</span>
                          <p className="text-body-md text-on-surface-variant font-semibold">
                            {studentSearch ? `No students match "${studentSearch}"` : 'No students found'}
                          </p>
                          {!studentSearch && (
                            <button
                              onClick={() => setShowAddStudent(true)}
                              className="mt-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] transition-transform shadow-sm"
                            >
                              Add First Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedStudents.map((s) => {
                      const initials = s.full_name
                        ? s.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : s.username[0].toUpperCase();
                      const joinedDate = s.created_at
                        ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';
                      // Determine account status
                      const isEligible = s.is_eligible === 1;
                      const isPendingSetup = s.must_change_password === '1';
                      const hasResume = !!s.resume_name;
                      const hasEmail = !!s.email;
                      const hasName = !!s.full_name;
                      const isProfileDone = hasEmail && hasName;

                      let statusLabel, statusBg, statusText, statusIcon;
                      if (isEligible) {
                        statusLabel = 'Eligible';
                        statusBg = 'bg-emerald-50 border-emerald-200';
                        statusText = 'text-emerald-700';
                        statusIcon = 'verified';
                      } else if (isPendingSetup) {
                        statusLabel = 'Pending Setup';
                        statusBg = 'bg-amber-50 border-amber-200';
                        statusText = 'text-amber-700';
                        statusIcon = 'schedule';
                      } else if (!isProfileDone) {
                        statusLabel = 'Profile Incomplete';
                        statusBg = 'bg-slate-50 border-slate-200';
                        statusText = 'text-slate-600';
                        statusIcon = 'person_alert';
                      } else if (!hasResume) {
                        statusLabel = 'Resume Missing';
                        statusBg = 'bg-orange-50 border-orange-200';
                        statusText = 'text-orange-700';
                        statusIcon = 'description';
                      } else {
                        statusLabel = 'Incomplete';
                        statusBg = 'bg-slate-50 border-slate-200';
                        statusText = 'text-slate-500';
                        statusIcon = 'help_outline';
                      }

                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-surface-container-lowest transition-all"
                          style={{ transition: 'background 0.15s, transform 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                                {s.profile_image ? (
                                  <img src={s.profile_image} alt={s.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center font-bold text-caption">
                                    {initials}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-body-md font-bold text-on-surface">{s.full_name || s.username}</p>
                                <p className="text-caption text-outline">@{s.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-body-md text-on-surface-variant">{s.email || '—'}</td>
                          <td className="px-6 py-5">
                            {s.enrollment_id ? (
                              <span className="px-2 py-1 bg-primary-container/20 text-primary text-caption font-semibold rounded-lg">
                                {s.enrollment_id}
                              </span>
                            ) : (
                              <span className="text-outline text-caption">Not set</span>
                            )}
                          </td>
                          {/* Account Status Column */}
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-label-md font-semibold ${statusBg} ${statusText}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{statusIcon}</span>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-caption text-outline">{joinedDate}</td>
                          <td className="px-6 py-5 text-right">
                            <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors" title="Edit student">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors ml-1" title="Reset password">
                              <span className="material-symbols-outlined">key</span>
                            </button>
                            <button
                              onClick={() => setStudentToDelete(s)}
                              className="p-2 hover:bg-error-container/30 rounded-lg text-error transition-colors ml-1"
                              title="Delete student"
                            >
                              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant">
              <p className="text-caption text-on-surface-variant">
                Showing {pagedStudents.length} of {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {studentSearch && ` matching "${studentSearch}"`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={studentPage === 1}
                    onClick={() => setStudentPage((p) => p - 1)}
                    className="p-2 border border-outline-variant rounded-lg bg-white text-outline disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setStudentPage(n)}
                      className={`w-8 h-8 rounded-lg text-label-md font-semibold ${n === studentPage ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface'}`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={studentPage === totalPages}
                    onClick={() => setStudentPage((p) => p + 1)}
                    className="p-2 border border-outline-variant rounded-lg bg-white text-outline disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Modals */}
      <SuccessModal
        visible={showModal}
        companyName={form.company}
        onClose={() => setShowModal(false)}
      />
      <EditProfileModal
        visible={showEditProfile}
        profile={user || {}}
        token={token}
        onClose={() => setShowEditProfile(false)}
        onSaved={(updated) => setUser(updated)}
      />
      <AddStudentModal
        visible={showAddStudent}
        token={token}
        onClose={() => setShowAddStudent(false)}
        onAdded={(newStudent) => setStudents((prev) => [newStudent, ...prev])}
      />
      <ConfirmDeleteModal
        student={studentToDelete}
        onConfirm={handleDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
        deleting={deleting}
      />
      <OnboardingEmailPreview
        visible={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
      />
    </div>
  );
}
