import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Check, X, Eye, Edit, ChevronsUpDown, Search, Image } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTab, setEditTab] = useState('write'); // 'write' | 'preview'
  const [imageFile, setImageFile] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    scoreARI: '',
    scoreNMI: '',
    descriptionMarkdown: '',
    architectureFlow: '',
    datasetSectionId: '',
    methodologyImages: []
  });

  // Searchable dropdown inside edit mode
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/models/${id}`);
        setModel(data);
      } catch (error) {
        console.error('Error fetching model:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSections = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/sections`);
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchModel();
    fetchSections();
  }, [id]);

  useEffect(() => {
    if (model?.architectureFlow && !isEditing) {
      mermaid.initialize({ startOnLoad: true, theme: 'dark' });
      mermaid.contentLoaded();
    }
  }, [model, isEditing]);

  // Click outside to close dropdown in edit mode
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <div className="text-center text-slate-400 mt-20">Loading model details...</div>;
  if (!model) return <div className="text-center text-red-400 mt-20">Model not found.</div>;

  // Determine if active user can manage this model (author or admin)
  const canManage = user && (user._id === model.authorId?._id || user._id === model.authorId || user.role === 'admin');

  const startEditing = () => {
    setEditData({
      name: model.name,
      scoreARI: model.scoreARI,
      scoreNMI: model.scoreNMI,
      descriptionMarkdown: model.descriptionMarkdown,
      architectureFlow: model.architectureFlow || '',
      datasetSectionId: model.datasetSectionId?._id || model.datasetSectionId,
      methodologyImages: model.methodologyImages || []
    });
    setImageFile(null);
    setIsEditing(true);
    setEditTab('write');
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');

    try {
      let finalImages = [...editData.methodologyImages];

      // Upload new image if selected
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('image', imageFile);
        
        const uploadRes = await axios.post(`${API_URL}/upload`, imageData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        finalImages.push(uploadRes.data.url);
      }

      const payload = {
        ...editData,
        scoreARI: parseFloat(editData.scoreARI),
        scoreNMI: parseFloat(editData.scoreNMI),
        methodologyImages: finalImages
      };

      const { data } = await axios.put(`${API_URL}/models/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setModel(data);
      setIsEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error('Error updating model:', error);
      alert('Failed to update model. Please check authorization.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this model submission? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/models/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Failed to delete model.');
    }
  };

  // Helpers for searchable dropdown in edit mode
  const selectedSection = sections.find(s => s._id === editData.datasetSectionId);
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 w-fit font-medium">
          ← Back to Dashboard
        </Link>
        
        {/* Author management options */}
        {canManage && !isEditing && (
          <div className="flex items-center gap-3">
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/90 text-blue-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all border border-blue-500/30 hover:border-blue-500 cursor-pointer font-semibold shadow-md shadow-blue-900/10"
            >
              <Edit2 className="h-4 w-4" />
              Edit Model
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/90 text-red-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all border border-red-500/30 hover:border-red-500 cursor-pointer font-semibold shadow-md shadow-red-900/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete Model
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {!isEditing ? (
            /* STATIC DISPLAY VIEW */
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2">{model.name}</h1>
                  <p className="text-slate-400">
                    Submitted by <span className="text-slate-300 font-medium">{model.authorId?.name || 'Unknown'}</span> for dataset 
                    <span className="text-blue-400 font-medium ml-1">{model.datasetSectionId?.name || 'Deleted Section'}</span>
                  </p>
                </div>
                <div className="flex gap-4 self-stretch md:self-auto">
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center min-w-[100px] flex-1 md:flex-none">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">ARI</div>
                    <div className="text-2xl font-mono text-blue-400 font-bold">{model.scoreARI?.toFixed(3)}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center min-w-[100px] flex-1 md:flex-none">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">NMI</div>
                    <div className="text-2xl font-mono text-emerald-400 font-bold">{model.scoreNMI?.toFixed(3)}</div>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert prose-blue max-w-none mt-10">
                <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-6">Methodology</h2>
                <div className="text-slate-300 leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {model.descriptionMarkdown}
                  </ReactMarkdown>
                </div>
              </div>

              {model.architectureFlow && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-6">Architecture Flow</h2>
                  <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 overflow-x-auto flex justify-center">
                    <div className="mermaid">
                      {model.architectureFlow}
                    </div>
                  </div>
                </div>
              )}

              {model.methodologyImages && model.methodologyImages.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-6">Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {model.methodologyImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Methodology ${idx + 1}`} 
                        className="rounded-lg shadow-md border border-slate-700 w-full object-cover max-h-80 hover:scale-[1.02] transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* DYNAMIC EDIT FORM VIEW */
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Model Submission</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer font-semibold"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer font-semibold shadow-lg shadow-blue-900/30"
                  >
                    <Check className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Model Name</label>
                  <input 
                    type="text" name="name" value={editData.name} onChange={handleEditChange} required
                    className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dataset Section</label>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors text-left"
                  >
                    <span className="truncate">
                      {selectedSection ? selectedSection.name : 'Select a dataset section...'}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-750 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/50">
                        <Search className="h-4 w-4 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search dataset sections..."
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                          autoFocus
                        />
                      </div>
                      <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-800/30">
                        {filteredSections.length > 0 ? (
                          filteredSections.map((section) => {
                            const isSelected = section._id === editData.datasetSectionId;
                            return (
                              <li key={section._id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditData((prev) => ({ ...prev, datasetSectionId: section._id }));
                                    setDropdownOpen(false);
                                    setDropdownSearch('');
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
                    type="number" step="0.001" name="scoreARI" value={editData.scoreARI} onChange={handleEditChange} required
                    className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">NMI Score</label>
                  <input 
                    type="number" step="0.001" name="scoreNMI" value={editData.scoreNMI} onChange={handleEditChange} required
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
                      onClick={() => setEditTab('write')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        editTab === 'write'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit className="h-3 w-3" />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        editTab === 'preview'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </button>
                  </div>
                </div>
                
                {editTab === 'write' ? (
                  <textarea 
                    name="descriptionMarkdown" value={editData.descriptionMarkdown} onChange={handleEditChange} required rows={8}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                    placeholder="Write description using Markdown and LaTeX..."
                  ></textarea>
                ) : (
                  <div className="w-full bg-slate-900 border border-slate-600 rounded-lg p-6 min-h-[178px] prose prose-invert max-w-none overflow-y-auto">
                    {editData.descriptionMarkdown.trim() ? (
                      <div className="text-slate-300 leading-relaxed text-sm">
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {editData.descriptionMarkdown}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-sm text-center pt-8">
                        Nothing to preview.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Methodology Images (Gallery)</label>
                
                {/* Previews of currently uploaded images */}
                {editData.methodologyImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {editData.methodologyImages.map((img, idx) => (
                      <div key={idx} className="relative group border border-slate-700 rounded-lg overflow-hidden h-24 bg-slate-900 shadow-md">
                        <img src={img} alt={`Methodology ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditData(prev => ({
                              ...prev,
                              methodologyImages: prev.methodologyImages.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="absolute inset-0 bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 font-bold text-xs cursor-pointer gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Image
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload selector for new image */}
                <input 
                  type="file" 
                  onChange={handleImageChange} 
                  accept="image/*"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer"
                />
                {imageFile && (
                  <p className="text-xs text-blue-400 mt-2 font-medium flex items-center gap-1.5">
                    <Image className="h-4 w-4 text-blue-400 animate-pulse" />
                    ✓ New image selected: "{imageFile.name}" (will upload on save)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Architecture Flow (Mermaid.js) - Optional</label>
                <textarea 
                  name="architectureFlow" value={editData.architectureFlow} onChange={handleEditChange} rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                  placeholder="graph TD;&#10;  A-->B;"
                ></textarea>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
