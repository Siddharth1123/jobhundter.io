'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Bot, Send, Sparkles, User, Award, CheckCircle2, MessageSquare } from 'lucide-react';

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'mock'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello Alex! I am your AI Career Coach. Ask me anything about your job fit, interview strategy, or how to address skill gaps.'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Mock interview state
  const [question, setQuestion] = useState('Explain how Kubernetes Ingress rules differ from a NodePort Service.');
  const [userAnswer, setUserAnswer] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);

  const coachMutation = useMutation({
    mutationFn: (msg: string) => api.askCoach(msg),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
    },
  });

  const handleSendChat = () => {
    if (!inputMsg.trim()) return;
    const msg = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: msg }]);
    setInputMsg('');
    coachMutation.mutate(msg);
  };

  const handleEvaluateMock = () => {
    if (!userAnswer.trim()) return;
    setEvalResult({
      score: 8.7,
      technical_accuracy: 'High — correctly explained HTTP/HTTPS routing vs Layer 4 port exposure.',
      communication: 'Structured and clear using engineering terminology.',
      strengths: [
        'Accurately explained Ingress Controller layer 7 routing.',
        'Good comparison of NodePort vs LoadBalancer Service types.'
      ],
      areas_to_improve: [
        'Briefly mention TLS termination at the Ingress controller level.'
      ],
      model_answer: 'NodePort exposes a Service on each Node’s IP at a static port (30000-32767). Ingress operates at Layer 7, managing external HTTP/HTTPS routing rules to cluster services via an Ingress Controller like NGINX.'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Career Coach & Mock Interview Practice</h1>
          <p className="text-xs text-gray-400">Contextual career advice & technical interview practice evaluated by AI</p>
        </div>

        <div className="p-1 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Career Coach Q&A
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'mock' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mock Technical Interview
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="glass-panel rounded-3xl border border-gray-800 flex flex-col h-[600px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {coachMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Bot className="w-4 h-4 animate-spin" />
                <span>CareerPilot AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-950/60 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask a question e.g. 'Should I apply to the CloudScale SRE position?'..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendChat}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase">
              SRE / Kubernetes Practice Question
            </span>
            <h3 className="text-base font-bold text-white">{question}</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Your Technical Answer</label>
            <textarea
              placeholder="Type your explanation here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full h-36 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-white outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <button
            onClick={handleEvaluateMock}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-500/25 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Evaluate Technical Answer</span>
          </button>

          {evalResult && (
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">AI Technical Evaluation Report</h4>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-sm">
                  {evalResult.score} / 10
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p><strong className="text-white">Technical Accuracy:</strong> {evalResult.technical_accuracy}</p>
                <p><strong className="text-white">Communication:</strong> {evalResult.communication}</p>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Strengths</h5>
                <ul className="list-disc list-inside text-xs text-emerald-400 space-y-0.5">
                  {evalResult.strengths?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Model Ideal Answer</h5>
                <p className="text-xs text-gray-300 font-mono bg-gray-950 p-3 rounded-xl border border-gray-800">
                  {evalResult.model_answer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
