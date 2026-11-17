import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('applied');
  const [notes, setNotes] = useState('');

  const [editingAppId, setEditingAppId] = useState(null);
  const [editCompany, setEditCompany] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editStatus, setEditStatus] = useState('applied');
  const [editNotes, setEditNotes] = useState('');

  const [uploadingId, setUploadingId] = useState(null);

  const API_URL = 'https://jobtracker-api-k18g.onrender.com'; // Make sure this is your backend URL!
  const getToken = () => localStorage.getItem('token');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

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
        setTriggerFetch(prev => prev + 1);
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
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
    setEditCompany(app.company_name);
    setEditJobTitle(app.job_title);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = getToken();
    const updatedApp = {
      company_name: editCompany,
      job_title: editJobTitle,
      status: editStatus,
      notes: editNotes || null,
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

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setUploadingId(appId);
    const token = getToken();
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/applications/${appId}/resume`, {
        method: 'POST',
        headers: {
          
          Authorization: `Bearer ${token}`, 
        },
        body: formData,
      });

      if (res.ok) {
        setTriggerFetch(prev => prev + 1); 
        alert("Failed to upload resume.");
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

  const getStatusColor = (s) => {
    switch(s) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {editingAppId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Application</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Company</label>
                <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Role</label>
                <input type="text" value={editJobTitle} onChange={(e) => setEditJobTitle(e.target.value)} required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2 border rounded">
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Notes</label>
                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setEditingAppId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-indigo-600">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Application</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required className="flex-1 min-w-[200px] p-2 border rounded" />
            <input type="text" placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="flex-1 min-w-[200px] p-2 border rounded" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-w-[200px] p-2 border rounded" />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Add Job</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-600">Company</th>
                <th className="p-4 text-gray-600">Role</th>
                <th className="p-4 text-gray-600">Status</th>
                <th className="p-4 text-gray-600">Notes</th>
                <th className="p-4 text-gray-600 text-center">Resume</th>
                <th className="p-4 text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No applications yet.</td></tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{app.company_name}</td>
                    <td className="p-4 text-gray-600">{app.job_title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm truncate max-w-[150px]">{app.notes || '-'}</td>
                    
                    <td className="p-4 text-center">
                      {app.resume_filename ? (
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">✅ Uploaded</span>
                      ) : (
                        <div>
                          <input 
                            type="file" 
                            id={`resume-${app.id}`} 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={(e) => handleUploadResume(e, app.id)} 
                          />
                          <label 
                            htmlFor={`resume-${app.id}`}
                            className={`cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800 ${uploadingId === app.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {uploadingId === app.id ? 'Uploading...' : 'Upload PDF'}
                          </label>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEditModal(app)} className="text-indigo-500 hover:text-indigo-700 font-semibold text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}