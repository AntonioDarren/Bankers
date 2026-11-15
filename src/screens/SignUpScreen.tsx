import React, { useState } from 'react';
import { Eye, EyeOff, Check, Loader2, ShieldAlert, X } from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';

export const SignUpScreen: React.FC = () => {
  const {
    registerAccount,
    setCurrentScreen,
    isAuthLoading,
  } = useBankers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAgreement = () => {
    setErrorMsg(null);
    setHasReadAgreement(true);
    setShowAgreementModal(true);
  };

  const handleToggleCheckbox = () => {
    setErrorMsg(null);
    if (!hasReadAgreement) {
      setErrorMsg(
        'Please click and read the Agreement first before checking the box.'
      );
      return;
    }
    setAgreed((prev) => !prev);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password || !confirmPassword) {
      setErrorMsg('Credentials cannot be empty.');
      return;
    }
    if (
      !email.includes('@') ||
      password.length < 6 ||
      password !== confirmPassword
    ) {
      setErrorMsg('Invalid credentials.');
      return;
    }
    if (!hasReadAgreement) {
      setErrorMsg(
        'Please click and read the Agreement first before registering.'
      );
      return;
    }
    if (!agreed) {
      setErrorMsg('Please check the Agreement box before registering.');
      return;
    }

    const result = await registerAccount(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col text-slate-800 relative">
      <div>
        <StatusBar darkText={true} />

        {/* Header */}
        <div className="pt-5 pb-6 text-center">
          <h1 className="text-[16px] font-bold tracking-[0.08em] text-slate-800 uppercase">
            SIGN UP
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} noValidate className="px-7 space-y-4">
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
                autoComplete="new-password"
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#738F6D] focus:ring-2 focus:ring-[#738F6D]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=""
              autoComplete="new-password"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#738F6D] focus:ring-2 focus:ring-[#738F6D]/15 transition-all"
            />
          </div>

          {/* Agreement Checkbox + Underlined Clickable Link */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreed}
                onClick={handleToggleCheckbox}
                title={
                  hasReadAgreement
                    ? 'Check Agreement'
                    : 'Click Agreement first to unlock this checkbox'
                }
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                  agreed
                    ? 'bg-[#738F6D] border-[#738F6D] text-white cursor-pointer'
                    : hasReadAgreement
                    ? 'bg-white border-slate-400 hover:border-[#738F6D] cursor-pointer'
                    : 'bg-slate-100 border-slate-300 text-slate-300 cursor-not-allowed'
                }`}
              >
                {agreed && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={handleOpenAgreement}
                className="text-[11.5px] text-slate-600 hover:text-[#5E7858] font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Agreement
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-center text-[11.5px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2 px-3">
              {errorMsg}
            </div>
          )}

          {/* Register Button */}
          <div className="pt-2 flex flex-col items-center">
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-48 h-10 rounded-full bg-[#738F6D] hover:bg-[#617B5B] active:scale-[0.98] disabled:opacity-60 text-white text-[13px] font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {isAuthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Register</span>
            </button>

            {/* Switch to Sign In directly below Register button */}
            <div className="w-full pt-5 mt-5 text-center border-t border-slate-100">
              <p className="text-[12px] text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentScreen('signin')}
                  className="font-bold text-[#5E7858] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* University Project Agreement Modal */}
      {showAgreementModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5"
          onClick={() => setShowAgreementModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white rounded-3xl p-5 text-slate-800 shadow-2xl border border-slate-100 space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  User Agreement &amp; Disclaimer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close Agreement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11.5px] text-slate-600 space-y-2.5 leading-relaxed max-h-[280px] overflow-y-auto pr-1">
              <p className="font-semibold text-slate-800">
                Important Notice: University Project Prototype
              </p>
              <p>
                <strong>BANKERS</strong> is developed strictly as a{' '}
                <strong>university academic project</strong> and is{' '}
                <strong>not an official banking or financial application</strong>.
              </p>
              <p>
                Please be careful with your credentials and personal data when
                using this application:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                <li>
                  <strong>Do not use real banking credentials</strong>, real
                  passwords you use elsewhere, or sensitive personal data.
                </li>
                <li>
                  <strong>Make sure to use a fake name</strong>, dummy account
                  numbers, and sample financial figures if you want to test or
                  use this app.
                </li>
                <li>
                  Any receipts, balances, or profiles entered are for academic
                  demonstration and simulation purposes only.
                </li>
              </ul>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="w-full py-2.5 rounded-full bg-[#738F6D] hover:bg-[#5E7858] active:scale-[0.99] text-white text-[12px] font-semibold shadow-sm transition-all"
              >
                I Have Read &amp; Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
