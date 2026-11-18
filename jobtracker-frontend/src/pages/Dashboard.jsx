import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ setToken }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'applications', 'settings'
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [editingAppId, setEditingAppId] = useState(null);

  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('applied');
  const [notes, setNotes] = useState('');

  const [uploadingId, setUploadingId] = useState(null);

  const API_URL = 'https://jobtracker-api-k18g.onrender.com'; 
  const getToken = () => localStorage.getItem('token');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  }, [navigate, setToken]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = getToken();
      if (!token) return handleLogout();

      try {
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
          setApplications(appData);
          setStats(statsData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [triggerFetch, handleLogout]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = getToken();
    const newApp = { company_name: company, job_title: jobTitle, status, notes: notes || null };

    try {
      const res = await fetch(`${API_URL}/applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        setCompany(''); setJobTitle(''); setNotes(''); setStatus('applied');
        setIsAdding(false);
        setTriggerFetch(prev => prev + 1);
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this application?")) return;
    const token = getToken();
    try {
      await fetch(`${API_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTriggerFetch(prev => prev + 1);
    } catch (err) { console.error(err); }
  };

  const openEditModal = (app) => {
    setEditingAppId(app.id);
    setCompany(app.company_name);
    setJobTitle(app.job_title);
    setStatus(app.status);
    setNotes(app.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = getToken();
    const updatedApp = {
      company_name: company,
      job_title: jobTitle,
      status: status,
      notes: notes || null,
    };

    try {
      const res = await fetch(`${API_URL}/applications/${editingAppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedApp),
      });
      
      if (res.ok) {
        setEditingAppId(null);
        setTriggerFetch(prev => prev + 1);
      }
    } catch (err) { console.error(err); }
  };

  const handleUploadResume = async (e, appId) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Please upload a PDF file.");

    setUploadingId(appId);
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/applications/${appId}/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setTriggerFetch(prev => prev + 1); 
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingId(null);
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
        alert("Resume file not found. It may have been wiped on server restart.");
      }
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interviewing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'offer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xl text-indigo-600 font-semibold animate-pulse">Loading Workspace...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tighter text-indigo-400">JobTracker<span className="text-white">.pro</span></span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span>📊</span> Overview
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span>📄</span> Applications
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span>⚙️</span> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-lg font-medium transition">
            <span>🚪</span> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 relative">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setCompany(''); setJobTitle(''); setNotes(''); setIsAdding(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
            >
              + New Application
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold hover:bg-indigo-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                U
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">My Account</p>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">Settings</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-medium">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8" onClick={() => setIsUserMenuOpen(false)}>
          
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                      <p className="text-sm font-medium text-slate-500 capitalize mb-1">{key.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
                Welcome to your dashboard! Click on <strong className="text-indigo-600 cursor-pointer" onClick={() => setActiveTab('applications')}>Applications</strong> in the sidebar to manage your job hunt.
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Resume</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.length === 0 ? (
                      <tr><td colSpan="5" className="p-12 text-center text-slate-500">No applications yet. Click "+ New Application" to start.</td></tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {app.company_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-800">{app.company_name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{app.job_title}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              <input type="file" id={`resume-${app.id}`} accept=".pdf" className="hidden" onChange={(e) => handleUploadResume(e, app.id)} />
                              {app.resume_filename ? (
                                <div className="flex flex-col items-center gap-1">
                                  <button onClick={() => handleViewResume(app.id)} className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1">
                                    <span>📄</span> View
                                  </button>
                                  <label htmlFor={`resume-${app.id}`} className="cursor-pointer text-[10px] text-slate-400 hover:text-indigo-600 underline">Replace</label>
                                </div>
                              ) : (
                                <label htmlFor={`resume-${app.id}`} className={`cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800 ${uploadingId === app.id ? 'opacity-50' : ''}`}>
                                  {uploadingId === app.id ? '...' : 'Upload'}
                                </label>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => openEditModal(app)} className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition">Edit</button>
                            <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-rose-600 font-medium text-sm transition">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👇 TAB 3: SETTINGS (Placeholder) */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Settings</h2>
                <p className="text-slate-500 mb-6">This is where users would update their email, password, and notification preferences.</p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-block">
                  <p className="text-sm text-slate-600">User Email: <span className="font-semibold">Test User</span></p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL FOR CREATE & EDIT (Remains the same) */}
      {(isAdding || editingAppId) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingAppId ? 'Edit Application' : 'New Application'}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingAppId(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={editingAppId ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm">
                  {editingAppId ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}