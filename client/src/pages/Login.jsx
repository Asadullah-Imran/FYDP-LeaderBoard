import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, UserPlus, Key } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth`;

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await axios.post(`${API_URL}${endpoint}`, formData);
      
      login(data);
      navigate('/');
    } catch (error) {
      console.error('Auth Error:', error);
      alert('Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-16 bg-surface-container-lowest p-5 sm:p-8 rounded-lg border border-outline-border shadow-sm transition-all duration-300 relative overflow-hidden">
      {/* Visual anchor bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-on-surface font-outfit tracking-tight">
          {isLogin ? 'Login to SpatialAblate' : 'Create an Account'}
        </h2>
        <p className="text-xs text-on-surface-variant mt-1.5">
          {isLogin ? 'Enter your credentials to access the submission portal' : 'Register to publish spatial omics benchmarking results'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary-container" />
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g. Dr. Jane Doe"
              onChange={handleChange} 
              required={!isLogin}
              className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm"
            />
          </div>
        )}
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary-container" />
            Email Address
          </label>
          <input 
            type="email" 
            name="email" 
            placeholder="researcher@institute.edu"
            onChange={handleChange} 
            required
            className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary-container" />
            Password
          </label>
          <input 
            type="password" 
            name="password" 
            placeholder="••••••••"
            onChange={handleChange} 
            required
            className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-primary-container hover:bg-primary-container/90 text-white font-bold py-2.5 px-4 rounded-default mt-6 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-sm"
        >
          {isLogin ? (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Create Account
              <UserPlus className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-outline-border text-center text-sm text-on-surface-variant">
        {isLogin ? "Don't have a benchmarking account? " : "Already registered? "}
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)} 
          className="text-primary-container hover:text-primary font-bold hover:underline cursor-pointer transition-colors"
        >
          {isLogin ? 'Register Here' : 'Login Here'}
        </button>
      </div>
    </div>
  );
}
