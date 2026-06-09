import React, { useState } from 'react';
import { Upload, ShieldCheck, Zap, FileText, ChevronRight, Sparkles, RefreshCcw, CheckCircle, Download, FileDown, Layers } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8417/api";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [result, setResult] = useState(null);
  const [rewriteLevel, setRewriteLevel] = useState("medium");
  const [rewriteResult, setRewriteResult] = useState(null);
  const [quota, setQuota] = useState(10); // 每日额度

  const scrollToInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setResult(null);
    setRewriteResult(null);
    setText("");
    setFile(null);
    scrollToInput();
  };

  const decreaseQuota = () => {
    if (quota > 0) {
      setQuota(prev => prev - 1);
    }
  };

  const handleBatchClick = () => {
    alert("批量处理功能正在内测中。如需大批量处理，请通过 API 接入或联系学术客服。");
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (quota <= 0) {
      alert("今日额度已用完，请明天再试或升级账户。");
      return;
    }

    setLoading(true);
    setRewriteResult(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE}/detect-file`, formData);
      setResult(response.data);
      if (response.data.text) setText(response.data.text);
      decreaseQuota();
      // Automatically scroll to result after short delay
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      alert("Error uploading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectText = async () => {
    if (!text.trim()) return;

    if (quota <= 0) {
      alert("今日额度已用完，请明天再试或升级账户。");
      return;
    }

    setLoading(true);
    setRewriteResult(null);
    try {
      const response = await axios.post(`${API_BASE}/detect-text`, { text });
      setResult(response.data);
      decreaseQuota();
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!text.trim()) return;

    if (quota <= 0) {
      alert("今日额度已用完，请明天再试或升级账户。");
      return;
    }

    setRewriting(true);
    try {
      const response = await axios.post(`${API_BASE}/rewrite`, {
        text: text,
        level: rewriteLevel
      });
      setRewriteResult(response.data);
      decreaseQuota();
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      alert("Rewriting failed: " + err.message);
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetAll}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white italic">Paper<span className="text-indigo-500 font-black">Wise</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              今日额度: <span className={quota > 3 ? "text-indigo-400" : "text-red-400"}>{quota}/10</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-6"
          >
            <Sparkles className="w-3 h-3" />
            全新 Llama 3 改写引擎已上线
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            让 AI 充满 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">学术人味</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            一站式学术论文工具：深度 AIGC 检测 + 多级人性化改写。
            <br />锁定术语与格式，只优化叙述逻辑。
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Input Panel */}
          <div className="lg:col-span-12">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 pointer-events-none"></div>

              <div className="relative mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium border border-slate-700">文本模式</button>
                    <div className="relative group">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            上传文件
                          </>
                        )}
                      </button>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    当前字数: {text.length} / 5000
                  </div>
                </div>

                <textarea
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[300px] transition-all text-sm leading-relaxed"
                  placeholder="在此输入您的学术论文片段，或上传附件..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['low', 'medium', 'high'].map(l => (
                      <button
                        key={l}
                        onClick={() => setRewriteLevel(l)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rewriteLevel === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {l === 'low' ? '轻微' : l === 'medium' ? '中度' : '深度'}改写
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Layers className="w-4 h-4" />
                    <span>术语锁定已开启</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDetectText}
                    disabled={loading || !text.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all border border-slate-700"
                  >
                    {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    仅检测 AI 率
                  </button>
                  <button
                    onClick={handleRewrite}
                    disabled={rewriting || !text.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20"
                  >
                    {rewriting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    一键人性化改写
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <AnimatePresence>
            {(result || rewriteResult) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                id="results-section"
                className="lg:col-span-12 space-y-8"
              >
                {/* AI Probability Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">分析报告</h2>
                      <p className="text-slate-400 text-sm">基于 RoBERTa 及语义突发性检测引擎</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">原文 AI 率</p>
                        <p className={`text-3xl font-black ${result?.overall_ai_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                          {result?.overall_ai_score}%
                        </p>
                      </div>
                      {rewriteResult && (
                        <div className="flex items-center gap-6 pl-6 border-l border-slate-800">
                          <ChevronRight className="text-slate-700" />
                          <div className="text-center">
                            <p className="text-xs text-indigo-400 uppercase font-bold mb-1">改写后 AI 率</p>
                            <p className="text-3xl font-black text-indigo-400">
                              {rewriteResult.detection_after?.overall_ai_score}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Visual */}
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-1000 ${result?.overall_ai_score > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${result?.overall_ai_score}%` }}
                    ></div>
                    {rewriteResult && (
                      <div
                        className="h-full bg-indigo-500 transition-all duration-1000 border-l-2 border-slate-900"
                        style={{ width: `${rewriteResult.detection_after?.overall_ai_score}%` }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Comparison View */}
                {rewriteResult && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur">
                      <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> 原文 (高风险内容为红色)
                      </h3>
                      <div className="text-sm leading-relaxed text-slate-400 h-[400px] overflow-y-auto pr-4">
                        {text}
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> 人性化改写文
                        </h3>
                        <button
                          onClick={() => {
                            const blob = new Blob([rewriteResult.rewritten_text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'rewritten_paper.txt';
                            a.click();
                          }}
                          className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <FileDown className="w-3 h-3" /> 导出 TXT
                        </button>
                      </div>
                      <div className="text-sm leading-relaxed text-white h-[400px] overflow-y-auto pr-4 font-medium">
                        {rewriteResult.rewritten_text}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Chunks (When no rewrite result yet) */}
                {!rewriteResult && result?.details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.details.map((chunk, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">段落 {idx + 1}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chunk.ai_score > 0.5 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {Math.round(chunk.ai_score * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Trust Badges */}
      {!result && !rewriteResult && (
        <div className="max-w-4xl mx-auto px-4 mt-20 opacity-30 grayscale contrast-125">
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <div className="text-xl font-bold italic">IEEE</div>
            <div className="text-xl font-bold italic">Springer</div>
            <div className="text-xl font-bold italic">Nature</div>
            <div className="text-xl font-bold italic">Elsevier</div>
            <div className="text-xl font-bold italic">ACM</div>
          </div>
        </div>
      )}

      <footer className="mt-12 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 PaperWise AI. 专业级学术诚信守护者。</p>
      </footer>
    </div>
  );
}

export default App;
