import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Check, X, Eye, Edit3, ChevronsUpDown, Search, Image, ArrowLeft, Cpu, Layers, BookOpen, AlertTriangle, Code, ExternalLink } from 'lucide-react';

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
  const [imageFiles, setImageFiles] = useState([]);
  const [editData, setEditData] = useState({
    name: '',
    scoreARI: '',
    scoreNMI: '',
    scoreSilhouette: '',
    scoreAMI: '',
    scoreHomogeneity: '',
    scoreVMeasure: '',
    descriptionMarkdown: '',
    architectureFlow: '',
    datasetSectionId: '',
    methodologyImages: [],
    githubUrl: ''
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
      try {
        // Initialize mermaid with simple styling compatible with light mode
        mermaid.initialize({ 
          startOnLoad: true, 
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter'
        });
        mermaid.contentLoaded();
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium text-sm animate-pulse">Loading model blueprint details...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest border border-outline-border rounded-lg max-w-md mx-auto p-6 shadow-sm">
        <AlertTriangle className="h-10 w-10 text-error mx-auto mb-3" />
        <p className="text-lg font-bold text-on-surface">Benchmark Model Not Found</p>
        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          The requested submission record does not exist or has been removed from the registry.
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-primary hover:underline">
          <ArrowLeft className="h-3 w-3" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const canManage = user && (user._id === model.authorId?._id || user._id === model.authorId || user.role === 'admin');

  const startEditing = () => {
    setEditData({
      name: model.name,
      scoreARI: model.scoreARI !== undefined && model.scoreARI !== null ? model.scoreARI : '',
      scoreNMI: model.scoreNMI !== undefined && model.scoreNMI !== null ? model.scoreNMI : '',
      scoreSilhouette: model.scoreSilhouette !== undefined && model.scoreSilhouette !== null ? model.scoreSilhouette : '',
      scoreAMI: model.scoreAMI !== undefined && model.scoreAMI !== null ? model.scoreAMI : '',
      scoreHomogeneity: model.scoreHomogeneity !== undefined && model.scoreHomogeneity !== null ? model.scoreHomogeneity : '',
      scoreVMeasure: model.scoreVMeasure !== undefined && model.scoreVMeasure !== null ? model.scoreVMeasure : '',
      descriptionMarkdown: model.descriptionMarkdown,
      architectureFlow: model.architectureFlow || '',
      datasetSectionId: model.datasetSectionId?._id || model.datasetSectionId,
      methodologyImages: model.methodologyImages || [],
      githubUrl: model.githubUrl || ''
    });
    setImageFiles([]);
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
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveLocalImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');

    try {
      let finalImages = [...editData.methodologyImages];

      // Upload new images concurrently if selected
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const imageData = new FormData();
          imageData.append('image', file);
          
          const uploadRes = await axios.post(`${API_URL}/upload`, imageData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          return uploadRes.data.url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      const scoreARIVal = editData.scoreARI !== '' ? parseFloat(editData.scoreARI) : undefined;
      const scoreNMIVal = editData.scoreNMI !== '' ? parseFloat(editData.scoreNMI) : undefined;
      const scoreSilhouetteVal = editData.scoreSilhouette !== '' ? parseFloat(editData.scoreSilhouette) : undefined;

      let count = 0;
      if (scoreARIVal !== undefined && !isNaN(scoreARIVal)) count++;
      if (scoreNMIVal !== undefined && !isNaN(scoreNMIVal)) count++;
      if (scoreSilhouetteVal !== undefined && !isNaN(scoreSilhouetteVal)) count++;

      if (count < 2) {
        alert('Validation Error: You must provide at least two of the primary metrics (ARI, NMI, Silhouette) to save changes.');
        setIsSaving(false);
        return;
      }

      const payload = {
        ...editData,
        scoreARI: scoreARIVal,
        scoreNMI: scoreNMIVal,
        scoreSilhouette: scoreSilhouetteVal,
        scoreAMI: editData.scoreAMI !== '' ? parseFloat(editData.scoreAMI) : undefined,
        scoreHomogeneity: editData.scoreHomogeneity !== '' ? parseFloat(editData.scoreHomogeneity) : undefined,
        scoreVMeasure: editData.scoreVMeasure !== '' ? parseFloat(editData.scoreVMeasure) : undefined,
        methodologyImages: finalImages
      };

      const { data } = await axios.put(`${API_URL}/models/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setModel(data);
      setIsEditing(false);
      setImageFiles([]);
    } catch (error) {
      console.error('Error updating model:', error);
      const errMsg = error.response?.data?.message || 'Failed to update model. Please check authorization.';
      alert(errMsg);
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

  const selectedSection = sections.find(s => s._id === editData.datasetSectionId);
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Link 
          to="/" 
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        {/* Author management options */}
        {canManage && !isEditing && (
          <div className="flex items-center gap-3">
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-4 py-2 rounded-default text-xs md:text-sm font-bold transition-all border border-outline-border cursor-pointer shadow-sm"
            >
              <Edit2 className="h-3.5 w-3.5 text-primary" />
              Edit Model
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 bg-error-container/20 hover:bg-error-container hover:text-error text-error px-4 py-2 rounded-default text-xs md:text-sm font-bold transition-all border border-error-container/30 cursor-pointer shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Record
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-lg p-5 sm:p-8 border border-outline-border shadow-sm relative overflow-hidden transition-all duration-300">
        {/* Visual anchor bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>
        
        {!isEditing ? (
          /* STATIC DISPLAY VIEW */
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-border pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-container/10 text-primary border border-primary-container/20 font-outfit">
                    Bioinformatics Model
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface font-outfit tracking-tight flex items-center gap-2">
                  <Cpu className="h-8 w-8 text-primary-container" />
                  {model.name}
                </h1>
                <p className="text-sm text-on-surface-variant flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>
                    Submitted by <span className="text-on-surface font-bold">{model.authorId?.name || 'Unknown'}</span> for dataset 
                    <span className="text-primary font-bold ml-1">{model.datasetSectionId?.name || 'Deleted Section'}</span>
                  </span>
                  {model.githubUrl && (
                    <>
                      <span className="text-outline-border text-xs">•</span>
                      <a 
                        href={model.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-bold text-xs"
                      >
                        <Code className="h-3.5 w-3.5" />
                        Source Code
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full self-stretch md:self-auto md:w-auto">
                <div className="bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm">
                  <div className="text-[9px] text-primary uppercase font-extrabold tracking-wider mb-1 font-outfit">ARI Score</div>
                  <div className="text-xl sm:text-2xl font-mono text-primary font-extrabold">
                    {model.scoreARI !== undefined && model.scoreARI !== null ? model.scoreARI.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Gold standard</span>
                </div>
                <div className="bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm">
                  <div className="text-[9px] text-secondary uppercase font-extrabold tracking-wider mb-1 font-outfit">NMI Score</div>
                  <div className="text-xl sm:text-2xl font-mono text-secondary font-extrabold">
                    {model.scoreNMI !== undefined && model.scoreNMI !== null ? model.scoreNMI.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Cluster agreement</span>
                </div>
                <div className="bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm">
                  <div className="text-[9px] text-tertiary uppercase font-extrabold tracking-wider mb-1 font-outfit">Silhouette</div>
                  <div className="text-xl sm:text-2xl font-mono text-tertiary font-extrabold">
                    {model.scoreSilhouette !== undefined && model.scoreSilhouette !== null ? model.scoreSilhouette.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Cluster compact</span>
                </div>
                <div className={`bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm ${model.scoreAMI === undefined || model.scoreAMI === null ? 'opacity-40' : ''}`}>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold tracking-wider mb-1 font-outfit">AMI Score</div>
                  <div className="text-xl sm:text-2xl font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {model.scoreAMI !== undefined && model.scoreAMI !== null ? model.scoreAMI.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Robust mutual info</span>
                </div>
                <div className={`bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm ${model.scoreHomogeneity === undefined || model.scoreHomogeneity === null ? 'opacity-40' : ''}`}>
                  <div className="text-[9px] text-amber-600 dark:text-amber-500 uppercase font-extrabold tracking-wider mb-1 font-outfit">Homogeneity</div>
                  <div className="text-xl sm:text-2xl font-mono text-amber-600 dark:text-amber-500 font-extrabold">
                    {model.scoreHomogeneity !== undefined && model.scoreHomogeneity !== null ? model.scoreHomogeneity.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Purity score</span>
                </div>
                <div className={`bg-surface-container-low border border-outline-border rounded-default p-3 text-center min-w-[100px] shadow-sm ${model.scoreVMeasure === undefined || model.scoreVMeasure === null ? 'opacity-40' : ''}`}>
                  <div className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-extrabold tracking-wider mb-1 font-outfit">V-Measure</div>
                  <div className="text-xl sm:text-2xl font-mono text-purple-600 dark:text-purple-400 font-extrabold">
                    {model.scoreVMeasure !== undefined && model.scoreVMeasure !== null ? model.scoreVMeasure.toFixed(3) : '-'}
                  </div>
                  <span className="text-[8px] text-on-surface-variant block">Completeness bal</span>
                </div>
              </div>
            </div>

            {/* Methodology Prose Section */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold font-outfit border-b border-outline-border pb-2.5 mb-6 text-on-surface flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-container" />
                Mathematical Methodology
              </h2>
              <div className="text-on-surface-variant leading-relaxed text-sm space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {model.descriptionMarkdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            {model.architectureFlow && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-outfit border-b border-outline-border pb-2.5 mb-6 text-on-surface flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-container" />
                  Model Pipeline Graph
                </h2>
                <div className="bg-surface-container-low p-6 rounded-default border border-outline-border overflow-x-auto flex justify-center shadow-sm">
                  <div className="mermaid bg-transparent">
                    {model.architectureFlow}
                  </div>
                </div>
              </div>
            )}

            {/* Gallery / Methodology Images */}
            {model.methodologyImages && model.methodologyImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-outfit border-b border-outline-border pb-2.5 mb-6 text-on-surface flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary-container" />
                  Methodology Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {model.methodologyImages.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Methodology Formulation ${idx + 1}`} 
                      className="rounded-default border border-outline-border w-full object-cover max-h-80 hover:scale-[1.01] transition-all shadow-sm cursor-zoom-in"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DYNAMIC EDIT FORM VIEW */
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-between items-center border-b border-outline-border pb-4 mb-6">
              <h2 className="text-xl font-bold text-on-surface font-outfit">Edit Model Submission</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-3.5 py-1.5 rounded-default text-xs md:text-sm font-bold transition-all border border-outline-border cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-primary-container hover:bg-primary-container/90 text-white px-4 py-1.5 rounded-default text-xs md:text-sm font-bold transition-all border border-primary-container cursor-pointer shadow-sm disabled:opacity-70"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Model Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editData.name} 
                  onChange={handleEditChange} 
                  required
                  className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold"
                />
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Dataset Section</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface hover:border-primary-container focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold text-left cursor-pointer"
                >
                  <span className="truncate">
                    {selectedSection ? selectedSection.name : 'Select a dataset section...'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 text-on-surface-variant shrink-0 ml-2" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-surface-container-lowest border border-outline-border rounded-default shadow-[0px_4px_20px_rgba(15,23,42,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-2.5 border-b border-outline-border flex items-center gap-2 bg-surface-container-low">
                      <Search className="h-4 w-4 text-on-surface-variant shrink-0" />
                      <input
                        type="text"
                        placeholder="Search dataset sections..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface-variant/40"
                        autoFocus
                      />
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-outline-border/50">
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
                                    ? 'bg-primary-container/10 text-primary font-bold'
                                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                                }`}
                              >
                                <span className="truncate">{section.name}</span>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li className="px-4 py-3 text-xs text-on-surface-variant text-center italic">
                          No matching sections found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics Block in Edit Mode */}
            <div className="bg-surface-container-low/40 p-4 rounded-default border border-outline-border/60 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-on-surface font-outfit flex items-center gap-1.5">
                  <span className="w-1.5 h-4.5 bg-primary rounded-full inline-block"></span>
                  Primary Performance Metrics (At least 2 required)
                </h3>
                <p className="text-xs text-on-surface-variant/80 mt-1">
                  You must provide at least two of the primary metrics (ARI, NMI, Silhouette) for your changes to be saved.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">ARI Score</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    name="scoreARI" 
                    value={editData.scoreARI} 
                    onChange={handleEditChange} 
                    className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Gold standard with GT labels</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">NMI Score</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    name="scoreNMI" 
                    value={editData.scoreNMI} 
                    onChange={handleEditChange} 
                    className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Cluster agreement</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Silhouette Score</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    name="scoreSilhouette" 
                    value={editData.scoreSilhouette} 
                    onChange={handleEditChange} 
                    className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Cluster compactness</span>
                </div>
              </div>

              <div className="border-t border-outline-border/40 pt-4">
                <h3 className="text-sm font-bold text-on-surface font-outfit flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-4.5 bg-secondary rounded-full inline-block"></span>
                  Secondary Benchmarks (Optional)
                </h3>
                <p className="text-xs text-on-surface-variant/80 mb-4">
                  Additional multi-omics parameters useful for profiling.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">AMI Score</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      name="scoreAMI" 
                      value={editData.scoreAMI} 
                      onChange={handleEditChange} 
                      className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                    />
                    <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Robust mutual info</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Homogeneity</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      name="scoreHomogeneity" 
                      value={editData.scoreHomogeneity} 
                      onChange={handleEditChange} 
                      className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                    />
                    <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Purity score</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">V-Measure</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      name="scoreVMeasure" 
                      value={editData.scoreVMeasure} 
                      onChange={handleEditChange} 
                      className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                    />
                    <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Completeness balance</span>
                  </div>
                </div>
              </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-outfit flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary-container" />
                  Description (Markdown + LaTeX)
                </label>
                <div className="flex bg-surface-container-low p-0.5 rounded-default border border-outline-border">
                  <button
                    type="button"
                    onClick={() => setEditTab('write')}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-default text-xs font-bold cursor-pointer transition-all ${
                      editTab === 'write'
                        ? 'bg-primary-container text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('preview')}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-default text-xs font-bold cursor-pointer transition-all ${
                      editTab === 'preview'
                        ? 'bg-primary-container text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                </div>
              </div>
              
              {editTab === 'write' ? (
                <textarea 
                  name="descriptionMarkdown" 
                  value={editData.descriptionMarkdown} 
                  onChange={handleEditChange} 
                  required 
                  rows={8}
                  className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-mono text-sm leading-relaxed"
                  placeholder="Write description using Markdown and LaTeX..."
                ></textarea>
              ) : (
                <div className="w-full bg-surface-container-low border border-outline-border rounded-default p-6 min-h-[178px] prose dark:prose-invert text-on-surface max-w-none overflow-y-auto">
                  {editData.descriptionMarkdown.trim() ? (
                    <div className="leading-relaxed text-sm">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {editData.descriptionMarkdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-on-surface-variant italic text-xs text-center pt-8">
                      Nothing to preview. Select editor to write content.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 font-outfit">Methodology Images (Gallery)</label>
              
              {editData.methodologyImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {editData.methodologyImages.map((img, idx) => (
                    <div key={idx} className="relative group border border-outline-border rounded-default overflow-hidden h-24 bg-surface-container-low shadow-sm">
                      <img src={img} alt={`Methodology Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditData(prev => ({
                            ...prev,
                            methodologyImages: prev.methodologyImages.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-error-container font-extrabold text-xs cursor-pointer gap-1"
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                        Remove Image
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">New Images to Upload:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imageFiles.map((file, idx) => {
                      const localUrl = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative group border border-outline-border rounded-default overflow-hidden h-24 bg-surface-container-low shadow-sm">
                          <img src={localUrl} alt={`New Selected Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalImage(idx)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-error-container font-extrabold text-xs cursor-pointer gap-1"
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <input 
                type="file" 
                onChange={handleImageChange} 
                accept="image/*"
                multiple
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface text-sm file:mr-4 file:py-1.5 file:px-3.5 file:rounded-default file:border-0 file:text-xs file:font-bold file:bg-primary-container file:text-white hover:file:bg-primary-container/90 transition-colors cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary-container" />
                GitHub Repository (Source Code) - Optional
              </label>
              <input 
                type="url" 
                name="githubUrl" 
                value={editData.githubUrl} 
                onChange={handleEditChange} 
                placeholder="e.g. https://github.com/username/project-repo"
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Architecture Flow (Mermaid.js Scheme) - Optional</label>
              <textarea 
                name="architectureFlow" 
                value={editData.architectureFlow} 
                onChange={handleEditChange} 
                rows={4}
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-mono text-xs leading-relaxed"
                placeholder="graph TD;&#10;  A-->B;"
              ></textarea>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
