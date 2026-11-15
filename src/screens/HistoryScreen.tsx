import React, { useState } from 'react';
import { ArrowLeft, Clock, Plus } from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import { BottomNavBar } from '../components/BottomNavBar';
import { CategoryIconBadge } from '../components/WalletVisuals';

const formatTxAmount = (amount: number): string => {
  const abs = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return amount < 0 ? `-Rp${abs}` : `Rp${abs}`;
};

export const HistoryScreen: React.FC = () => {
  const { transactions, wallets, setCurrentScreen } = useBankers();
  const [filterWalletId, setFilterWalletId] = useState<string>('all');

  const filtered =
    filterWalletId === 'all'
      ? transactions
      : transactions.filter((t) => t.walletId === filterWalletId);

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Header */}
        <div className="px-6 pt-3 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen('home')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <h1 className="text-[15px] font-bold text-slate-800">
              Transaction History
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setCurrentScreen('upload-bill')}
            className="w-8 h-8 rounded-full bg-[#EBF1E8] text-[#5E7858] flex items-center justify-center hover:bg-[#DCE6D7]"
            title="Scan New Bill"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Filter Pills */}
        {wallets.length > 0 && (
          <div className="px-6 pb-3 flex items-center gap-1.5 overflow-x-auto mobile-scroll">
            <button
              type="button"
              onClick={() => setFilterWalletId('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
                filterWalletId === 'all'
                  ? 'bg-[#5E7858] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Wallets
            </button>
            {wallets.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setFilterWalletId(w.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
                  filterWalletId === w.id
                    ? 'bg-[#5E7858] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {w.type}
              </button>
            ))}
          </div>
        )}

        {/* Transactions List */}
        <div className="px-6 pb-8 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50/70 p-7 text-center">
              <p className="text-[13px] font-bold text-slate-700">
                No Transaction History Yet (0)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Tap the <strong>+</strong> button at the bottom center to upload
                a shopping receipt or bank screenshot using OCR.
              </p>
              <button
                type="button"
                onClick={() => setCurrentScreen('upload-bill')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#738F6D] hover:bg-[#5E7858] text-white text-[11.5px] font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload / Scan Bill Now</span>
              </button>
            </div>
          ) : (
            filtered.map((tx) => {
              const card = wallets.find((w) => w.id === tx.walletId);
              return (
                <div
                  key={tx.id}
                  className="rounded-2xl border border-slate-200/80 px-3.5 py-3 flex items-center justify-between gap-3 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIconBadge category={tx.category} size="md" />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-slate-800 truncate">
                        {tx.title}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <span>{tx.date}</span>
                        {card && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                            {card.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-[11.5px] font-bold shrink-0 ${
                      tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatTxAmount(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNavBar activeTab="history" />
    </div>
  );
};
