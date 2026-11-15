import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';

export const SignInScreen: React.FC = () => {
  const {
    loginAccount,
    setCurrentScreen,
    isAuthLoading,
  } = useBankers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Credentials cannot be empty.');
      return;
    }

    const result = await loginAccount(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Header */}
        <div className="pt-6 pb-8 text-center">
          <h1 className="text-[16px] font-bold tracking-[0.08em] text-slate-800 uppercase">
            SIGN IN
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} noValidate className="px-7 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              autoComplete="off"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#738F6D] focus:ring-2 focus:ring-[#738F6D]/15 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                autoComplete="current-password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#738F6D] focus:ring-2 focus:ring-[#738F6D]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-center text-[11.5px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2 px-3">
              {errorMsg}
            </div>
          )}

          {/* Login Button */}
          <div className="pt-4 flex flex-col items-center">
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-48 h-10 rounded-full bg-[#738F6D] hover:bg-[#617B5B] active:scale-[0.98] disabled:opacity-60 text-white text-[13px] font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {isAuthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Login</span>
            </button>

            {/* Switch to Sign Up directly below Login button */}
            <div className="w-full pt-5 mt-5 text-center border-t border-slate-100">
              <p className="text-[12px] text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentScreen('signup')}
                  className="font-bold text-[#5E7858] hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
