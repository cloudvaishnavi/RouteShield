import React, { useState, useEffect } from 'react';
import { request } from '../../services/api';
import { Bot, FileText, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

export default function RagInsightsPanel({ inputData, prediction }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);

  useEffect(() => {
    async function fetchInsights() {
      if (!inputData || !prediction) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const transportMode = (inputData.Transport_Mode || 'freight').toLowerCase();
        const weather = (inputData.Weather_Conditions || '').toLowerCase();
        const riskLevel = (prediction.risk_level || 'normal').toLowerCase();
        
        let dynamicQuestion = `What are the anticipated supply chain disruptions and historical risks for ${transportMode} transport`;
        if (weather && weather !== 'clear' && weather !== 'none' && weather !== 'normal') {
          dynamicQuestion += ` experiencing ${weather} weather`;
        }
        dynamicQuestion += ` with a ${riskLevel} risk level? What are common mitigation or rerouting strategies?`;

        const payload = {
          origin: inputData.Origin_Port || '',
          destination: inputData.Destination_Port || '',
          transport_mode: inputData.Transport_Mode || '',
          risk_level: prediction.risk_level || '',
          question: dynamicQuestion.slice(0, 500)
        };

        const json = await request('/api/rag/explain', {
          method: 'POST',
            body: JSON.stringify(payload),
          });

        if (!json.success) {
          throw new Error(json.error?.message || 'Failed to fetch RAG insights');
        }

        setData(json);
      } catch (err) {
        console.error('RAG Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [inputData, prediction]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-cyan-400 font-bold mb-4">
          <Bot className="w-5 h-5 animate-pulse" />
          <h2>Knowledge Base Evidence</h2>
        </div>
        <div className="text-sm text-slate-400 animate-pulse">
          Searching knowledge base...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-rose-400 font-bold mb-4">
          <AlertCircle className="w-5 h-5" />
          <h2>Knowledge Base Unavailable</h2>
        </div>
        <div className="text-sm text-slate-400">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h2>Knowledge Base Evidence</h2>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          General disruption factors related to this route
        </div>
      </div>
      
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-2 text-amber-400/80 text-xs font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>This panel retrieves static evidence from a demo knowledge base, not live real-world events.</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
          <h3 className="text-indigo-400 text-xs font-bold uppercase mb-2">Explanation</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {data.explanation}
          </p>
        </div>

        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Retrieved Evidence Sources</h3>
          
          {(!data.relevant_evidence_found || !data.retrieved_passages || data.retrieved_passages.length === 0) ? (
            <div className="text-sm text-slate-500 italic">No relevant evidence was found in the knowledge base for this route.</div>
          ) : (
            <div className="space-y-3">
              {data.retrieved_passages.map((doc, idx) => (
                <div key={idx} className="border border-slate-800 rounded-lg bg-slate-800/30 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDoc(expandedDoc === idx ? null : idx)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-slate-200">{doc.source}</span>
                      <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        Similarity Score: {doc.score.toFixed(4)}
                      </span>
                    </div>
                    {expandedDoc === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  {expandedDoc === idx && (
                    <div className="px-4 py-4 border-t border-slate-800 bg-slate-900/50">
                      <p className="text-sm text-slate-300 leading-relaxed font-serif">
                        "{doc.text}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
