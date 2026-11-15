import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import {
  getActiveSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

export const SupabaseSetupModal: React.FC = () => {
  const {
    showSupabaseModal,
    setShowSupabaseModal,
    isSupabaseConnected,
    supabaseProjectName,
    connectSupabaseConfig,
    disconnectSupabaseConfig,
  } = useBankers();

  const existing = getActiveSupabaseConfig();
  const [urlInput, setUrlInput] = useState(existing?.url || '');
  const [anonKeyInput, setAnonKeyInput] = useState(existing?.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!showSupabaseModal) return null;

  const handleCopySql = () => {
    try {
      navigator.clipboard?.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanUrl = urlInput.trim();
    const cleanKey = anonKeyInput.trim();

    if (!cleanUrl.startsWith('http') || cleanKey.length < 15) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid Supabase Project URL (https://xxx.supabase.co) and anon public key.',
      });
      return;
    }

    connectSupabaseConfig({ url: cleanUrl, anonKey: cleanKey });
    setStatusMessage({
      type: 'success',
      text: 'Connected to Supabase! Email/Password Auth & PostgreSQL sync are now active.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-[#18241E] border border-white/15 rounded-3xl p-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4ADE80]" />
            <h3 className="text-[14px] font-bold">
              Supabase Auth &amp; PostgreSQL Database
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSupabaseModal(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="mt-3 flex items-center justify-between bg-[#111A15] rounded-xl px-3.5 py-2.5 border border-white/5 text-xs">
          <span className="text-slate-300">Database Status:</span>
          {isSupabaseConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[#4ADE80] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected ({supabaseProjectName})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              Local Mode (Not Connected)
            </span>
          )}
        </div>

        {/* Quick 3-Step Supabase Guide */}
        <div className="mt-3 bg-[#111A15]/80 rounded-xl p-3 border border-white/5 text-[11px] text-slate-300 space-y-1.5">
          <div className="font-bold text-white text-[11.5px]">
            How to Connect Your Supabase Project (Free):
          </div>
          <div>
            1. Open{' '}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[#4ADE80] underline font-semibold"
            >
              supabase.com/dashboard
            </a>{' '}
            → Create a New Project.
          </div>
          <div>
            2. Go to <strong>Authentication → Providers → Email</strong> and
            toggle <strong>&quot;Confirm email&quot; OFF</strong> so fake/dummy
            university emails can sign up immediately.
          </div>
          <div>
            3. Go to <strong>SQL Editor → New Query</strong>, copy &amp; run the
            SQL table script below, then paste your{' '}
            <strong>Project URL</strong> &amp; <strong>anon public key</strong>{' '}
            (from <strong>Project Settings → API</strong>).
          </div>
        </div>

        {/* Copyable SQL Schema Box */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-300">
              SQL Schema (<code className="text-[#4ADE80]">supabase_schema.sql</code>):
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#26382E] hover:bg-[#31473B] text-[#4ADE80] text-[10.5px] font-semibold transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="w-full max-h-[110px] overflow-y-auto rounded-xl bg-[#0E1612] border border-white/10 p-2.5 font-mono text-[10px] text-emerald-200/90 leading-relaxed">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* URL & Anon Key Input Form */}
        <form onSubmit={handleSave} className="mt-3 space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Supabase Project URL (<code className="text-[#4ADE80]">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://abcdefghijklm.supabase.co"
              className="w-full h-10 px-3 rounded-xl bg-[#0E1612] border border-white/10 font-mono text-[11px] text-emerald-200 placeholder:text-slate-600 focus:outline-none focus:border-[#4ADE80]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Supabase Anon Public Key (<code className="text-[#4ADE80]">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="text"
              value={anonKeyInput}
              onChange={(e) => setAnonKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-10 px-3 rounded-xl bg-[#0E1612] border border-white/10 font-mono text-[11px] text-emerald-200 placeholder:text-slate-600 focus:outline-none focus:border-[#4ADE80]"
            />
          </div>

          {statusMessage && (
            <div
              className={`text-[11px] rounded-xl px-3 py-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#689F77] hover:bg-[#5A8E68] text-[12px] font-bold text-white transition-all"
            >
              Save &amp; Connect Supabase
            </button>

            {isSupabaseConnected && (
              <button
                type="button"
                onClick={() => {
                  disconnectSupabaseConfig();
                  setUrlInput('');
                  setAnonKeyInput('');
                  setStatusMessage({
                    type: 'success',
                    text: 'Runtime Supabase connection removed.',
                  });
                }}
                className="p-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all"
                title="Disconnect runtime config"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
