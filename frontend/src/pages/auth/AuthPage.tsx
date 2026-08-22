import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SignInForm } from '../../components/auth/SignInForm';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export function AuthPage({ initialMode = 'signin' }: { initialMode?: 'signin' | 'signup' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-[#F9FAFB] overflow-hidden font-sans select-none">
      {/* Ambient Canvas Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-zinc-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <div className="flex items-center gap-2.5 p-1.5 pl-2 pr-4 rounded-full bg-white border border-zinc-200/80 shadow-2xs mb-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              D
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 flex items-center gap-1.5">
              Dayflow <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">HRMS</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium">Simple, modern workforce management</p>
        </div>

        {/* 3D Flip Interactive Pill Toggle */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="p-1 rounded-2xl bg-zinc-200/60 backdrop-blur-md flex items-center gap-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                !isSignUp
                  ? 'bg-white text-zinc-900 shadow-2xs scale-[1.02]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isSignUp
                  ? 'bg-white text-zinc-900 shadow-2xs scale-[1.02]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSignUp((prev) => !prev)}
            title="Flip 3D View"
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 transition-all active:scale-95 cursor-pointer text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Perspective Card Flip Container */}
        <div style={{ perspective: 1200 }} className="w-full">
          <motion.div
            animate={{
              rotateY: isSignUp ? 180 : 0,
            }}
            transition={{
              duration: 0.7,
              type: 'spring',
              stiffness: 90,
              damping: 15,
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full"
          >
            {/* FRONT FACE (Sign In) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className={`w-full bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-opacity duration-200 ${
                isSignUp ? 'pointer-events-none absolute inset-0 opacity-0' : 'relative opacity-100'
              }`}
            >
              <SignInForm onFlipToSignUp={() => setIsSignUp(true)} />
            </div>

            {/* BACK FACE (Sign Up) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className={`w-full bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-opacity duration-200 ${
                !isSignUp ? 'pointer-events-none absolute inset-0 opacity-0' : 'relative opacity-100'
              }`}
            >
              <SignUpForm onFlipToSignIn={() => setIsSignUp(false)} />
            </div>
          </motion.div>
        </div>

        {/* Bottom Security Badge */}
        <div className="mt-6 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Interactive 3D Auth • Encrypted Workspace State</span>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
