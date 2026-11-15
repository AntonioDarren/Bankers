import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ChevronRight,
  Plus,
  Check,
} from 'lucide-react';
import {
  useBankers,
  WalletProviderType,
  CARD_COLOR_PRESETS,
} from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import {
  WalletProviderBranding,
  getCardGradientStyle,
  CardChipSvg,
} from '../components/WalletVisuals';

const WALLET_TYPES: WalletProviderType[] = [
  'BCA',
  'Gopay',
  'OCTO Mobile',
  'DANA',
  'blu',
  'Hana Bank',
  'ShopeePay Visa',
  'Other Bank',
  'Other E-Money',
];

export const AddWalletScreen: React.FC = () => {
  const { addWalletCard, setCurrentScreen } = useBankers();

  const [accountNumber, setAccountNumber] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [selectedType, setSelectedType] =
    useState<WalletProviderType>('Gopay');
  const [customProviderName, setCustomProviderName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(
    CARD_COLOR_PRESETS[0].hex
  );
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCustomType =
    selectedType === 'Other Bank' || selectedType === 'Other E-Money';
  const resolvedProviderCategory: 'bank' | 'emoney' | undefined =
    selectedType === 'Other Bank'
      ? 'bank'
      : selectedType === 'Other E-Money'
      ? 'emoney'
      : undefined;
  const resolvedDisplayType: WalletProviderType =
    isCustomType && customProviderName.trim()
      ? customProviderName.trim()
      : selectedType;

  const handleBalanceChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      setBalanceInput('');
      return;
    }
    const formatted = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setBalanceInput(formatted);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAcc = accountNumber.trim() || 'xxxx xxxx xxxx';
    const numericBalance =
      Number(balanceInput.replace(/\./g, '').replace(/\D/g, '')) || 0;

    if (!accountNumber.trim()) {
      setErrorMsg('Please enter an Account Number first.');
      return;
    }

    if (isCustomType && !customProviderName.trim()) {
      setErrorMsg(
        selectedType === 'Other Bank'
          ? 'Please enter the Bank name (e.g. Mandiri, BNI, BRI, SeaBank).'
          : 'Please enter the E-Money name (e.g. OVO, LinkAja).'
      );
      return;
    }

    addWalletCard({
      accountNumber: cleanAcc,
      balance: numericBalance,
      type: resolvedDisplayType,
      providerCategory: resolvedProviderCategory,
      color: selectedColor,
    });

    setCurrentScreen('wallet');
  };

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Top Bar */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen('wallet')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <span className="text-[11px] font-medium text-slate-400">
            Add To Your Wallet.
          </span>

          <div className="w-7" />
        </div>

        {/* Title */}
        <div className="text-center pt-1 pb-4">
          <h1 className="text-[14.5px] font-bold text-slate-800">
            Card Details
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleAddCard} className="px-7 space-y-4">
          {/* Account Number */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
              Account Number
            </label>
            <div className="relative flex items-center">
              <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="08xx - xxxx - xxxx"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#EAEAEA] text-[12.5px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#738F6D]/30"
              />
            </div>
          </div>

          {/* Account Balance */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
              Account Balance
            </label>
            <div className="relative flex items-center">
              <span className="text-[12.5px] font-extrabold text-slate-700 absolute left-3.5 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={balanceInput}
                onChange={(e) => handleBalanceChange(e.target.value)}
                placeholder="xxx.xxx"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#EAEAEA] text-[12.5px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#738F6D]/30"
              />
            </div>
          </div>

          {/* Type & Color Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Type Selector */}
            <div className="relative">
              <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
                Type
              </label>
              <button
                type="button"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full h-8 px-3 rounded-lg bg-[#EAEAEA] flex items-center gap-1.5 text-[11px] font-semibold text-slate-700"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{selectedType}</span>
              </button>

              {showTypeDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-xl py-1 divide-y divide-slate-100 max-h-52 overflow-y-auto">
                  {WALLET_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedType(t);
                        setErrorMsg(null);
                        if (t === 'BCA') setSelectedColor('#135D78');
                        else if (t === 'OCTO Mobile') setSelectedColor('#7C1919');
                        else if (t === 'Gopay') setSelectedColor('#135D78');
                        else if (t === 'Hana Bank') setSelectedColor('#0D6E5B');
                        else if (t === 'blu') setSelectedColor('#1CA7B8');
                        else if (t === 'ShopeePay Visa')
                          setSelectedColor('#1E242B');
                        setShowTypeDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[11.5px] font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{t}</span>
                      {selectedType === t && (
                        <Check className="w-3 h-3 text-[#738F6D]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
                Color
              </label>
              <div className="flex items-center gap-2">
                {CARD_COLOR_PRESETS.slice(0, 2).map((preset) => {
                  const isSelected = selectedColor === preset.hex;
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setSelectedColor(preset.hex)}
                      style={{ backgroundColor: preset.hex }}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-slate-800 scale-105'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                      title={preset.name}
                    />
                  );
                })}
                <label
                  className="w-7 h-7 rounded-lg bg-[#EAEAEA] flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200"
                  title="Pick Custom Color"
                >
                  <Plus className="w-4 h-4" />
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Custom Bank / E-Money Name Input (Appears when Other Bank or Other E-Money is selected) */}
          {isCustomType && (
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
                {selectedType === 'Other Bank'
                  ? 'Custom Bank Name'
                  : 'Custom E-Money Name'}
              </label>
              <input
                type="text"
                autoFocus
                value={customProviderName}
                onChange={(e) => {
                  setErrorMsg(null);
                  setCustomProviderName(e.target.value);
                }}
                placeholder={
                  selectedType === 'Other Bank'
                    ? 'Enter bank name (e.g. Mandiri, BNI, BRI, SeaBank)...'
                    : 'Enter e-money name (e.g. OVO, LinkAja, i.saku)...'
                }
                className="w-full h-10 px-3.5 rounded-xl bg-[#EAEAEA] text-[12px] font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#738F6D]/30"
              />
            </div>
          )}

          {/* Live Preview */}
          <div className="pt-2">
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
              Preview
            </label>
            <div
              style={getCardGradientStyle(selectedColor)}
              className="w-full h-[152px] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between transition-all duration-300"
            >
              <WalletProviderBranding
                type={resolvedDisplayType}
                providerCategory={resolvedProviderCategory}
              />
              <div className="flex items-end justify-between">
                <div className="text-[10.5px] font-mono tracking-wider text-white/85">
                  {accountNumber.trim() || 'xxxx xxxx xxxx'}
                </div>
                {selectedType === 'ShopeePay Visa' && <CardChipSvg />}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="text-center text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2 px-3">
              {errorMsg}
            </div>
          )}

          {/* Add Card Submit Button */}
          <div className="pt-3 pb-6">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#5E7858] hover:bg-[#4E6649] active:scale-[0.99] text-white text-[12.5px] font-semibold shadow-md transition-all"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
