import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwdStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][pwdStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/10" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl" />
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
              <div className="text-purple-300/60 text-sm">AI Document Intelligence</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start your journey with{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              intelligent documents.
            </span>
          </h1>
          <div className="space-y-4">
            {['Upload PDFs, DOCX & TXT files', 'AI-powered Q&A with citations', 'Semantic search across your knowledge'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-[#a0a0b8] text-sm">{t}</span>
              </div>
            ))}
          </div>
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
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">DocuMind</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-[#6b6b84] mb-8">Get started with DocuMind AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-1.5">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Choose a username"
                className="w-full bg-[#13131a] border border-[#2a2a3a] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4a4a5e] outline-none transition-all focus:ring-1 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-[#13131a] border border-[#2a2a3a] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4a4a5e] outline-none transition-all focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Create a strong password"
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
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength ? strengthColor : 'bg-[#2a2a3a]'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-[#6b6b84]">{strengthLabel}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-[#6b6b84] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
