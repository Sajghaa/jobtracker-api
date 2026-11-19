import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const IconBase = ({ children, className = 'w-5 h-5', ...rest }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

const Icons = {
  Grid:         (p) => <IconBase {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></IconBase>,
  Briefcase:    (p) => <IconBase {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></IconBase>,
  Settings:     (p) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></IconBase>,
  LogOut:       (p) => <IconBase {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></IconBase>,
  Plus:         (p) => <IconBase {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconBase>,
  Search:       (p) => <IconBase {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IconBase>,
  ChevronDown:  (p) => <IconBase {...p}><polyline points="6 9 12 15 18 9"/></IconBase>,
  Edit:         (p) => <IconBase {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconBase>,
  Trash:        (p) => <IconBase {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></IconBase>,
  File:         (p) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></IconBase>,
  Upload:       (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconBase>,
  Check:        (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  X:            (p) => <IconBase {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconBase>,
  Menu:         (p) => <IconBase {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></IconBase>,
  Send:         (p) => <IconBase {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></IconBase>,
  Calendar:     (p) => <IconBase {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></IconBase>,
  CheckCircle:  (p) => <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
  XCircle:      (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></IconBase>,
  MinusCircle:  (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></IconBase>,
  Inbox:        (p) => <IconBase {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></IconBase>,
  Sparkles:     (p) => <IconBase {...p}><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/></IconBase>,
  AlertCircle:  (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>,
};

const STATUS_CONFIG = {
  applied:      { label: 'Applied',      dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',          icon: Icons.Send,         hex: '#3b82f6' },
  interviewing: { label: 'Interviewing', dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',       icon: Icons.Calendar,     hex: '#f59e0b' },
  offer:        { label: 'Offer',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: Icons.CheckCircle,  hex: '#10b981' },
  rejected:     { label: 'Rejected',     dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',          icon: Icons.XCircle,      hex: '#f43f5e' },
  withdrawn:    { label: 'Withdrawn',    dot: 'bg-slate-400',   badge: 'bg-slate-50 text-slate-700 ring-slate-600/20',       icon: Icons.MinusCircle,  hex: '#94a3b8' },
};
const getStatus = (s) => STATUS_CONFIG[s] || { label: s, dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-700 ring-slate-600/20', icon: Icons.Inbox, hex: '#94a3b8' };

export default function Dashboard({ setToken }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [user, setUser] = useState({ full_name: '', email: '' });

  const [activeTab, setActiveTab] = useState('overview');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingAppId, setEditingAppId] = useState(null);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('applied');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [uploadingId, setUploadingId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const API_URL = 'https://jobtracker-api-k18g.onrender.com';
  const getToken = () => localStorage.getItem('token');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  }, [navigate, setToken]);

  const initials = user.full_name
    ? user.full_name.trim().substring(0, 2).toUpperCase()
    : 'ME';

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = getToken();
      if (!token) return handleLogout();

      try {
        const userRes = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.status === 401) return handleLogout();
        const userData = await userRes.json();

        const appRes = await fetch(`${API_URL}/applications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.status === 401) return handleLogout();
        const appData = await appRes.json();

        const statsRes = await fetch(`${API_URL}/applications/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();

        if (isMounted) {
          setUser(userData);
          setApplications(appData);
          setStats(statsData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [triggerFetch, handleLogout]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setIsAdding(false);
        setEditingAppId(null);
        setDeleteTarget(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const resetForm = () => {
    setCompany(''); setJobTitle(''); setStatus('applied'); setNotes('');
    setEditingAppId(null);
  };

  const openCreateModal = () => { resetForm(); setIsAdding(true); };

  const openEditModal = (app) => {
    setEditingAppId(app.id);
    setCompany(app.company_name);
    setJobTitle(app.job_title);
    setStatus(app.status);
    setNotes(app.notes || '');
  };

  const closeModal = () => { setIsAdding(false); resetForm(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = getToken();
    const newApp = { company_name: company, job_title: jobTitle, status, notes: notes || null };

    try {
      const res = await fetch(`${API_URL}/applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        closeModal();
        showToast('Application added');
        setTriggerFetch((p) => p + 1);
      } else {
        showToast('Failed to add application', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = getToken();
    const updatedApp = { company_name: company, job_title: jobTitle, status, notes: notes || null };

    try {
      const res = await fetch(`${API_URL}/applications/${editingAppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedApp),
      });
      if (res.ok) {
        closeModal();
        showToast('Application updated');
        setTriggerFetch((p) => p + 1);
      } else {
        showToast('Failed to update', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    const id = deleteTarget.id;
    try {
      await fetch(`${API_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteTarget(null);
      showToast('Application deleted');
      setTriggerFetch((p) => p + 1);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    }
  };

  const handleUploadResume = async (e, appId) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    setUploadingId(appId);
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/applications/${appId}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showToast('Resume uploaded');
        setTriggerFetch((p) => p + 1);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(`Upload failed: ${errorData.detail || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Upload failed', 'error');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  const handleViewResume = async (appId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        window.open(window.URL.createObjectURL(blob), '_blank');
      } else {
        showToast('Resume not found on server', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to open resume', 'error');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = getToken();
    const newName = e.target.full_name.value.trim();
    if (!newName) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: newName }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast('Profile updated successfully');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile', 'error');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      || app.company_name.toLowerCase().includes(q)
      || app.job_title.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = { all: applications.length };
  ['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].forEach((s) => {
    statusCounts[s] = applications.filter((a) => a.status === s).length;
  });

  const pieData = [
    { name: 'Applied',      value: statusCounts.applied,      color: STATUS_CONFIG.applied.hex },
    { name: 'Interviewing', value: statusCounts.interviewing, color: STATUS_CONFIG.interviewing.hex },
    { name: 'Offer',        value: statusCounts.offer,        color: STATUS_CONFIG.offer.hex },
    { name: 'Rejected',     value: statusCounts.rejected,     color: STATUS_CONFIG.rejected.hex },
    { name: 'Withdrawn',    value: statusCounts.withdrawn,    color: STATUS_CONFIG.withdrawn.hex },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex h-screen">
          <div className="hidden md:flex w-64 bg-slate-900 flex-col">
            <div className="h-16 border-b border-slate-800 flex items-center px-6">
              <div className="h-5 w-32 bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-8 space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-900">

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
            <Icons.Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            JobTracker<span className="text-indigo-400">.pro</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Workspace</p>
          <NavItem
            icon={Icons.Grid}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
          />
          <NavItem
            icon={Icons.Briefcase}
            label="Applications"
            count={applications.length}
            active={activeTab === 'applications'}
            onClick={() => { setActiveTab('applications'); setIsMobileSidebarOpen(false); }}
          />

          <p className="px-3 py-2 mt-6 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Account</p>
          <NavItem
            icon={Icons.Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
          />
        </nav>

        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 capitalize tracking-tight">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Icons.Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Application</span>
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
                <Icons.ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.full_name || 'My Account'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email || 'Personal workspace'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('settings'); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icons.Settings className="w-4 h-4 text-slate-400" /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Icons.LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Welcome back{user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">A quick snapshot of your job search.</p>
                </div>
                {stats && Object.keys(stats).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {Object.entries(stats).map(([key, value]) => {
                      const cfg = STATUS_CONFIG[key.toLowerCase()] || null;
                      const Icon = cfg?.icon || Icons.Briefcase;
                      return (
                        <div key={key} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-indigo-600" />
                            </div>
                          </div>
                          <p className="text-3xl font-semibold text-slate-900 mt-3 tracking-tight">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline Breakdown</h3>
                    {applications.length === 0 ? (
                      <p className="text-sm text-slate-500">No data yet.</p>
                    ) : (
                      <div className="space-y-4 mt-6">
                        {['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].map((s) => {
                          const count = statusCounts[s] || 0;
                          const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                          const cfg = getStatus(s);
                          return (
                            <div key={s}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-600 capitalize">{cfg.label}</span>
                                <span className="text-xs font-semibold text-slate-500">{count} ({pct}%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${cfg.dot} transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Status Distribution</h3>
                    {applications.length === 0 || pieData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-sm text-slate-400 min-h-[250px]">No data</div>
                    ) : (
                      <div className="flex-1 min-h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {pieData.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                        {pieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                            <span>{d.name}</span>
                            <span className="font-semibold text-slate-500">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Recent applications</h3>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View all →
                    </button>
                  </div>
                  {applications.length === 0 ? (
                    <EmptyState
                      icon={Icons.Inbox}
                      title="No applications yet"
                      description="Add your first job application to start tracking."
                      action={<button onClick={openCreateModal} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">+ New Application</button>}
                    />
                  ) : (
                    <ul className="divide-y divide-slate-100 -mx-2">
                      {applications.slice(0, 5).map((app) => {
                        const cfg = getStatus(app.status);
                        return (
                          <li key={app.id} className="flex items-center justify-between px-2 py-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                                {app.company_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{app.company_name}</p>
                                <p className="text-xs text-slate-500 truncate">{app.job_title}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 ml-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Applications</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {applications.length} {applications.length === 1 ? 'application' : 'applications'} tracked.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search company or role..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {['all', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].map((s) => {
                      const active = statusFilter === s;
                      const label = s === 'all' ? 'All' : getStatus(s).label;
                      return (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                          <span className={`ml-1.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                            {statusCounts[s]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  {filteredApplications.length === 0 ? (
                    <EmptyState
                      icon={applications.length === 0 ? Icons.Inbox : Icons.Search}
                      title={applications.length === 0 ? 'No applications yet' : 'No results'}
                      description={
                        applications.length === 0
                          ? 'Click "New Application" to start tracking your job search.'
                          : 'Try adjusting your search or filters.'
                      }
                      action={
                        applications.length === 0 ? (
                          <button onClick={openCreateModal} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            + Add your first application
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Clear filters
                          </button>
                        )
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Resume</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredApplications.map((app) => {
                            const cfg = getStatus(app.status);
                            return (
                              <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold shrink-0">
                                      {app.company_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-sm text-slate-900">{app.company_name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{app.job_title}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cfg.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex justify-center">
                                    <input
                                      type="file"
                                      id={`resume-${app.id}`}
                                      accept=".pdf"
                                      className="hidden"
                                      onChange={(e) => handleUploadResume(e, app.id)}
                                    />
                                    {app.resume_filename ? (
                                      <div className="inline-flex items-center gap-1.5">
                                        <button
                                          onClick={() => handleViewResume(app.id)}
                                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-medium"
                                        >
                                          <Icons.File className="w-3.5 h-3.5" /> View
                                        </button>
                                        <span className="text-slate-300">·</span>
                                        <label
                                          htmlFor={`resume-${app.id}`}
                                          className="cursor-pointer text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                                        >
                                          {uploadingId === app.id ? 'Uploading…' : 'Replace'}
                                        </label>
                                      </div>
                                    ) : (
                                      <label
                                        htmlFor={`resume-${app.id}`}
                                        className={`cursor-pointer inline-flex items-center gap-1 text-xs font-medium ${
                                          uploadingId === app.id ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-700'
                                        }`}
                                      >
                                        <Icons.Upload className="w-3.5 h-3.5" />
                                        {uploadingId === app.id ? 'Uploading…' : 'Upload'}
                                      </label>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => openEditModal(app)}
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                      aria-label="Edit"
                                    >
                                      <Icons.Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteTarget(app)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                      aria-label="Delete"
                                    >
                                      <Icons.Trash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your account and preferences.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {user.full_name || 'My Account'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email || '—'}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                      <Field label="Full Name">
                        <input
                          type="text"
                          name="full_name"
                          defaultValue={user.full_name || ''}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                        />
                      </Field>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  </div>

                  <SettingsRow
                    icon={Icons.AlertCircle}
                    title="Notifications"
                    description="Email reminders for interviews and follow-ups."
                    disabled
                  />
                  <SettingsRow
                    icon={Icons.File}
                    title="Data export"
                    description="Download a copy of all your application data."
                    disabled
                  />
                </div>

                <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-rose-700">Danger zone</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button
                    disabled
                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 cursor-not-allowed opacity-60"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      {(isAdding || editingAppId) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {editingAppId ? 'Edit application' : 'New application'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingAppId ? 'Update the details below.' : 'Track a new role in your pipeline.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Close"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingAppId ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <Field label="Company">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  autoFocus
                  placeholder="e.g. Stripe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                />
              </Field>
              <Field label="Role">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                />
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </Field>
              <Field label="Notes" hint="Optional">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Recruiter name, referral, salary range…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-none"
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg shadow-sm shadow-indigo-600/20 transition-colors"
                >
                  {isSubmitting ? 'Saving…' : editingAppId ? 'Save changes' : 'Add application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <Icons.Trash className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Delete application?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete the application for{' '}
              <span className="font-medium text-slate-700">{deleteTarget.company_name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm shadow-rose-600/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.2s_ease-out] ${
              t.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {t.type === 'error' ? <Icons.AlertCircle className="w-4 h-4 shrink-0" /> : <Icons.Check className="w-4 h-4 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

function NavItem({ icon: Icon, label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-indigo-500/10 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : ''}`} />
      <span className="flex-1 text-left">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SettingsRow({ icon: Icon, title, description, disabled }) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {disabled && (
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Soon</span>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4 max-w-xs mx-auto">{description}</p>
      {action}
    </div>
  );
}