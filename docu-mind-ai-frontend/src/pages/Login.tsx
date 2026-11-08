import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/10" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-md px-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-2xl">DocuMind</div>
              <div className="text-indigo-300/60 text-sm">AI Document Intelligence</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your documents,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              brilliantly understood.
            </span>
          </h1>
          <p className="text-[#6b6b84] text-lg leading-relaxed">
            Upload documents, ask questions, get AI-powered answers grounded in your actual content. RAG-powered intelligence at your fingertips.
          </p>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">DocuMind</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-[#6b6b84] mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-1.5">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Enter your username"
                className="w-full bg-[#13131a] border border-[#2a2a3a] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4a4a5e] outline-none transition-all focus:ring-1 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full bg-[#13131a] border border-[#2a2a3a] focus:border-indigo-500/50 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-[#4a4a5e] outline-none transition-all focus:ring-1 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b84] hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-[#6b6b84] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
