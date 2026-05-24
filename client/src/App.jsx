import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ModelDetail from './pages/ModelDetail';
import SubmitModel from './pages/SubmitModel';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, Database, PlusCircle, User, LogOut } from 'lucide-react';

function Navigation() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-surface-container-lowest border-b border-outline-border py-4 px-4 md:px-8 flex justify-between items-center transition-colors shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] w-full mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-primary font-outfit tracking-tight hover:opacity-90 flex items-center gap-1.5">
          <span>SpatialAblate</span>
          <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
        </Link>
        <nav className="flex gap-4 md:gap-6 items-center font-medium">
          <Link 
            to="/" 
            className="hover:text-primary-container text-on-surface-variant transition-colors text-sm font-semibold flex items-center gap-1.5"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link 
            to="/submit" 
            className="hover:text-primary-container text-on-surface-variant transition-colors text-sm font-semibold flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Model</span>
          </Link>
          
          {/* Subtle separator */}
          <div className="h-4 w-px bg-outline-border hidden sm:block"></div>

          {/* Theme Toggle Button (Retained for functionality but fully aligned) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-default bg-surface-container-low hover:bg-surface-container hover:text-primary transition-all border border-outline-border cursor-pointer flex items-center justify-center text-on-surface-variant"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-tertiary-container fill-tertiary-container" /> : <Moon className="h-4.5 w-4.5 text-on-surface" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-on-surface font-semibold bg-surface-container-low px-3.5 py-1.5 rounded-default border border-outline-border text-xs md:text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                {user.name}
              </span>
              <button 
                onClick={logout}
                className="bg-surface-container-lowest hover:bg-error-container hover:text-error hover:border-error-container text-on-surface-variant px-3.5 py-1.5 rounded-default text-xs md:text-sm transition-all border border-outline-border cursor-pointer flex items-center gap-1.5 font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-primary-container hover:bg-primary-container/90 text-white px-4.5 py-1.5 rounded-default text-sm transition-all cursor-pointer font-bold flex items-center gap-1.5"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-on-background flex flex-col transition-colors duration-300 font-inter">
            <Navigation />

            <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-8 overflow-auto">
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
