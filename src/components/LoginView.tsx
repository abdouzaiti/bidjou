import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, ChevronRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
  settings: any; // Using any for brevity or import ClubSettings
}

export default function LoginView({ onLoginSuccess, settings }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulated auth - matching settings logic in App.tsx
    setTimeout(() => {
      const isCoach = username === (settings.coachUsername || 'coach') && password === (settings.coachPassword || 'password');
      const isAdmin = (username === 'admin' && password === 'admin');
      
      if (isCoach || isAdmin) {
        onLoginSuccess();
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 antialiased">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-bento-gold/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-bento-blue/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-bento-gold to-bento-gold-dark p-0.5 rounded-3xl shadow-2xl mb-6">
            <div className="w-full h-full bg-neutral-950 rounded-[22px] flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <h1 className="text-white font-display font-black text-3xl uppercase tracking-tighter mb-2">
            {settings.clubName}
          </h1>
          <div className="flex items-center gap-2 text-bento-gold/60 font-bold text-[10px] uppercase tracking-widest">
            <Shield className="w-3 h-3" />
            <span>Portail de Gestion Sécurisé</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
          {/* Inner glass highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Identifiant</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin ou coach"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-gold/30 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-gold/30 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden bg-bento-gold hover:bg-bento-gold-dark text-neutral-950 font-black py-4 rounded-2xl shadow-xl shadow-bento-gold/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SE CONNECTER</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              Système de gestion interne © 2026
            </p>
          </div>
        </div>

        {/* Hints */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-[10px] text-slate-600 font-medium">
            Accès Admin: <span className="text-slate-400">admin / admin</span>
          </p>
          <p className="text-[10px] text-slate-600 font-medium mt-1">
            Accès Coach: <span className="text-slate-400">coach / password</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
