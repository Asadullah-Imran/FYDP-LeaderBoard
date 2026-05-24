import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ModelDetail from './pages/ModelDetail';
import SubmitModel from './pages/SubmitModel';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4 px-8 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-400">SpatialAblate</Link>
      <nav className="flex gap-6 items-center font-medium">
        <Link to="/" className="hover:text-blue-300 transition-colors text-slate-300">Dashboard</Link>
        <Link to="/submit" className="hover:text-blue-300 transition-colors text-slate-300">Submit Model</Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold bg-slate-700/80 px-3.5 py-1.5 rounded-lg border border-slate-600 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {user.name}
            </span>
            <button 
              onClick={logout}
              className="bg-red-600/20 hover:bg-red-600/90 text-red-200 hover:text-white px-3.5 py-1.5 rounded-lg text-sm transition-all border border-red-500/30 hover:border-red-500 cursor-pointer shadow-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer font-semibold shadow-md shadow-blue-900/20 hover:scale-102"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
          <Navigation />

          <main className="flex-1 p-8 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitModel />} />
              <Route path="/models/:id" element={<ModelDetail />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
