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

  const API_URL = 'http://127.0.0.1:8000';
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

    return () => {
      isMounted = false;
    };
  }, [triggerFetch, handleLogout]); 

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = getToken();

    const newApp = {
      company_name: company,
      job_title: jobTitle,
      status: status,
      notes: notes || null,
    };

    try {
      const res = await fetch(`${API_URL}/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newApp),
      });

      if (res.ok) {
        setCompany('');
        setJobTitle('');
        setNotes('');
        setStatus('applied');
        setTriggerFetch(prev => prev + 1); 
      }
    } catch (err) {
      console.error("Failed to create", err);
    }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      await fetch(`${API_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTriggerFetch(prev => prev + 1); 
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Row */}
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

        {/* Add Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Application</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <input 
              type="text" 
              placeholder="Company Name" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              required 
              className="flex-1 min-w-[200px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <input 
              type="text" 
              placeholder="Job Title" 
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)} 
              required 
              className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <input 
              type="text" 
              placeholder="Notes (optional)" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold"
            >
              Add Job
            </button>
          </form>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-600 font-semibold">Company</th>
                <th className="p-4 text-gray-600 font-semibold">Role</th>
                <th className="p-4 text-gray-600 font-semibold">Status</th>
                <th className="p-4 text-gray-600 font-semibold">Notes</th>
                <th className="p-4 text-gray-600 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No applications yet. Add one above!
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{app.company_name}</td>
                    <td className="p-4 text-gray-600">{app.job_title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm truncate max-w-[200px]">
                      {app.notes || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(app.id)} 
                        className="text-red-500 hover:text-red-700 font-semibold text-sm transition"
                      >
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