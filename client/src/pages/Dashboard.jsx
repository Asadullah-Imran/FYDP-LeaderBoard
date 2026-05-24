import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export default function Dashboard() {
  const [sections, setSections] = useState([]);
  const [models, setModels] = useState([]);

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
      }
    };
    fetchData();
  }, []);

  const nonEmptySections = sections.filter(section => 
    models.some(m => m.datasetSectionId?._id === section._id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Spatial Multi-Omics Leaderboard
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          A centralized platform to track, compare, and display the performance of spatial bioinformatics models.
        </p>
      </div>

      {nonEmptySections.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/25 border border-dashed border-slate-700 rounded-2xl shadow-inner max-w-2xl mx-auto">
          <p className="text-lg font-semibold text-slate-300">No models submitted yet</p>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            All dataset categories are currently empty. Click on the button below to submit the first performance entry!
          </p>
          <div className="mt-6">
            <Link 
              to="/submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm transition-all font-semibold inline-block shadow-lg shadow-blue-900/30"
            >
              Submit First Model
            </Link>
          </div>
        </div>
      ) : (
        nonEmptySections.map(section => {
          const sectionModels = models.filter(m => m.datasetSectionId?._id === section._id);
          // Sort by ARI descending
          sectionModels.sort((a, b) => b.scoreARI - a.scoreARI);

          return (
            <div key={section._id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                Dataset: {section.name}
              </h2>
              
              <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/50">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Rank</th>
                      <th className="px-6 py-4">Model Name</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4 font-bold text-blue-400">ARI Score</th>
                      <th className="px-6 py-4 font-bold text-emerald-400">NMI Score</th>
                      <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {sectionModels.map((model, index) => (
                      <tr key={model._id} className="hover:bg-slate-800/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                            index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50' :
                            index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{model.name}</td>
                        <td className="px-6 py-4">{model.authorId?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 font-mono text-blue-400">{model.scoreARI.toFixed(3)}</td>
                        <td className="px-6 py-4 font-mono text-emerald-400">{model.scoreNMI.toFixed(3)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/models/${model._id}`}
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
