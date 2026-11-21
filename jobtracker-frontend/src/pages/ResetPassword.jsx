import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-bold text-rose-600 mb-2">Invalid Link</h2>
          <p className="text-slate-500">No reset token found in the URL.</p>
          <Link to="/login" className="text-indigo-600 mt-4 block">Back to Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const API_URL = 'https://jobtracker-api-k18g.onrender.com';

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Success! Your password has been changed.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setMessage(data.detail || 'Failed to reset password.');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Create New Password</h2>
          <p className="text-sm text-slate-500 mt-2">Enter your new password below.</p>
        </div>

        {message && (
          <div className={`p-3 mb-6 rounded-lg text-sm text-center border ${message.includes('Success') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition">
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}