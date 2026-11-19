import { Link } from 'react-router-dom';

export default function Landing() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
        <div className="text-xl md:text-2xl font-bold tracking-tighter text-indigo-400">
          JobTracker<span className="text-white">.pro</span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          {isLoggedIn ? (
            <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base transition whitespace-nowrap">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium text-sm md:text-base transition">
                Log in
              </Link>
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base transition whitespace-nowrap">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
          Track your job hunt. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Land the offer.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 px-2">
          Stop using messy spreadsheets. Manage your applications, store your resumes, and visualize your progress—all in one secure place.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg transition shadow-lg shadow-indigo-600/30">
            Start Tracking for Free
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-20 md:mt-32 text-left">
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Live Analytics</h3>
            <p className="text-gray-400 text-sm md:text-base">See exactly how many interviews, offers, and rejections you have at a glance.</p>
          </div>
          
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Resume Vault</h3>
            <p className="text-gray-400 text-sm md:text-base">Upload the exact PDF you used for each application. Never lose track of which resume you sent.</p>
          </div>
          
          <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
            <p className="text-gray-400 text-sm md:text-base">Your data is encrypted and secured with JWT authentication. Only you can see your applications.</p>
          </div>
        </div>
      </main>
    </div>
  );
}