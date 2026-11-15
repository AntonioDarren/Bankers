import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  Clock,
  Pencil,
  ChevronDown,
  X,
  Check,
  Trash2,
  Copy,
} from 'lucide-react';
import {
  useBankers,
  WalletCard,
  WalletProviderType,
  CARD_COLOR_PRESETS,
} from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import { BottomNavBar } from '../components/BottomNavBar';
import {
  WalletProviderBranding,
  getCardGradientStyle,
  CategoryIconBadge,
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

const formatCardBalance = (amount: number): string => {
  const formatted = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp. ${formatted}`;
};

const formatTxAmount = (amount: number): string => {
  const abs = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return amount < 0 ? `-Rp${abs}` : `Rp${abs}`;
};

export const WalletScreen: React.FC = () => {
  const {
    wallets,
    transactions,
    selectedWalletId,
    setSelectedWalletId,
    setCurrentScreen,
    updateWalletCard,
    deleteWalletCard,
  } = useBankers();

  const [copiedToast, setCopiedToast] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [editingCard, setEditingCard] = useState<WalletCard | null>(null);
  const [editCustomName, setEditCustomName] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const selectedCard =
    wallets.find((w) => w.id === selectedWalletId) || null;
  const stackedCards = selectedCard
    ? wallets.filter((w) => w.id !== selectedCard.id)
    : wallets;

  const cardTransactions = selectedCard
    ? transactions.filter((t) => t.walletId === selectedCard.id)
    : [];

  const handleCopyCardNumber = (accNum: string) => {
    try {
      navigator.clipboard?.writeText(accNum);
    } catch {
      // Ignore clipboard permission issues
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleOpenEdit = (card: WalletCard, e: React.MouseEvent) => {
    e.stopPropagation();
    const isPreset = WALLET_TYPES.includes(card.type);
    if (!isPreset) {
      setEditCustomName(card.type);
      setEditingCard({
        ...card,
        type: card.providerCategory === 'emoney' ? 'Other E-Money' : 'Other Bank',
      });
    } else {
      setEditCustomName('');
      setEditingCard({ ...card });
    }
    setShowTypeDropdown(false);
  };

  const handleSaveCardEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    const isCustom =
      editingCard.type === 'Other Bank' || editingCard.type === 'Other E-Money';
    const finalType =
      isCustom && editCustomName.trim()
        ? editCustomName.trim()
        : editingCard.type;
    const finalCategory: 'bank' | 'emoney' | undefined =
      editingCard.type === 'Other Bank'
        ? 'bank'
        : editingCard.type === 'Other E-Money'
        ? 'emoney'
        : editingCard.providerCategory;

    updateWalletCard(editingCard.id, {
      accountNumber: editingCard.accountNumber || 'xxxx xxxx xxxx',
      type: finalType,
      providerCategory: finalCategory,
      color: editingCard.color,
      balance: editingCard.balance,
    });
    setEditingCard(null);
  };

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800 relative">
      <div>
        <StatusBar darkText={true} />

        <div className="px-6 pt-3 pb-6">
          {/* Top Featured Card Slot OR "Click the Card." Box */}
          {!selectedCard ? (
            <div className="w-full h-[184px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center p-5">
              <span className="text-[12px] font-semibold text-slate-600">
                Click the Card.
              </span>
            </div>
          ) : (
            <div
              onClick={() => handleCopyCardNumber(selectedCard.accountNumber)}
              style={getCardGradientStyle(selectedCard.color)}
              className="w-full h-[184px] rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all duration-300"
            >
              {/* Subtle glass highlight */}
              <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              {/* Top Row: Provider Logo & 3-Dots Edit Menu */}
              <div className="flex items-start justify-between gap-2.5 z-10">
                <div className="flex-1 min-w-0">
                  <WalletProviderBranding
                    type={selectedCard.type}
                    providerCategory={selectedCard.providerCategory}
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(selectedCard, e)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
                  title="Edit Card Information"
                  aria-label="Edit Card Information"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Middle Row: Balance & Optional EMV Chip */}
              <div className="flex items-center justify-between z-10 my-1">
                <div>
                  <div className="text-[18px] font-extrabold tracking-tight leading-tight">
                    {formatCardBalance(selectedCard.balance)}
                  </div>
                  <div className="text-[10px] text-white/75 font-medium mt-0.5">
                    Balance
                  </div>
                </div>

                {selectedCard.type === 'ShopeePay Visa' && <CardChipSvg />}
              </div>

              {/* Bottom Row: Account Number (Click to copy) & History Button */}
              <div className="flex items-center justify-between z-10 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCardNumber(selectedCard.accountNumber);
                  }}
                  className="text-[10.5px] font-mono tracking-wider text-white/85 hover:text-white flex items-center gap-1.5"
                  title="Click to copy account number"
                >
                  <span>{selectedCard.accountNumber}</span>
                  <Copy className="w-3 h-3 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistorySheet(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/40 text-[10px] font-semibold text-white/95 transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  <span>History</span>
                </button>
              </div>
            </div>
          )}

          {/* "+ Add Wallet" Pill Button */}
          <div className="mt-5 mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen('add-wallet')}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#738F6D] hover:bg-[#5E7858] active:scale-95 text-white text-[10px] font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Add Wallet</span>
            </button>

            {selectedCard && (
              <button
                type="button"
                onClick={() => setSelectedWalletId(null)}
                className="text-[10.5px] text-slate-400 hover:text-slate-600 font-medium"
              >
                Collapse card
              </button>
            )}
          </div>

          {/* Stacked Wallet Cards (Apple Wallet Style) */}
          {wallets.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <p className="text-[12px] font-semibold text-slate-700">
                Your Wallet Is Still Empty (0 Cards)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Click the <strong>+ Add Wallet</strong> button above to create
                your first bank or e-wallet card.
              </p>
            </div>
          ) : (
            <div className="relative mt-2 pb-16">
              {stackedCards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedWalletId(card.id)}
                  style={{
                    ...getCardGradientStyle(card.color),
                    marginTop: idx === 0 ? '0px' : '-108px',
                    zIndex: idx + 1,
                  }}
                  className="relative w-full h-[160px] rounded-2xl p-5 text-white shadow-[0_-4px_16px_rgba(0,0,0,0.22)] border-t border-white/15 cursor-pointer hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <WalletProviderBranding
                      type={card.type}
                      providerCategory={card.providerCategory}
                    />
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-[10.5px] font-mono text-white/80">
                      {card.accountNumber}
                    </span>
                    {card.type === 'ShopeePay Visa' && <CardChipSvg />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* "Card Information Copied" Pill Toast (Middle of Page 6) */}
      {copiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-200/95 backdrop-blur-xs text-slate-700 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-md border border-slate-300 animate-bounce">
          Card Information Copied
        </div>
      )}

      {/* Card Transaction History Sheet (Top of Page 7) */}
      {showHistorySheet && selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3"
          onClick={() => setShowHistorySheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[356px] bg-white rounded-[28px] p-5 text-slate-800 shadow-2xl max-h-[78vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-[14px] font-bold text-slate-800">
                  Transaction History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistorySheet(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto space-y-2.5 pr-1 flex-1">
              {cardTransactions.length === 0 ? (
                <div className="py-10 text-center text-[12px] text-slate-400">
                  No transaction history for this {selectedCard.type} card yet.
                  Tap the <strong>+</strong> button below to scan a bill with
                  OCR.
                </div>
              ) : (
                cardTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-2xl border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIconBadge category={tx.category} size="md" />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold text-slate-800 truncate">
                          {tx.title}
                        </div>
                        <div className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                          {tx.date}
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Information Modal/Sheet (Middle & Bottom of Page 7) */}
      {editingCard && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingCard(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCardEdit}
            className="w-full max-w-[350px] bg-white rounded-[28px] p-5 text-slate-800 shadow-2xl space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-slate-600" />
                <h3 className="text-[14px] font-bold text-slate-800">
                  Edit Card Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Number & Balance */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={editingCard.accountNumber}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[#738F6D]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                  Balance (Rp)
                </label>
                <input
                  type="number"
                  value={editingCard.balance}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      balance: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[#738F6D]"
                />
              </div>
            </div>

            {/* Type & Color Row */}
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* Type Dropdown */}
              <div className="relative">
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                  Type
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[12px] font-semibold text-slate-700"
                >
                  <span className="truncate">{editingCard.type}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {showTypeDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-xl py-1 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {WALLET_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setEditingCard({ ...editingCard, type: t });
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-[11.5px] font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>{t}</span>
                        {editingCard.type === t && (
                          <Check className="w-3 h-3 text-[#738F6D]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {CARD_COLOR_PRESETS.slice(0, 4).map((preset) => {
                    const isSelected = editingCard.color === preset.hex;
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() =>
                          setEditingCard({ ...editingCard, color: preset.hex })
                        }
                        style={{ backgroundColor: preset.hex }}
                        className={`w-6 h-6 rounded-md transition-transform ${
                          isSelected
                            ? 'ring-2 ring-offset-1 ring-slate-800 scale-105'
                            : 'opacity-85 hover:opacity-100'
                        }`}
                        title={preset.name}
                      />
                    );
                  })}
                  <label
                    className="w-6 h-6 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200"
                    title="Custom Color"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <input
                      type="color"
                      value={editingCard.color}
                      onChange={(e) =>
                        setEditingCard({
                          ...editingCard,
                          color: e.target.value,
                        })
                      }
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Bank / E-Money Name Input */}
            {(editingCard.type === 'Other Bank' ||
              editingCard.type === 'Other E-Money') && (
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">
                  {editingCard.type === 'Other Bank'
                    ? 'Custom Bank Name'
                    : 'Custom E-Money Name'}
                </label>
                <input
                  type="text"
                  value={editCustomName}
                  onChange={(e) => setEditCustomName(e.target.value)}
                  placeholder={
                    editingCard.type === 'Other Bank'
                      ? 'Enter bank name (e.g. Mandiri, BNI, BRI, SeaBank)...'
                      : 'Enter e-money name (e.g. OVO, LinkAja)...'
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[#738F6D]"
                />
              </div>
            )}

            {/* Live Card Preview */}
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 mb-1.5">
                Preview
              </label>
              <div
                style={getCardGradientStyle(editingCard.color)}
                className="w-full h-[148px] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between"
              >
                <WalletProviderBranding
                  type={
                    (editingCard.type === 'Other Bank' ||
                      editingCard.type === 'Other E-Money') &&
                    editCustomName.trim()
                      ? editCustomName.trim()
                      : editingCard.type
                  }
                  providerCategory={
                    editingCard.type === 'Other Bank'
                      ? 'bank'
                      : editingCard.type === 'Other E-Money'
                      ? 'emoney'
                      : editingCard.providerCategory
                  }
                />
                <div className="flex items-end justify-between">
                  <div className="text-[10.5px] font-mono text-white/85">
                    {editingCard.accountNumber || 'xxxx xxxx xxxx'}
                  </div>
                  {editingCard.type === 'ShopeePay Visa' && <CardChipSvg />}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  deleteWalletCard(editingCard.id);
                  setEditingCard(null);
                }}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#738F6D] hover:bg-[#5E7858] text-white text-[12.5px] font-semibold shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <BottomNavBar activeTab="wallet" />
    </div>
  );
};
