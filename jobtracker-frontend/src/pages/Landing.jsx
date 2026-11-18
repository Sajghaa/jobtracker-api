import { Link } from 'react-router-dom';

export default function Landing() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-indigo-400">
          JobTracker<span className="text-white">.pro</span>
        </div>
        <div className="space-x-4">
          {isLoggedIn ? (
            <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full font-semibold transition">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">Log in</Link>
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full font-semibold transition">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Track your job hunt. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Land the offer.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Stop using messy spreadsheets. Manage your applications, store your resumes, and visualize your progress—all in one secure place.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-indigo-600/30">
            Start Tracking for Free
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Live Analytics</h3>
            <p className="text-gray-400">See exactly how many interviews, offers, and rejections you have at a glance.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Resume Vault</h3>
            <p className="text-gray-400">Upload the exact PDF you used for each application. Never lose track of which resume you sent.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
            <p className="text-gray-400">Your data is encrypted and secured with JWT authentication. Only you can see your applications.</p>
          </div>
        </div>
      </main>
    </div>
  );
}