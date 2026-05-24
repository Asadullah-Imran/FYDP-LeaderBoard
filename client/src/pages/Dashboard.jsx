import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Trophy, Medal, ArrowRight, Sparkles, AlertCircle, Cpu } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export default function Dashboard() {
  const [sections, setSections] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, modelsRes] = await Promise.all([
          axios.get(`${API_URL}/sections`),
          axios.get(`${API_URL}/models`)
        ]);
        setSections(sectionsRes.data);
        setModels(modelsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nonEmptySections = sections.filter(section => 
    models.some(m => m.datasetSectionId?._id === section._id)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium text-sm animate-pulse">Loading bioinformatics benchmark statistics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12">
      {/* Hero Header Section */}
      <div className="text-center py-8 px-4 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full text-xs font-bold text-primary font-outfit uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-primary-container animate-pulse" />
          Ablation Benchmarking Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface font-outfit tracking-tight leading-tight">
          Spatial Multi-Omics Leaderboard
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          A centralized, clinical-grade benchmark platform designed to track, compare, and display the performance of spatial bioinformatics and multi-omics integration models.
        </p>
      </div>

      {nonEmptySections.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg max-w-2xl mx-auto p-8 shadow-sm">
          <AlertCircle className="h-12 w-12 text-outline mx-auto mb-4 animate-bounce" />
          <p className="text-lg font-bold text-on-surface">No Benchmark Models Submitted Yet</p>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto leading-relaxed">
            All dataset categories are currently empty. Login or register to submit the first performance entry for scientific validation.
          </p>
          <div className="mt-6">
            <Link 
              to="/submit" 
              className="bg-primary-container hover:bg-primary-container/90 text-white px-6 py-2.5 rounded-default text-sm transition-all font-bold inline-flex items-center gap-2 shadow-sm"
            >
              Submit First Entry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {nonEmptySections.map(section => {
            const sectionModels = models.filter(m => m.datasetSectionId?._id === section._id);
            // Sort by ARI descending
            sectionModels.sort((a, b) => b.scoreARI - a.scoreARI);

            return (
              <div 
                key={section._id} 
                className="bg-surface-container-lowest border border-outline-border rounded-lg p-6 md:p-8 shadow-sm transition-colors duration-300 relative overflow-hidden"
              >
                {/* Visual anchor bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container"></div>
                
                <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-6 flex items-center gap-2.5 font-outfit">
                  <span className="w-1.5 h-7 bg-primary-container rounded-full inline-block"></span>
                  Dataset: {section.name}
                </h2>
                
                <div className="overflow-x-auto rounded-default border border-outline-border bg-surface-container-lowest">
                  <table className="w-full text-left text-sm text-on-surface-variant border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-border text-xs uppercase font-semibold text-on-surface-variant tracking-wider font-outfit">
                      <tr>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4 w-20 sm:w-28">Rank</th>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4">Model Name</th>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4">Author</th>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4 font-bold text-primary">ARI</th>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4 font-bold text-secondary">NMI</th>
                        <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-border">
                      {sectionModels.map((model, index) => (
                        <tr 
                          key={model._id} 
                          className="hover:bg-primary-container/[0.04] transition-all group relative"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold relative">
                            {/* Hover Selection bar */}
                            <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            
                            {index === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-tertiary-container/10 text-tertiary border border-tertiary-container/30">
                                <Trophy className="h-3 w-3 text-tertiary animate-pulse" />
                                1st
                              </span>
                            ) : index === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-secondary-container text-on-secondary-container border border-secondary-container/40">
                                <Medal className="h-3 w-3" />
                                2nd
                              </span>
                            ) : index === 2 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline">
                                <Medal className="h-3 w-3 text-amber-700" />
                                3rd
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-bold bg-surface-container-low text-on-surface-variant border border-outline-border">
                                {index + 1}
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-on-surface">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                              <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-container/85 shrink-0" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{model.name}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">{model.authorId?.name || 'Unknown'}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-primary font-bold text-xs sm:text-sm md:text-base">{model.scoreARI.toFixed(3)}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-secondary font-bold text-xs sm:text-sm md:text-base">{model.scoreNMI.toFixed(3)}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            <Link 
                              to={`/models/${model._id}`}
                              className="inline-flex items-center gap-0.5 sm:gap-1 text-primary-container hover:text-primary font-bold text-xs sm:text-sm transition-colors group/btn"
                            >
                              Details
                              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
