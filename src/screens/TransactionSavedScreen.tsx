import React from 'react';
import { Check } from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';

export const TransactionSavedScreen: React.FC = () => {
  const { setCurrentScreen } = useBankers();

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Subtitle */}
        <div className="pt-4 text-center">
          <span className="text-[11px] font-medium text-slate-400">
            Upload Your Screenshots.
          </span>
        </div>
      </div>

      {/* Center Confirmation Content (Matching Page 11 of PDF) */}
      <div className="px-8 flex flex-col items-center text-center -mt-6">
        <h1 className="text-[26px] font-extrabold text-slate-800 leading-tight">
          Transaction
          <br />
          Saved!
        </h1>

        <div className="my-8 w-28 h-28 rounded-full bg-[#8FB387] flex items-center justify-center shadow-sm">
          <Check className="w-14 h-14 text-white stroke-[3.2]" />
        </div>

        <p className="text-[13px] font-medium text-slate-600 leading-relaxed max-w-[230px]">
          Transaction has been successfully saved to your respective card!
        </p>
      </div>

      {/* Bottom "Ok" Button */}
      <div className="px-7 pb-12">
        <button
          type="button"
          onClick={() => setCurrentScreen('wallet')}
          className="w-full h-11 rounded-xl bg-[#5E7858] hover:bg-[#4E6648] active:scale-[0.99] text-white text-[13px] font-semibold shadow-md transition-all"
        >
          Ok
        </button>
      </div>
    </div>
  );
};
