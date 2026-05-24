import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Search, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export default function SubmitModel() {
  const [formData, setFormData] = useState({
    name: '',
    datasetSectionId: '',
    scoreARI: '',
    scoreNMI: '',
    descriptionMarkdown: '',
    architectureFlow: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  // Searchable dropdown states
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Markdown live preview tab state
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'

  useEffect(() => {
    // Fetch sections on mount
    const fetchSections = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/sections`);
        setSections(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, datasetSectionId: data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  // Listen for click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Simplistic auth handling for now
    
    try {
      let imageUrls = [];
      
      // Upload image if selected
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('image', imageFile);
        
        const uploadRes = await axios.post(`${API_URL}/upload`, imageData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        imageUrls.push(uploadRes.data.url);
      }

      // Submit model
      const modelPayload = {
        ...formData,
        scoreARI: parseFloat(formData.scoreARI),
        scoreNMI: parseFloat(formData.scoreNMI),
        methodologyImages: imageUrls
      };

      await axios.post(`${API_URL}/models`, modelPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error submitting model:', error);
      alert('Failed to submit model. Are you logged in?');
    }
  };

  const selectedSection = sections.find(s => s._id === formData.datasetSectionId);
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
      <h1 className="text-3xl font-bold mb-6 text-white">Submit New Model</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-slate-300 mb-2">Dataset Section</label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors text-left"
            >
              <span className="truncate">
                {selectedSection ? selectedSection.name : 'Select a dataset section...'}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
            </button>

            {isOpen && (
              <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-750 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/50">
                  <Search className="h-4 w-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search dataset sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                    autoFocus
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-800/30">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => {
                      const isSelected = section._id === formData.datasetSectionId;
                      return (
                        <li key={section._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, datasetSectionId: section._id }));
                              setIsOpen(false);
                              setSearchQuery('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600/20 text-blue-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{section.name}</span>
                            {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0 ml-2" />}
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-500 text-center">
                      No matching sections found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ARI Score</label>
            <input 
              type="number" step="0.001" name="scoreARI" value={formData.scoreARI} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">NMI Score</label>
            <input 
              type="number" step="0.001" name="scoreNMI" value={formData.scoreNMI} onChange={handleChange} required
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300">Description (Markdown + LaTeX)</label>
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'write'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit2 className="h-3 w-3" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>
          
          {activeTab === 'write' ? (
            <textarea 
              name="descriptionMarkdown" value={formData.descriptionMarkdown} onChange={handleChange} required rows={8}
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
              placeholder="Write your methodology explanation using Markdown and LaTeX... (e.g. Write equations like $$E = mc^2$$ or inline $x^2$)"
            ></textarea>
          ) : (
            <div className="w-full bg-slate-900 border border-slate-600 rounded-lg p-6 min-h-[178px] prose prose-invert max-w-none overflow-y-auto">
              {formData.descriptionMarkdown.trim() ? (
                <div className="text-slate-300 leading-relaxed text-sm">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {formData.descriptionMarkdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm text-center pt-8">
                  Nothing to preview. Go to 'Write' tab to add methodology description.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Methodology Image</label>
          <input 
            type="file" onChange={handleImageChange} accept="image/*"
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Architecture Flow (Mermaid.js) - Optional</label>
          <textarea 
            name="architectureFlow" value={formData.architectureFlow} onChange={handleChange} rows={4}
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
            placeholder="graph TD;&#10;  A-->B;"
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Submit Model
        </button>
      </form>
    </div>
  );
}
