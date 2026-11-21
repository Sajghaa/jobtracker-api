import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const API_URL = 'https://jobtracker-api-k18g.onrender.com';

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'If that email is registered, a reset link is on its way.');
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
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-sm text-slate-500 mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {message && (
          <div className="p-3 mb-6 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-500 hover:text-indigo-600">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}