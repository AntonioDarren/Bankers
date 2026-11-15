import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Check,
  Wallet,
} from 'lucide-react';
import {
  useBankers,
  TransactionItem,
  TransactionCategoryType,
  formatRupiah,
} from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import {
  WalletProviderBranding,
  getCardGradientStyle,
  CategoryIconBadge,
  isBankWalletProvider,
} from '../components/WalletVisuals';
import { inferCategoryFromText } from '../lib/ocrEngine';

const ALL_CATEGORIES: TransactionCategoryType[] = [
  'FnB',
  'Transportation',
  'Income',
  'Health',
  'Shopping',
  'Transfer',
  'Bills',
  'Admin Fee',
];

const formatTxCurrency = (amount: number): string => {
  const abs = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return amount < 0 ? `-Rp${abs}` : `Rp${abs}`;
};

const formatEditableAmount = (amount: number): string => {
  if (amount === 0) return '';
  return formatTxCurrency(amount);
};

export const EditTransactionScreen: React.FC = () => {
  const {
    wallets,
    selectedWalletId,
    setSelectedWalletId,
    pendingTransactions,
    setPendingTransactions,
    savePendingTransactionsToWallet,
    setCurrentScreen,
  } = useBankers();

  const [targetWalletId, setTargetWalletId] = useState<string>(() => {
    const validSelected = wallets.find((w) => w.id === selectedWalletId);
    return validSelected ? validSelected.id : wallets[0]?.id || '';
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedWallet =
    wallets.find((w) => w.id === targetWalletId) || wallets[0] || null;
  const isSelectedWalletBank = isBankWalletProvider(
    selectedWallet?.type,
    selectedWallet?.providerCategory
  );

  // Keep targetWalletId always pointing to a valid wallet in `wallets`
  useEffect(() => {
    if (wallets.length === 0) {
      if (targetWalletId !== '') setTargetWalletId('');
      return;
    }
    const exists = wallets.some((w) => w.id === targetWalletId);
    if (!exists) {
      const validSelected = wallets.find((w) => w.id === selectedWalletId);
      const nextId = validSelected ? validSelected.id : wallets[0].id;
      setTargetWalletId(nextId);
      setSelectedWalletId(nextId);
    }
  }, [wallets, selectedWalletId, targetWalletId, setSelectedWalletId]);

  // Starts empty ([]) unless OCR extracted transactions from a scanned receipt
  const [items, setItems] = useState<TransactionItem[]>(
    () => pendingTransactions
  );

  // New transaction input state (for adding a transaction manually)
  const [showNewInputRow, setShowNewInputRow] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newCategory, setNewCategory] =
    useState<TransactionCategoryType>('FnB');
  const [showNewCatDropdown, setShowNewCatDropdown] = useState<boolean>(false);

  useEffect(() => {
    setItems(pendingTransactions);
  }, [pendingTransactions]);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [openCategoryDropdownId, setOpenCategoryDropdownId] = useState<
    string | null
  >(null);

  const handleUpdateItem = (
    id: string,
    partial: Partial<TransactionItem>
  ) => {
    setErrorMsg(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const handleAmountChange = (
    id: string,
    rawVal: string,
    currentAmount: number,
    category: TransactionCategoryType
  ) => {
    const isPositive =
      rawVal.trim().startsWith('+') ||
      category === 'Income' ||
      (currentAmount > 0 && !rawVal.trim().startsWith('-'));
    const digits = rawVal.replace(/[^\d]/g, '');
    const num = Number(digits) || 0;
    handleUpdateItem(id, { amount: isPositive ? num : -num });
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmNewTransaction = () => {
    setErrorMsg(null);
    const cleanTitle = newTitle.trim();
    const numericAmount =
      Number(newAmountInput.replace(/[^\d]/g, '')) || 0;

    if (!cleanTitle) {
      setErrorMsg('Please enter a transaction name.');
      return;
    }
    if (numericAmount <= 0) {
      setErrorMsg('Please enter a valid transaction amount.');
      return;
    }

    const nowStr =
      new Date().toLocaleDateString('en-GB') +
      ' - ' +
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

    const signedAmount =
      newCategory === 'Income' ? numericAmount : -numericAmount;

    const createdItem: TransactionItem = {
      id: `tx_manual_${Date.now()}`,
      walletId: targetWalletId,
      title: cleanTitle,
      category: newCategory,
      amount: signedAmount,
      date: nowStr,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [...prev, createdItem]);
    setNewTitle('');
    setNewAmountInput('');
    setNewCategory('FnB');
    setShowNewCatDropdown(false);
    setShowNewInputRow(false);
  };

  const handleGoAddWallet = () => {
    setPendingTransactions(items);
    setCurrentScreen('add-wallet');
  };

  const handleSaveAll = () => {
    setErrorMsg(null);
    if (wallets.length === 0 || !selectedWallet) {
      setErrorMsg('Please add a wallet card first before saving a transaction.');
      return;
    }

    const activeId = selectedWallet.id;

    // If the user typed into the new input row and pressed Save directly, include it
    let finalItems = [...items];
    if (showNewInputRow && newTitle.trim()) {
      const numericAmount =
        Number(newAmountInput.replace(/[^\d]/g, '')) || 0;
      if (numericAmount > 0) {
        const nowStr =
          new Date().toLocaleDateString('en-GB') +
          ' - ' +
          new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
        finalItems = [
          ...finalItems,
          {
            id: `tx_manual_${Date.now()}`,
            walletId: activeId,
            title: newTitle.trim(),
            category: newCategory,
            amount: newCategory === 'Income' ? numericAmount : -numericAmount,
            date: nowStr,
            createdAt: new Date().toISOString(),
          },
        ];
      }
    }

    if (finalItems.length === 0) {
      setErrorMsg('Please add at least one transaction item before saving.');
      return;
    }

    savePendingTransactionsToWallet(activeId, finalItems);
    setCurrentScreen('transaction-saved');
  };

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Top Bar */}
        <div className="px-6 pt-2 pb-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen('upload-bill')}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <span className="text-[11px] font-medium text-slate-400">
            Upload Your Screenshots.
          </span>

          <div className="w-7" />
        </div>

        {/* Title */}
        <div className="text-center pt-1 pb-3">
          <h1 className="text-[14.5px] font-bold text-slate-800">
            Transactions
          </h1>
        </div>

        {/* Wallets Horizontal Selector (Shows ONLY real user wallets, or empty state if 0) */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Select Wallet Card
            </span>
            {selectedWallet && (
              <span className="text-[10.5px] font-bold text-[#5E7858]">
                Selected: {selectedWallet.type} ({formatRupiah(selectedWallet.balance)})
              </span>
            )}
          </div>

          {wallets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#EBF1E8] text-[#5E7858] flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-bold text-slate-700">
                    No Wallet Added Yet
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug">
                    Add a wallet card first to save this transaction.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoAddWallet}
                className="px-3 py-1.5 rounded-full bg-[#738F6D] hover:bg-[#5E7858] text-white text-[10.5px] font-semibold flex items-center gap-1 shrink-0 shadow-xs transition-all"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add Wallet</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-0.5 px-0.5 mobile-scroll">
              {wallets.map((w) => {
                const isSelected = w.id === (selectedWallet?.id || targetWalletId);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setTargetWalletId(w.id);
                      setSelectedWalletId(w.id);
                    }}
                    style={getCardGradientStyle(w.color)}
                    className={`relative w-[144px] h-[86px] rounded-xl p-2.5 text-white shrink-0 flex flex-col justify-between text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#5E7858] scale-[1.02] shadow-md'
                        : 'opacity-65 hover:opacity-95'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <WalletProviderBranding
                          type={w.type}
                          providerCategory={w.providerCategory}
                          compact
                        />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#4ADE80] text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-[10.5px] font-extrabold text-white truncate">
                        {formatRupiah(w.balance)}
                      </div>
                      <div className="text-[8px] font-mono text-white/80 truncate">
                        {w.accountNumber}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Header & View/Edit Toggle */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-slate-700">
            Details
          </span>

          {items.length > 0 &&
            (!isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Edit Transactions"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  setOpenCategoryDropdownId(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#688264] text-white text-[10px] font-semibold shadow-xs"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Cancel</span>
              </button>
            ))}
        </div>

        {/* Transactions List */}
        <div className="px-6 space-y-2.5 pb-6">
          {items.length === 0 && !showNewInputRow && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 py-6 px-4 text-center">
              <p className="text-[12px] font-semibold text-slate-600">
                No Transaction Items Yet
              </p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Click the button below to input a new transaction or go back to
                scan a receipt with OCR.
              </p>
            </div>
          )}

          {items.map((item) => {
            const isCatOpen = openCategoryDropdownId === item.id;

            if (!isEditMode) {
              // VIEW MODE (Left screenshot of Page 10)
              return (
                <div
                  key={item.id}
                  onClick={() => setIsEditMode(true)}
                  className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)] cursor-pointer hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIconBadge category={item.category} size="md" />
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-slate-800 truncate">
                        {item.title}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {item.date}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-[11px] font-bold shrink-0 ${
                      item.amount < 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatTxCurrency(item.amount)}
                  </div>
                </div>
              );
            }

            // EDIT MODE (Middle screenshot of Page 10 + Frame 66 Category Dropdown)
            return (
              <div
                key={item.id}
                className="relative flex items-center gap-2"
              >
                {/* Left Delete Circle */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>

                {/* Editable Gray Card */}
                <div className="flex-1 rounded-xl bg-[#EFEFEF] border border-slate-300/80 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Clickable Category Badge -> Opens Frame 66 Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCategoryDropdownId(
                            isCatOpen ? null : item.id
                          )
                        }
                        className="relative ring-2 ring-white rounded-xl hover:scale-105 transition-transform"
                        title="Change Category"
                      >
                        <CategoryIconBadge category={item.category} size="sm" />
                      </button>

                      {/* Frame 66 Category Dropdown (Right of Page 10) */}
                      {isCatOpen && (
                        <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 space-y-1">
                          {ALL_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                const newSign =
                                  cat === 'Income'
                                    ? Math.abs(item.amount)
                                    : -Math.abs(item.amount);
                                handleUpdateItem(item.id, {
                                  category: cat,
                                  amount: newSign,
                                });
                                setOpenCategoryDropdownId(null);
                              }}
                              className="w-full px-2 py-1.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left"
                            >
                              <div className="flex items-center gap-2">
                                <CategoryIconBadge category={cat} size="sm" />
                                <span className="text-[11.5px] font-semibold text-slate-700">
                                  {cat}
                                </span>
                              </div>
                              {item.category === cat && (
                                <Check className="w-3.5 h-3.5 text-[#5E7858]" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editable Title & Date */}
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={item.title}
                        placeholder="Transaction name..."
                        onChange={(e) =>
                          handleUpdateItem(item.id, { title: e.target.value })
                        }
                        className="w-full bg-white/80 px-2 py-0.5 rounded-md text-[11.5px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white"
                      />
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { date: e.target.value })
                        }
                        className="w-full bg-transparent px-1 mt-0.5 text-[8.5px] text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Editable Amount */}
                  <div className="flex flex-col items-end shrink-0">
                    <input
                      type="text"
                      value={formatEditableAmount(item.amount)}
                      placeholder="Rp 0"
                      onChange={(e) =>
                        handleAmountChange(
                          item.id,
                          e.target.value,
                          item.amount,
                          item.category
                        )
                      }
                      className={`w-24 text-right bg-white/80 px-2 py-1 rounded-md text-[10.5px] font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                        item.amount < 0 ? 'text-slate-700' : 'text-emerald-700'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Transaction Input Card (Appears only when clicking "+ Add Transaction Item") */}
          {showNewInputRow && (
            <div className="rounded-2xl bg-[#F3F7F1] border border-[#738F6D]/50 p-3 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#3B5236]">
                  New Transaction Input
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInputRow(false);
                    setShowNewCatDropdown(false);
                    setErrorMsg(null);
                  }}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Category Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNewCatDropdown(!showNewCatDropdown)}
                    className="ring-2 ring-white rounded-xl hover:scale-105 transition-transform"
                    title="Select Category"
                  >
                    <CategoryIconBadge category={newCategory} size="sm" />
                  </button>

                  {showNewCatDropdown && (
                    <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 space-y-1">
                      {ALL_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setNewCategory(cat);
                            setShowNewCatDropdown(false);
                          }}
                          className="w-full px-2 py-1.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIconBadge category={cat} size="sm" />
                            <span className="text-[11.5px] font-semibold text-slate-700">
                              {cat}
                            </span>
                          </div>
                          {newCategory === cat && (
                            <Check className="w-3.5 h-3.5 text-[#5E7858]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Empty Title Input */}
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setErrorMsg(null);
                    setNewTitle(val);
                    if (val.trim().length >= 3) {
                      setNewCategory(inferCategoryFromText(val));
                    }
                  }}
                  placeholder="Transaction name (e.g. Coffee, BI-FAST, Monthly Fee)..."
                  className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-200 text-[11.5px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5E7858]"
                />
              </div>

              {/* Quick Fee Presets (Differentiated between Bank vs E-Money Wallets) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[9.5px] font-semibold text-slate-400 mr-0.5">
                  Quick Fee:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('BI-FAST Admin Fee');
                    setNewAmountInput('2500');
                    setNewCategory('Admin Fee');
                    setErrorMsg(null);
                  }}
                  className="px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[9.5px] font-semibold text-slate-600 transition-colors"
                >
                  + BI-FAST (Rp 2.500)
                </button>

                {isSelectedWalletBank ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitle('Interbank Admin Fee');
                        setNewAmountInput('6500');
                        setNewCategory('Admin Fee');
                        setErrorMsg(null);
                      }}
                      className="px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[9.5px] font-semibold text-slate-600 transition-colors"
                    >
                      + Bank Admin (Rp 6.500)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitle(
                          `${selectedWallet?.type || 'Bank'} Monthly Admin Fee`
                        );
                        setNewAmountInput('15000');
                        setNewCategory('Admin Fee');
                        setErrorMsg(null);
                      }}
                      className="px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[9.5px] font-semibold text-amber-800 transition-colors"
                    >
                      + Monthly Bank Fee (Rp 15.000)
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTitle('E-Wallet Top-Up Admin Fee');
                      setNewAmountInput('1000');
                      setNewCategory('Admin Fee');
                      setErrorMsg(null);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[9.5px] font-semibold text-slate-600 transition-colors"
                  >
                    + Top-Up Fee (Rp 1.000)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <span className="text-[11px] font-bold text-slate-500 absolute left-3 pointer-events-none">
                    {newCategory === 'Income' ? '+Rp' : '-Rp'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      newAmountInput
                        ? newAmountInput.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                        : ''
                    }
                    onChange={(e) => {
                      setErrorMsg(null);
                      setNewAmountInput(e.target.value.replace(/\D/g, ''));
                    }}
                    placeholder="Amount (e.g. 50.000)"
                    className="w-full h-9 pl-10 pr-3 rounded-xl bg-white border border-slate-200 text-[11.5px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5E7858]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmNewTransaction}
                  className="h-9 px-4 rounded-xl bg-[#738F6D] hover:bg-[#5E7858] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {!showNewInputRow && (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setShowNewInputRow(true);
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction Item</span>
            </button>
          )}

          {errorMsg && (
            <div className="text-center text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Save Button (Matching Page 10) */}
      <div className="py-5 flex justify-center border-t border-slate-100 bg-white sticky bottom-0 z-20">
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-8 py-2.5 rounded-full bg-[#5E7858] hover:bg-[#4E6648] active:scale-95 text-white text-[12.5px] font-bold shadow-md transition-all"
        >
          {selectedWallet ? `Save to ${selectedWallet.type}` : 'Save'}
        </button>
      </div>
    </div>
  );
};
