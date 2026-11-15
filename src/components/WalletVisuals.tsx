import React from 'react';
import {
  Utensils,
  Car,
  FileSpreadsheet,
  HeartPulse,
  ShoppingBag,
  ArrowLeftRight,
  ReceiptText,
  Wallet as WalletIcon,
  Landmark,
} from 'lucide-react';
import {
  WalletProviderType,
  TransactionCategoryType,
} from '../context/BankersContext';

/**
 * Returns true for Bank accounts (BCA, OCTO Mobile, Hana Bank, blu, or custom 'bank')
 * and false for E-Money / E-Wallets (Gopay, DANA, ShopeePay Visa, or custom 'emoney').
 */
export const isBankWalletProvider = (
  type?: WalletProviderType,
  providerCategory?: 'bank' | 'emoney'
): boolean => {
  if (providerCategory === 'bank') return true;
  if (providerCategory === 'emoney') return false;
  if (!type) return false;
  if (
    type === 'BCA' ||
    type === 'OCTO Mobile' ||
    type === 'Hana Bank' ||
    type === 'blu' ||
    type === 'Other Bank'
  ) {
    return true;
  }
  if (
    type === 'Gopay' ||
    type === 'DANA' ||
    type === 'ShopeePay Visa' ||
    type === 'Other E-Money'
  ) {
    return false;
  }
  return /bank|bca|mandiri|bri|bni|bsi|cimb|permata|danamon|jago|seabank|jenius|panin|ocbc|uob|mega|btn/i.test(
    type
  );
};

export const CardChipSvg: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    width="34"
    height="26"
    viewBox="0 0 34 26"
    fill="none"
    className={`shrink-0 ${className}`}
  >
    <rect
      x="0.5"
      y="0.5"
      width="33"
      height="25"
      rx="4.5"
      fill="url(#chipGrad)"
      stroke="#CBD5E1"
      strokeOpacity="0.6"
    />
    <path
      d="M1 9H12M22 9H33M1 17H12M22 17H33M12 1V25M22 1V25"
      stroke="#64748B"
      strokeOpacity="0.45"
      strokeWidth="0.9"
    />
    <rect
      x="12"
      y="7"
      width="10"
      height="12"
      rx="2"
      stroke="#64748B"
      strokeOpacity="0.45"
      strokeWidth="0.9"
    />
    <defs>
      <linearGradient
        id="chipGrad"
        x1="0"
        y1="0"
        x2="34"
        y2="26"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E2E8F0" />
        <stop offset="0.5" stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
    </defs>
  </svg>
);

export const WalletProviderBranding: React.FC<{
  type: WalletProviderType;
  providerCategory?: 'bank' | 'emoney';
  compact?: boolean;
}> = ({ type, providerCategory, compact = false }) => {
  switch (type) {
    case 'BCA':
      return (
        <div className="flex items-center justify-between w-full select-none">
          <span
            className={`${
              compact ? 'text-[14px]' : 'text-[17px]'
            } font-black italic tracking-tight text-white`}
          >
            BCA
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-sky-200">
            BANK
          </span>
        </div>
      );

    case 'Gopay':
      return (
        <div className="flex items-center gap-2">
          <div
            className={`${
              compact ? 'w-6 h-6' : 'w-7 h-7'
            } rounded-full bg-[#00AED6] flex items-center justify-center shadow-xs border border-white/25`}
          >
            <WalletIcon className="w-3.5 h-3.5 text-white fill-white/80" />
          </div>
        </div>
      );

    case 'OCTO Mobile':
      return (
        <div className="flex items-baseline gap-1 select-none">
          <span
            className={`${
              compact ? 'text-[13px]' : 'text-[16px]'
            } font-black tracking-tighter text-rose-400`}
          >
            OCTO
          </span>
          <span className="text-[10px] font-semibold text-white/85">
            Mobile
          </span>
        </div>
      );

    case 'blu':
      return (
        <div className="flex items-center justify-between w-full">
          <span
            className={`${
              compact ? 'text-[14px]' : 'text-[17px]'
            } font-extrabold italic tracking-tight text-cyan-100`}
          >
            blu
          </span>
        </div>
      );

    case 'Hana Bank':
      return (
        <div className="flex items-center justify-between w-full">
          <span className="text-[13px] font-bold tracking-tight text-emerald-200">
            line<sup className="text-[8px]">+</sup>
          </span>
          <span className="text-[9px] font-black tracking-widest uppercase text-white/90 leading-tight text-right">
            HANA
            <br />
            BANK
          </span>
        </div>
      );

    case 'ShopeePay Visa':
      return (
        <div className="flex items-center justify-between w-full">
          <div className="w-7 h-7 rounded-lg bg-[#EE4D2D] flex items-center justify-center text-white font-extrabold text-[12px] shadow-xs">
            S
          </div>
          <div className="text-right leading-none">
            <div className="text-[13.5px] font-black italic tracking-wider text-white">
              VISA
            </div>
            <div className="text-[7.5px] font-semibold uppercase tracking-widest text-white/80 mt-0.5">
              DEBIT
            </div>
          </div>
        </div>
      );

    case 'DANA':
      return (
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-0.5 rounded-md bg-[#118EEA] text-white font-extrabold text-[11px] tracking-wide">
            DANA
          </div>
        </div>
      );

    default: {
      const isBank = isBankWalletProvider(type, providerCategory);
      const displayName =
        type === 'Other Bank'
          ? 'Custom Bank'
          : type === 'Other E-Money'
          ? 'Custom E-Money'
          : type;
      return (
        <div className="flex items-center justify-between w-full gap-2 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`${
                compact ? 'w-5 h-5' : 'w-6 h-6'
              } rounded-lg bg-white/20 flex items-center justify-center shrink-0 border border-white/25`}
            >
              {isBank ? (
                <Landmark className="w-3 h-3 text-white" />
              ) : (
                <WalletIcon className="w-3 h-3 text-white" />
              )}
            </div>
            <span
              className={`${
                compact ? 'text-[11.5px]' : 'text-[14px]'
              } font-extrabold tracking-tight text-white truncate`}
            >
              {displayName}
            </span>
          </div>
          <span className="text-[7.5px] font-bold uppercase tracking-widest text-white/75 shrink-0">
            {isBank ? 'BANK' : 'E-MONEY'}
          </span>
        </div>
      );
    }
  }
};

export const getCardGradientStyle = (colorHex: string): React.CSSProperties => {
  const base = colorHex || '#135D78';
  return {
    background: `linear-gradient(135deg, ${base} 0%, #0F172A 135%)`,
  };
};

export const CategoryIconBadge: React.FC<{
  category: TransactionCategoryType;
  size?: 'sm' | 'md';
}> = ({ category, size = 'md' }) => {
  const boxClass = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl';
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  switch (category) {
    case 'FnB':
      return (
        <div
          className={`${boxClass} bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <Utensils className={iconClass} />
        </div>
      );
    case 'Income':
      return (
        <div
          className={`${boxClass} bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <FileSpreadsheet className={iconClass} />
        </div>
      );
    case 'Transportation':
      return (
        <div
          className={`${boxClass} bg-[#9333EA] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <Car className={iconClass} />
        </div>
      );
    case 'Shopping':
      return (
        <div
          className={`${boxClass} bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <ShoppingBag className={iconClass} />
        </div>
      );
    case 'Transfer':
      return (
        <div
          className={`${boxClass} bg-[#65A30D] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <ArrowLeftRight className={iconClass} />
        </div>
      );
    case 'Bills':
      return (
        <div
          className={`${boxClass} bg-[#C2410C] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <ReceiptText className={iconClass} />
        </div>
      );
    case 'Admin Fee':
      return (
        <div
          className={`${boxClass} bg-[#475569] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <Landmark className={iconClass} />
        </div>
      );
    case 'Health':
    default:
      return (
        <div
          className={`${boxClass} bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs`}
        >
          <HeartPulse className={iconClass} />
        </div>
      );
  }
};
