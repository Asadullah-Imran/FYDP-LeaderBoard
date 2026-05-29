import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Search, Eye, Edit3, UploadCloud, Info, BookOpen, ArrowLeft, Code, Trash2, Image } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { usePopup } from '../context/PopupContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export default function SubmitModel() {
  const { showAlert } = usePopup();
  const [formData, setFormData] = useState({
    name: '',
    datasetSectionId: '',
    scoreARI: '',
    scoreNMI: '',
    scoreSilhouette: '',
    scoreAMI: '',
    scoreHomogeneity: '',
    scoreVMeasure: '',
    clusterSize: '',
    descriptionMarkdown: '',
    architectureFlow: '',
    githubUrl: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      let imageUrls = [];
      
      // Upload images concurrently if selected
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
        imageUrls = await Promise.all(uploadPromises);
      }

      // Client-side validation: count primary metrics
      const scoreARIVal = formData.scoreARI !== '' ? parseFloat(formData.scoreARI) : undefined;
      const scoreNMIVal = formData.scoreNMI !== '' ? parseFloat(formData.scoreNMI) : undefined;
      const scoreSilhouetteVal = formData.scoreSilhouette !== '' ? parseFloat(formData.scoreSilhouette) : undefined;

      let count = 0;
      if (scoreARIVal !== undefined && !isNaN(scoreARIVal)) count++;
      if (scoreNMIVal !== undefined && !isNaN(scoreNMIVal)) count++;
      if (scoreSilhouetteVal !== undefined && !isNaN(scoreSilhouetteVal)) count++;

      if (count < 2) {
        await showAlert('Validation Error', 'You must provide at least two of the primary metrics (ARI, NMI, Silhouette) to submit your model benchmarks.', 'warning');
        setIsSubmitting(false);
        return;
      }

      if (!formData.clusterSize || isNaN(parseInt(formData.clusterSize)) || parseInt(formData.clusterSize) <= 0) {
        await showAlert('Validation Error', 'You must provide a valid positive integer for Cluster Size.', 'warning');
        setIsSubmitting(false);
        return;
      }

      // Submit model
      const modelPayload = {
        ...formData,
        scoreARI: scoreARIVal,
        scoreNMI: scoreNMIVal,
        scoreSilhouette: scoreSilhouetteVal,
        scoreAMI: formData.scoreAMI !== '' ? parseFloat(formData.scoreAMI) : undefined,
        scoreHomogeneity: formData.scoreHomogeneity !== '' ? parseFloat(formData.scoreHomogeneity) : undefined,
        scoreVMeasure: formData.scoreVMeasure !== '' ? parseFloat(formData.scoreVMeasure) : undefined,
        clusterSize: parseInt(formData.clusterSize),
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
      const errMsg = error.response?.data?.message || 'Failed to submit model. Are you logged in?';
      await showAlert('Submission Failed', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSection = sections.find(s => s._id === formData.datasetSectionId);
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm bg-transparent cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-lg border border-outline-border shadow-sm transition-all duration-300 relative overflow-hidden">
        {/* Visual anchor bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-on-surface font-outfit tracking-tight flex items-center gap-2">
            <UploadCloud className="h-7 w-7 text-primary-container" />
            Submit Bioinformatics Model
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5">
            Register your spatial multi-omics model benchmarks, ablation statistics, and mathematical methodology.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Model Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="e.g. SpatialGlue-Ablated"
                value={formData.name} 
                onChange={handleChange} 
                required
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold"
              />
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Dataset Section</label>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface hover:border-primary-container focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold text-left cursor-pointer"
              >
                <span className="truncate">
                  {selectedSection ? selectedSection.name : 'Select a dataset section...'}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-on-surface-variant shrink-0 ml-2" />
              </button>

              {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-surface-container-lowest border border-outline-border rounded-default shadow-[0px_4px_20px_rgba(15,23,42,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2.5 border-b border-outline-border flex items-center gap-2 bg-surface-container-low">
                    <Search className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <input
                      type="text"
                      placeholder="Search dataset sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder-on-surface-variant/40"
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-outline-border/50">
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Number of Clusters</label>
              <input 
                type="number" 
                name="clusterSize" 
                placeholder="e.g. 15"
                value={formData.clusterSize} 
                onChange={handleChange} 
                required
                min="1"
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold font-mono"
              />
            </div>
          </div>

          {/* Performance Metrics Block */}
          <div className="bg-surface-container-low/40 p-4 rounded-default border border-outline-border/60 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-on-surface font-outfit flex items-center gap-1.5">
                <span className="w-1.5 h-4.5 bg-primary rounded-full inline-block"></span>
                Primary Performance Metrics (At least 2 required)
              </h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">
                You must provide at least two of the primary metrics (ARI, NMI, Silhouette) for a valid benchmark submission.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">ARI Score</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  name="scoreARI" 
                  placeholder="0.000"
                  value={formData.scoreARI} 
                  onChange={handleChange} 
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
                  placeholder="0.000"
                  value={formData.scoreNMI} 
                  onChange={handleChange} 
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
                  placeholder="0.000"
                  value={formData.scoreSilhouette} 
                  onChange={handleChange} 
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
                    placeholder="0.000"
                    value={formData.scoreAMI} 
                    onChange={handleChange} 
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
                    placeholder="0.000"
                    value={formData.scoreHomogeneity} 
                    onChange={handleChange} 
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
                    placeholder="0.000"
                    value={formData.scoreVMeasure} 
                    onChange={handleChange} 
                    className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant/75 mt-1 block">Completeness balance</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-outfit flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary-container" />
                Methodology Explanation (Markdown + LaTeX)
              </label>
              <div className="flex bg-surface-container-low p-0.5 rounded-default border border-outline-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-default text-xs font-bold cursor-pointer transition-all ${
                    activeTab === 'write'
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-default text-xs font-bold cursor-pointer transition-all ${
                    activeTab === 'preview'
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              </div>
            </div>
            
            {activeTab === 'write' ? (
              <textarea 
                name="descriptionMarkdown" 
                value={formData.descriptionMarkdown} 
                onChange={handleChange} 
                required 
                rows={8}
                className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-mono text-sm leading-relaxed"
                placeholder="Write your methodology explanation using Markdown and LaTeX equations... (e.g. Write equations like $$E = mc^2$$ or inline $x^2$)"
              ></textarea>
            ) : (
              <div className="w-full bg-surface-container-low border border-outline-border rounded-default p-6 min-h-[178px] prose dark:prose-invert text-on-surface max-w-none overflow-y-auto">
                {formData.descriptionMarkdown.trim() ? (
                  <div className="leading-relaxed text-sm">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {formData.descriptionMarkdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-on-surface-variant italic text-xs text-center pt-10 flex flex-col items-center gap-2">
                    <Info className="h-5 w-5 text-on-surface-variant/40" />
                    Nothing to preview. Select the 'Editor' tab to add methodology text.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit flex items-center gap-1.5">
              <Image className="h-4 w-4 text-primary-container" />
              Methodology Images (Gallery Upload) - Multiple Allowed
            </label>
            
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imageFiles.map((file, idx) => {
                  const localUrl = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative group border border-outline-border rounded-default overflow-hidden h-24 bg-surface-container-low shadow-sm">
                      <img src={localUrl} alt={`Selected Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-error-container font-extrabold text-xs cursor-pointer gap-1"
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <input 
              type="file" 
              onChange={handleImageChange} 
              accept="image/*"
              multiple
              className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface text-sm file:mr-4 file:py-1.5 file:px-3.5 file:rounded-default file:border-0 file:text-xs file:font-bold file:bg-primary-container file:text-white hover:file:bg-primary-container/90 transition-colors cursor-pointer"
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
              placeholder="e.g. https://github.com/username/project-repo"
              value={formData.githubUrl} 
              onChange={handleChange} 
              className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-outfit">Architecture Flow (Mermaid.js Scheme) - Optional</label>
            <textarea 
              name="architectureFlow" 
              value={formData.architectureFlow} 
              onChange={handleChange} 
              rows={4}
              className="w-full bg-surface-container-lowest border border-outline-border rounded-default px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-mono text-xs leading-relaxed"
              placeholder="graph TD;&#10;  A[Spatial Omics Input] --> B( spaLLM Integration );&#10;  B --> C[ARI/NMI Evaluation];"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary-container hover:bg-primary-container/90 text-white font-extrabold py-3 px-4 rounded-default transition-all cursor-pointer shadow-sm text-sm flex items-center justify-center gap-2 mt-8 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                Submitting Model Blueprint...
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                Submit Model Statistics
                <Check className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
