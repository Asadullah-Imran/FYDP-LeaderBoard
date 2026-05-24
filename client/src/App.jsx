import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ModelDetail from './pages/ModelDetail';
import SubmitModel from './pages/SubmitModel';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function Navigation() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-8 flex justify-between items-center transition-colors">
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">SpatialAblate</Link>
      <nav className="flex gap-6 items-center font-medium">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors text-slate-600 dark:text-slate-300">Dashboard</Link>
        <Link to="/submit" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors text-slate-600 dark:text-slate-300">Submit Model</Link>
        
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-750 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-600 cursor-pointer flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-700/80 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {user.name}
            </span>
            <button 
              onClick={logout}
              className="bg-red-50 hover:bg-red-600 dark:bg-red-600/20 dark:hover:bg-red-600/90 text-red-650 dark:text-red-200 hover:text-white px-3.5 py-1.5 rounded-lg text-sm transition-all border border-red-200 dark:border-red-500/30 hover:border-red-500 cursor-pointer shadow-sm"
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 flex flex-col transition-colors duration-300">
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
    </ThemeProvider>
  );
}

export default App;
