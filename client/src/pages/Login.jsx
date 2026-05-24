import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        {isLogin ? 'Login to SpatialAblate' : 'Create an Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input 
              type="text" name="name" onChange={handleChange} required={!isLogin}
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input 
            type="email" name="email" onChange={handleChange} required
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input 
            type="password" name="password" onChange={handleChange} required
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4 transition-colors">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      
      <p className="mt-6 text-center text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-blue-400 hover:underline"
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}
