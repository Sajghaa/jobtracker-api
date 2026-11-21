import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const API_URL = 'https://jobtracker-api-k18g.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });

        if (!response.ok) throw new Error('Invalid email or password');

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        if (setToken) setToken(data.access_token);
        navigate('/dashboard');
      } else {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Email already registered');

        setIsLogin(true);
        setError('Registration successful! Please log in.');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 relative">
        <Link to="/" className="absolute top-8 left-8 text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition">
          <span>←</span> Back to home
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-96">
       
          <div className="mb-8">
            <span className="text-2xl font-bold tracking-tighter text-indigo-600">
              JobTracker<span className="text-slate-900">.pro</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Log in instead'}
            </button>
          </p>

          <div className="mt-8">
            {error && (
              <div className={`p-3 rounded-lg text-sm mb-6 font-medium ${error.includes('successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div></div> {/* spacer */}
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${
                  isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              By continuing, you agree to JobTracker's Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative bg-slate-900 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900" />
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white w-full h-full">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-6 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Your job search, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">organized and automated.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Stop losing track of applications in spreadsheets. Join thousands of candidates landing their dream jobs faster.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl max-w-md shadow-2xl">
            <div className="flex gap-1 text-amber-400 mb-3">
              ★★★★★
            </div>
            <p className="text-slate-200 italic mb-4">
              "I used to use a messy Excel sheet to track 50+ applications. JobTracker helped me land my Senior Engineer role in 4 weeks."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center font-bold text-slate-900">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-white">John Doe</p>
                <p className="text-xs text-slate-400">Software Engineer @ TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}