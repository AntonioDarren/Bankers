import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  getSupabaseClient,
  getActiveSupabaseConfig,
  saveRuntimeSupabaseConfig,
  clearRuntimeSupabaseConfig,
  getSupabaseProjectHost,
  SupabaseConfigData,
} from '../lib/supabase';

export type ScreenRoute =
  | 'signup'
  | 'onboarding'
  | 'signin'
  | 'home'
  | 'notifications'
  | 'profile'
  | 'my-profile'
  | 'wallet'
  | 'add-wallet'
  | 'history'
  | 'upload-bill'
  | 'edit-transactions'
  | 'transaction-saved';

export type WalletProviderType =
  | 'Gopay'
  | 'OCTO Mobile'
  | 'DANA'
  | 'blu'
  | 'Hana Bank'
  | 'ShopeePay Visa'
  | 'BCA'
  | 'Other Bank'
  | 'Other E-Money'
  | (string & {});

export type TransactionCategoryType =
  | 'FnB'
  | 'Transportation'
  | 'Income'
  | 'Health'
  | 'Shopping'
  | 'Transfer'
  | 'Bills'
  | 'Admin Fee';

export interface WalletCard {
  id: string;
  accountNumber: string;
  balance: number;
  type: WalletProviderType;
  providerCategory?: 'bank' | 'emoney';
  color: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  walletId: string;
  title: string;
  category: TransactionCategoryType;
  amount: number; // negative for expense, positive for income
  date: string; // e.g. "12/07/2026 - 19:35"
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  dayGroup: 'Today' | 'Yesterday';
  iconType: 'health' | 'coffee' | 'emergency' | 'transaction' | 'goal' | 'insight';
  unread?: boolean;
}

export interface FeedbackItem {
  id: string;
  userEmail: string;
  userName: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface SpendingCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  username: string;
  personaBadge: string;
  streakWeeks: number;
  photoURL?: string;
  bio: string;
  socialMedia: string;
  phoneNumber: string;
  fingerprintEnabled: boolean;
}

export interface UserFinancialData {
  financialHealthScore: number;
  financialHealthDelta: number;
  totalNetWorth: number;
  cashFlowMonthly: number;
  emergencyFundPercent: number;
  emergencyFundGoal: number;
  monthlySpendingTotal: number;
  spendingCategories: SpendingCategory[];
  coffeeSavingPotential: number;
  planAdjustDelta: number;
  timeLeftMonths: number;
  cashFlowHistory: { income: number[]; expense: number[] };
}

export interface StoredUserAccount {
  id: string;
  email: string;
  password?: string;
  authProvider: 'password' | 'google';
  createdAt: string;
  onboardingCompleted: boolean;
  onboardingAnswers: Record<string, string>;
  onboardingCustomAnswers?: Record<string, string>;
  profile: UserProfile;
  financialData: UserFinancialData;
  wallets: WalletCard[];
  transactions: TransactionItem[];
  notifications: NotificationItem[];
  feedbacks?: FeedbackItem[];
}

interface AuthResult {
  success: boolean;
  error?: string;
  needsFirebaseConfig?: boolean;
}

interface BankersContextType {
  currentScreen: ScreenRoute;
  setCurrentScreen: (screen: ScreenRoute) => void;
  accounts: StoredUserAccount[];
  currentAccount: StoredUserAccount | null;
  user: UserProfile;
  updateUser: (partial: Partial<UserProfile>) => void;
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  onboardingAnswers: Record<string, string>;
  onboardingCustomAnswers: Record<string, string>;
  selectOnboardingAnswer: (questionId: string, optionId: string) => void;
  setOnboardingCustomAnswer: (questionId: string, text: string) => void;
  isBalanceHidden: boolean;
  setIsBalanceHidden: React.Dispatch<React.SetStateAction<boolean>>;
  toggleBalanceHidden: () => void;
  financialHealthScore: number;
  financialHealthDelta: number;
  totalNetWorth: number;
  cashFlowMonthly: number;
  emergencyFundPercent: number;
  emergencyFundGoal: number;
  monthlySpendingTotal: number;
  spendingCategories: SpendingCategory[];
  coffeeSavingPotential: number;
  planAdjustDelta: number;
  timeLeftMonths: number;
  cashFlowHistory: { income: number[]; expense: number[] };
  wallets: WalletCard[];
  transactions: TransactionItem[];
  notifications: NotificationItem[];
  feedbacks: FeedbackItem[];
  submitUserFeedback: (
    message: string,
    rating?: number
  ) => Promise<{ success: boolean; error?: string }>;
  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;
  addWalletCard: (card: Omit<WalletCard, 'id' | 'createdAt'>) => WalletCard;
  updateWalletCard: (id: string, partial: Partial<Omit<WalletCard, 'id'>>) => void;
  deleteWalletCard: (id: string) => void;
  pendingTransactions: TransactionItem[];
  setPendingTransactions: React.Dispatch<React.SetStateAction<TransactionItem[]>>;
  savePendingTransactionsToWallet: (targetWalletId: string, items: TransactionItem[]) => void;
  loadSampleNotifications: () => void;
  loadSamplePdfDataIntoAccount: () => void;
  resetAccountToDefault: () => void;
  isSupabaseConnected: boolean;
  supabaseProjectName: string | null;
  showSupabaseModal: boolean;
  setShowSupabaseModal: React.Dispatch<React.SetStateAction<boolean>>;
  connectSupabaseConfig: (config: SupabaseConfigData) => void;
  disconnectSupabaseConfig: () => void;
  isAuthLoading: boolean;
  registerAccount: (email: string, password: string) => Promise<AuthResult>;
  loginAccount: (email: string, password: string) => Promise<AuthResult>;
  logoutAccount: () => Promise<void>;
  completeOnboardingAndGoHome: () => Promise<void>;
}

const ACCOUNTS_STORAGE_KEY = 'bankers_accounts_db_v2';
const ACTIVE_EMAIL_STORAGE_KEY = 'bankers_active_user_email_v2';
const PRIVACY_STORAGE_KEY = 'bankers_privacy_hidden_v2';
const SAMPLE_RESET_TOKEN_KEY = 'bankers_reset_pdf_sample_token_v1';
const PDF_SAMPLE_WALLET_IDS = new Set([
  'wal_gopay',
  'wal_hana',
  'wal_blu',
  'wal_octo',
  'wal_shopee',
]);
const PDF_SAMPLE_TX_IDS = new Set([
  'tx_1',
  'tx_2',
  'tx_3',
  'tx_4',
  'tx_5',
  'tx_6',
]);
const PDF_SAMPLE_NOTIF_IDS = new Set([
  'notif_1',
  'notif_2',
  'notif_3',
  'notif_4',
  'notif_5',
  'notif_6',
]);

export const CARD_COLOR_PRESETS = [
  { name: 'Ocean Blue', hex: '#135D78' },
  { name: 'Crimson Red', hex: '#7C1919' },
  { name: 'Emerald Teal', hex: '#0D6E5B' },
  { name: 'Sky Cyan', hex: '#1CA7B8' },
  { name: 'Charcoal Black', hex: '#1E242B' },
  { name: 'Sunset Orange', hex: '#B44118' },
];

export const createFreshCategories = (): SpendingCategory[] => [
  { name: 'Food & Drink', percentage: 0, amount: 0, color: '#4ADE80' },
  { name: 'Transport', percentage: 0, amount: 0, color: '#2DD4BF' },
  { name: 'Shopping', percentage: 0, amount: 0, color: '#38BDF8' },
  { name: 'Entertainment', percentage: 0, amount: 0, color: '#FBBF24' },
  { name: 'Others', percentage: 0, amount: 0, color: '#94A3B8' },
];

export const createFreshFinancialData = (): UserFinancialData => ({
  financialHealthScore: 0,
  financialHealthDelta: 0,
  totalNetWorth: 0,
  cashFlowMonthly: 0,
  emergencyFundPercent: 0,
  emergencyFundGoal: 0,
  monthlySpendingTotal: 0,
  spendingCategories: createFreshCategories(),
  coffeeSavingPotential: 0,
  planAdjustDelta: 0,
  timeLeftMonths: 0,
  cashFlowHistory: {
    income: [0, 0, 0, 0],
    expense: [0, 0, 0, 0],
  },
});

const EMPTY_PROFILE: UserProfile = {
  fullName: 'New User',
  email: '',
  username: '@user',
  personaBadge: 'New Starter',
  streakWeeks: 0,
  bio: 'Seize the day!',
  socialMedia: 'Add Now',
  phoneNumber: '-',
  fingerprintEnabled: true,
};

export const PDF_SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Financial Health Increased! 🎉',
    message:
      'Your score went up by 5 points compared to last week. Keep up the great habit!',
    time: '09:30',
    dayGroup: 'Today',
    iconType: 'health',
    unread: true,
  },
  {
    id: 'notif_2',
    title: 'Coffee Spending Increased',
    message:
      'This week you spent around Rp180,000 more on coffee compared to last week.',
    time: '08:15',
    dayGroup: 'Today',
    iconType: 'coffee',
    unread: true,
  },
  {
    id: 'notif_3',
    title: 'Emergency Fund Almost Reached!',
    message:
      'Your emergency fund has reached 72% of your target. Just a little more to go!',
    time: '07:45',
    dayGroup: 'Today',
    iconType: 'emergency',
  },
  {
    id: 'notif_4',
    title: 'New Transaction Detected',
    message: 'GoPay payment of Rp 45,000 has been recorded.',
    time: '07:20',
    dayGroup: 'Today',
    iconType: 'transaction',
  },
  {
    id: 'notif_5',
    title: 'Goal "Japan Trip" Is Getting Closer!',
    message:
      'Your score went up by 5 points compared to last week. Keep up the great habit!',
    time: 'Yesterday',
    dayGroup: 'Yesterday',
    iconType: 'goal',
  },
  {
    id: 'notif_6',
    title: 'Weekly Insight Is Ready!',
    message:
      'Your weekly financial report is ready. Check out your progress!',
    time: 'Yesterday',
    dayGroup: 'Yesterday',
    iconType: 'insight',
  },
];

/**
 * Always calculates financial metrics directly from the user's actual Wallets & Transactions
 * so Total Net Worth is 100% equal to the sum of all wallet card balances.
 */
export const calculateLiveFinancialData = (
  wallets: WalletCard[],
  transactions: TransactionItem[]
): UserFinancialData => {
  const totalNetWorth = wallets.reduce(
    (sum, w) => sum + (Number(w.balance) || 0),
    0
  );

  let totalIncome = 0;
  let totalExpense = 0;
  const catTotals: Record<string, number> = {
    'Food & Drink': 0,
    Transport: 0,
    Shopping: 0,
    Entertainment: 0,
    Others: 0,
  };

  for (const tx of transactions) {
    if (tx.amount >= 0 || tx.category === 'Income') {
      totalIncome += Math.abs(tx.amount);
    } else {
      const exp = Math.abs(tx.amount);
      totalExpense += exp;
      if (tx.category === 'FnB') catTotals['Food & Drink'] += exp;
      else if (tx.category === 'Transportation') catTotals['Transport'] += exp;
      else if (tx.category === 'Shopping') catTotals['Shopping'] += exp;
      else if (tx.category === 'Health') catTotals['Entertainment'] += exp;
      else catTotals['Others'] += exp;
    }
  }

  const hasWalletsOrTx = wallets.length > 0 || transactions.length > 0;

  // Cash flow: if there are transactions, use income - expense; otherwise if user only added wallet balances so far, show totalNetWorth as positive cash flow
  const cashFlowMonthly =
    transactions.length > 0 ? totalIncome - totalExpense : totalNetWorth;
  const monthlySpendingTotal = totalExpense;

  const fnbPct =
    totalExpense > 0
      ? Math.round((catTotals['Food & Drink'] / totalExpense) * 100)
      : 0;
  const transPct =
    totalExpense > 0
      ? Math.round((catTotals['Transport'] / totalExpense) * 100)
      : 0;
  const shopPct =
    totalExpense > 0
      ? Math.round((catTotals['Shopping'] / totalExpense) * 100)
      : 0;
  const entPct =
    totalExpense > 0
      ? Math.round((catTotals['Entertainment'] / totalExpense) * 100)
      : 0;
  const othersPct =
    totalExpense > 0
      ? Math.max(0, 100 - (fnbPct + transPct + shopPct + entPct))
      : 0;

  const spendingCategories: SpendingCategory[] = [
    {
      name: 'Food & Drink',
      amount: catTotals['Food & Drink'],
      percentage: fnbPct,
      color: '#4ADE80',
    },
    {
      name: 'Transport',
      amount: catTotals['Transport'],
      percentage: transPct,
      color: '#2DD4BF',
    },
    {
      name: 'Shopping',
      amount: catTotals['Shopping'],
      percentage: shopPct,
      color: '#38BDF8',
    },
    {
      name: 'Entertainment',
      amount: catTotals['Entertainment'],
      percentage: entPct,
      color: '#FBBF24',
    },
    {
      name: 'Others',
      amount: catTotals['Others'],
      percentage: othersPct,
      color: '#94A3B8',
    },
  ];

  const emergencyFundGoal = hasWalletsOrTx ? 10000000 : 0;
  const emergencyFundPercent =
    emergencyFundGoal > 0
      ? Math.min(100, Math.round((totalNetWorth / emergencyFundGoal) * 100))
      : 0;

  let financialHealthScore = 0;
  if (hasWalletsOrTx) {
    const baseScore = 65;
    const netWorthBonus = Math.min(20, Math.round(totalNetWorth / 500000));
    const cashFlowBonus = cashFlowMonthly >= 0 ? 7 : -5;
    financialHealthScore = Math.max(
      15,
      Math.min(98, baseScore + netWorthBonus + cashFlowBonus)
    );
  }

  const coffeeSavingPotential =
    catTotals['Food & Drink'] > 0
      ? Math.round(catTotals['Food & Drink'] * 0.25)
      : 0;

  return {
    financialHealthScore,
    financialHealthDelta: hasWalletsOrTx ? 5 : 0,
    totalNetWorth,
    cashFlowMonthly: hasWalletsOrTx ? cashFlowMonthly : 0,
    emergencyFundPercent,
    emergencyFundGoal,
    monthlySpendingTotal,
    spendingCategories,
    coffeeSavingPotential,
    planAdjustDelta: totalExpense > 0 ? -Math.round(totalExpense * 0.25) : 0,
    timeLeftMonths: hasWalletsOrTx ? 5 : 0,
    cashFlowHistory: {
      income: [0, 0, 0, totalIncome || totalNetWorth],
      expense: [0, 0, 0, totalExpense],
    },
  };
};

const BankersContext = createContext<BankersContextType | undefined>(undefined);

const normalizeNotificationsToEnglish = (
  notifs: NotificationItem[]
): NotificationItem[] =>
  (notifs || []).map((n) => {
    const sampleMatch = PDF_SAMPLE_NOTIFICATIONS.find((s) => s.id === n.id);
    if (sampleMatch) {
      return { ...sampleMatch, unread: n.unread };
    }
    return {
      ...n,
      title: n.title
        .replace('Ditambahkan!', 'Added!')
        .replace('Transaksi Baru Terdeteksi', 'New Transaction Detected'),
      message: n.message
        .replace(/^Kartu /, 'Card ')
        .replace(' dengan saldo awal ', ' with an initial balance of ')
        .replace(' berhasil disimpan.', ' has been saved.')
        .replace(' transaksi (', ' transaction(s) (')
        .replace(') senilai ', ') totaling ')
        .replace(' berhasil dicatat.', ' have been recorded.'),
    };
  });

export const BankersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [supabaseConfig, setSupabaseConfig] =
    useState<SupabaseConfigData | null>(() => getActiveSupabaseConfig());
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [draftCustomAnswers, setDraftCustomAnswers] = useState<
    Record<string, string>
  >({});

  const [accounts, setAccounts] = useState<StoredUserAccount[]>(() => {
    try {
      const shouldStripSample =
        localStorage.getItem(SAMPLE_RESET_TOKEN_KEY) !== 'done_v1';
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map((acc: StoredUserAccount) => {
            const rawWallets = acc.wallets || [];
            const rawTx = acc.transactions || [];
            const rawNotifs = acc.notifications || [];

            const w = shouldStripSample
              ? rawWallets.filter((item) => !PDF_SAMPLE_WALLET_IDS.has(item.id))
              : rawWallets;
            const t = shouldStripSample
              ? rawTx.filter((item) => !PDF_SAMPLE_TX_IDS.has(item.id))
              : rawTx;
            const n = shouldStripSample
              ? rawNotifs.filter((item) => !PDF_SAMPLE_NOTIF_IDS.has(item.id))
              : rawNotifs;

            return {
              ...acc,
              wallets: w,
              transactions: t,
              notifications: normalizeNotificationsToEnglish(n),
              financialData: calculateLiveFinancialData(w, t),
              profile: {
                ...EMPTY_PROFILE,
                ...acc.profile,
                streakWeeks:
                  shouldStripSample && w.length === 0 && t.length === 0
                    ? 0
                    : acc.profile?.streakWeeks || 0,
              },
            };
          });
          if (shouldStripSample) {
            localStorage.setItem(SAMPLE_RESET_TOKEN_KEY, 'done_v1');
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      // Ignore parse error
    }
    return [];
  });

  const [activeEmail, setActiveEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_EMAIL_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenRoute>('signup');
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<
    TransactionItem[]
  >([]);

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PRIVACY_STORAGE_KEY);
      return saved ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore write error
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (activeEmail) {
        localStorage.setItem(ACTIVE_EMAIL_STORAGE_KEY, activeEmail);
      } else {
        localStorage.removeItem(ACTIVE_EMAIL_STORAGE_KEY);
      }
    } catch {
      // Ignore write error
    }
  }, [activeEmail]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(isBalanceHidden));
    } catch {
      // Ignore write error
    }
  }, [isBalanceHidden]);

  const currentAccount =
    accounts.find(
      (acc) => acc.email.toLowerCase() === (activeEmail || '').toLowerCase()
    ) || null;

  const user: UserProfile = currentAccount
    ? { ...EMPTY_PROFILE, ...currentAccount.profile }
    : EMPTY_PROFILE;
  const onboardingAnswers: Record<string, string> = currentAccount
    ? currentAccount.onboardingAnswers
    : draftAnswers;
  const onboardingCustomAnswers: Record<string, string> = currentAccount
    ? currentAccount.onboardingCustomAnswers || {}
    : draftCustomAnswers;
  const wallets: WalletCard[] = currentAccount
    ? currentAccount.wallets || []
    : [];
  const transactions: TransactionItem[] = currentAccount
    ? currentAccount.transactions || []
    : [];
  const notifications: NotificationItem[] = currentAccount
    ? currentAccount.notifications || []
    : [];
  const feedbacks: FeedbackItem[] = currentAccount
    ? currentAccount.feedbacks || []
    : [];

  // Always derive financialData live from wallets & transactions so Net Worth === Sum of Cards
  const financialData: UserFinancialData = useMemo(
    () => calculateLiveFinancialData(wallets, transactions),
    [wallets, transactions]
  );

  const upsertLocalAccount = (account: StoredUserAccount) => {
    setAccounts((prev) => {
      const idx = prev.findIndex(
        (a) => a.email.toLowerCase() === account.email.toLowerCase()
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = account;
        return updated;
      }
      return [...prev, account];
    });
  };

  const syncAccountToFirestore = async (account: StoredUserAccount) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('bankers_users').upsert(
        {
          id: account.id,
          email: account.email.toLowerCase(),
          onboarding_completed: account.onboardingCompleted,
          onboarding_answers: account.onboardingAnswers || {},
          onboarding_custom_answers: account.onboardingCustomAnswers || {},
          profile: account.profile,
          wallets: account.wallets || [],
          transactions: account.transactions || [],
          notifications: account.notifications || [],
          feedbacks: account.feedbacks || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  };

  const connectSupabaseConfig = (config: SupabaseConfigData) => {
    saveRuntimeSupabaseConfig(config);
    setSupabaseConfig(config);
    getSupabaseClient();
  };

  const disconnectSupabaseConfig = () => {
    clearRuntimeSupabaseConfig();
    setSupabaseConfig(getActiveSupabaseConfig());
  };

  const registerAccount = async (
    rawEmail: string,
    password: string
  ): Promise<AuthResult> => {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Credentials cannot be empty.' };
    }
    if (!cleanEmail.includes('@') || password.length < 6) {
      return {
        success: false,
        error: 'Invalid credentials.',
      };
    }

    setIsAuthLoading(true);
    try {
      const localPart = cleanEmail.split('@')[0] || 'User';
      const derivedName = localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const supabase = getSupabaseClient();
      let uid = `usr_${Date.now()}`;

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) {
          return {
            success: false,
            error: 'Invalid credentials.',
          };
        }
        if (data?.user?.id) {
          uid = data.user.id;
        }
      } else {
        const exists = accounts.some(
          (acc) => acc.email.toLowerCase() === cleanEmail
        );
        if (exists) {
          return {
            success: false,
            error: 'Invalid credentials.',
          };
        }
      }

      const newAccount: StoredUserAccount = {
        id: uid,
        email: cleanEmail,
        password: supabase ? undefined : password,
        authProvider: 'password',
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        onboardingAnswers: {},
        onboardingCustomAnswers: {},
        profile: {
          fullName: derivedName,
          email: cleanEmail,
          username: `@${localPart.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
          personaBadge: 'New Starter',
          streakWeeks: 0,
          bio: 'Seize the day!',
          socialMedia: 'Add Now',
          phoneNumber: '+628127372****',
          fingerprintEnabled: true,
        },
        financialData: createFreshFinancialData(),
        wallets: [],
        transactions: [],
        notifications: [],
      };

      setDraftAnswers({});
      setDraftCustomAnswers({});
      setSelectedWalletId(null);
      upsertLocalAccount(newAccount);
      if (supabase) {
        await syncAccountToFirestore(newAccount);
      }

      setActiveEmail(cleanEmail);
      setOnboardingStep(0);
      setCurrentScreen('onboarding');
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Invalid credentials.',
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginAccount = async (
    rawEmail: string,
    password: string
  ): Promise<AuthResult> => {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Credentials cannot be empty.' };
    }

    setIsAuthLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error || !data.user) {
          return {
            success: false,
            error: 'Invalid credentials.',
          };
        }
        const uid = data.user.id;

        const { data: rowData } = await supabase
          .from('bankers_users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        let accountData: StoredUserAccount;

        if (rowData) {
          const w = (rowData.wallets as WalletCard[]) || [];
          const t = (rowData.transactions as TransactionItem[]) || [];
          accountData = {
            id: rowData.id || uid,
            email: cleanEmail,
            authProvider: 'password',
            createdAt: rowData.created_at || new Date().toISOString(),
            onboardingCompleted: Boolean(rowData.onboarding_completed),
            onboardingAnswers:
              (rowData.onboarding_answers as Record<string, string>) || {},
            onboardingCustomAnswers:
              (rowData.onboarding_custom_answers as Record<string, string>) ||
              {},
            wallets: w,
            transactions: t,
            notifications: normalizeNotificationsToEnglish(
              (rowData.notifications as NotificationItem[]) || []
            ),
            feedbacks: (rowData.feedbacks as FeedbackItem[]) || [],
            financialData: calculateLiveFinancialData(w, t),
            profile: {
              ...EMPTY_PROFILE,
              ...(rowData.profile as Partial<UserProfile>),
            },
          };
        } else {
          const localPart = cleanEmail.split('@')[0] || 'User';
          const derivedName = localPart
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          accountData = {
            id: uid,
            email: cleanEmail,
            authProvider: 'password',
            createdAt: new Date().toISOString(),
            onboardingCompleted: true,
            onboardingAnswers: {},
            onboardingCustomAnswers: {},
            profile: {
              ...EMPTY_PROFILE,
              fullName: derivedName,
              email: cleanEmail,
              username: `@${localPart.toLowerCase()}`,
              personaBadge: 'Balanced Planner',
              streakWeeks: 0,
            },
            financialData: createFreshFinancialData(),
            wallets: [],
            transactions: [],
            notifications: [],
          };
          await syncAccountToFirestore(accountData);
        }

        upsertLocalAccount(accountData);
        setActiveEmail(cleanEmail);
        setSelectedWalletId(null);
        if (!accountData.onboardingCompleted) {
          setOnboardingStep(0);
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('home');
        }
        return { success: true };
      }

      const matched = accounts.find(
        (acc) => acc.email.toLowerCase() === cleanEmail
      );
      if (!matched || matched.password !== password) {
        return {
          success: false,
          error: 'Invalid credentials.',
        };
      }

      setActiveEmail(matched.email);
      setSelectedWalletId(null);
      if (!matched.onboardingCompleted) {
        setOnboardingStep(0);
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('home');
      }
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Invalid credentials.',
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutAccount = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signOut error
      }
    }
    setActiveEmail(null);
    setSelectedWalletId(null);
    setOnboardingStep(0);
    setCurrentScreen('signin');
  };

  const ensureAccountOrCreateGuest = (): StoredUserAccount => {
    if (currentAccount) return currentAccount;
    const guestEmail = 'guest@bankers.app';
    const guest: StoredUserAccount = {
      id: `usr_guest`,
      email: guestEmail,
      authProvider: 'password',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      onboardingAnswers: draftAnswers,
      onboardingCustomAnswers: draftCustomAnswers,
      profile: {
        ...EMPTY_PROFILE,
        fullName: 'John Doe',
        email: guestEmail,
        username: '@john_doe',
        personaBadge: 'Balanced Planner',
        streakWeeks: 0,
      },
      financialData: createFreshFinancialData(),
      wallets: [],
      transactions: [],
      notifications: [],
    };
    upsertLocalAccount(guest);
    setActiveEmail(guestEmail);
    return guest;
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    const target = ensureAccountOrCreateGuest();
    const updated: StoredUserAccount = {
      ...target,
      profile: { ...target.profile, ...partial },
    };
    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
  };

  const selectOnboardingAnswer = (questionId: string, optionId: string) => {
    setDraftAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    if (currentAccount) {
      const updated: StoredUserAccount = {
        ...currentAccount,
        onboardingAnswers: {
          ...currentAccount.onboardingAnswers,
          [questionId]: optionId,
        },
      };
      upsertLocalAccount(updated);
      syncAccountToFirestore(updated);
    }
  };

  const setOnboardingCustomAnswer = (questionId: string, text: string) => {
    setDraftCustomAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));

    if (currentAccount) {
      const updated: StoredUserAccount = {
        ...currentAccount,
        onboardingCustomAnswers: {
          ...(currentAccount.onboardingCustomAnswers || {}),
          [questionId]: text,
        },
      };
      upsertLocalAccount(updated);
      syncAccountToFirestore(updated);
    }
  };

  const completeOnboardingAndGoHome = async () => {
    if (currentAccount) {
      const purpose = currentAccount.onboardingAnswers['primary_purpose'];
      const customPurpose =
        currentAccount.onboardingCustomAnswers?.['primary_purpose'];
      let badge = 'Balanced Planner';
      if (purpose === 'saving' || purpose === 'menabung')
        badge = 'Careful Saver';
      else if (
        purpose === 'track_expenses' ||
        purpose === 'melacak_pengeluaran'
      )
        badge = 'Smart Tracker';
      else if (
        purpose === 'manage_multi_wallets' ||
        purpose === 'kelola_multi_rekening'
      )
        badge = 'Multi-Wallet Planner';
      else if (
        (purpose === 'other' || purpose === 'lainnya') &&
        customPurpose?.trim()
      ) {
        badge = 'Custom Planner';
      }

      const updated: StoredUserAccount = {
        ...currentAccount,
        onboardingCompleted: true,
        profile: {
          ...currentAccount.profile,
          personaBadge: badge,
        },
      };
      upsertLocalAccount(updated);
      await syncAccountToFirestore(updated);
    }
    setCurrentScreen('home');
  };

  const addWalletCard = (
    cardInput: Omit<WalletCard, 'id' | 'createdAt'>
  ): WalletCard => {
    const target = ensureAccountOrCreateGuest();
    const newCard: WalletCard = {
      ...cardInput,
      id: `wal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const nextWallets = [...(target.wallets || []), newCard];
    const nextNotifs: NotificationItem[] = [
      {
        id: `notif_${Date.now()}`,
        title: `Wallet ${newCard.type} Added!`,
        message: `${newCard.type} card (${newCard.accountNumber}) with an initial balance of ${formatRupiah(
          newCard.balance
        )} has been saved.`,
        time: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        dayGroup: 'Today',
        iconType: 'transaction',
        unread: true,
      },
      ...(target.notifications || []),
    ];

    const nextFinancial = calculateLiveFinancialData(
      nextWallets,
      target.transactions || []
    );

    const updated: StoredUserAccount = {
      ...target,
      wallets: nextWallets,
      notifications: nextNotifs,
      financialData: nextFinancial,
    };

    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
    setSelectedWalletId(newCard.id);
    return newCard;
  };

  const updateWalletCard = (
    id: string,
    partial: Partial<Omit<WalletCard, 'id'>>
  ) => {
    if (!currentAccount) return;
    const nextWallets = (currentAccount.wallets || []).map((w) =>
      w.id === id ? { ...w, ...partial } : w
    );
    const nextFinancial = calculateLiveFinancialData(
      nextWallets,
      currentAccount.transactions || []
    );
    const updated: StoredUserAccount = {
      ...currentAccount,
      wallets: nextWallets,
      financialData: nextFinancial,
    };
    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
  };

  const deleteWalletCard = (id: string) => {
    if (!currentAccount) return;
    const nextWallets = (currentAccount.wallets || []).filter(
      (w) => w.id !== id
    );
    const nextTransactions = (currentAccount.transactions || []).filter(
      (t) => t.walletId !== id
    );
    const nextFinancial = calculateLiveFinancialData(
      nextWallets,
      nextTransactions
    );
    const updated: StoredUserAccount = {
      ...currentAccount,
      wallets: nextWallets,
      transactions: nextTransactions,
      financialData: nextFinancial,
    };
    if (selectedWalletId === id) {
      setSelectedWalletId(nextWallets[0]?.id || null);
    }
    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
  };

  const savePendingTransactionsToWallet = (
    targetWalletId: string,
    items: TransactionItem[]
  ) => {
    const target = ensureAccountOrCreateGuest();
    const currentWallets = [...(target.wallets || [])];
    if (currentWallets.length === 0) return;

    const validTargetWallet =
      currentWallets.find((w) => w.id === targetWalletId) || currentWallets[0];
    const resolvedWalletId = validTargetWallet.id;

    const stampedItems = items.map((item) => ({
      ...item,
      walletId: resolvedWalletId,
    }));

    const netDelta = stampedItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const nextWallets = currentWallets.map((w) =>
      w.id === resolvedWalletId
        ? {
            ...w,
            balance: Math.max(0, (Number(w.balance) || 0) + netDelta),
          }
        : w
    );

    const nextTransactions = [
      ...stampedItems,
      ...(target.transactions || []),
    ];

    const targetWallet = nextWallets.find((w) => w.id === resolvedWalletId);
    const totalSavedAmount = stampedItems.reduce(
      (sum, i) => sum + Math.abs(i.amount),
      0
    );

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'New Transaction Detected',
      message: `${stampedItems.length} transaction(s) (${
        targetWallet?.type || 'Wallet'
      }) totaling ${formatRupiah(totalSavedAmount)} have been recorded.`,
      time: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      dayGroup: 'Today',
      iconType: 'transaction',
      unread: true,
    };

    const nextNotifications = [newNotif, ...(target.notifications || [])];
    const nextFinancial = calculateLiveFinancialData(
      nextWallets,
      nextTransactions
    );

    const updated: StoredUserAccount = {
      ...target,
      wallets: nextWallets,
      transactions: nextTransactions,
      notifications: nextNotifications,
      financialData: nextFinancial,
      profile: {
        ...target.profile,
        streakWeeks: Math.max(1, target.profile.streakWeeks),
      },
    };

    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
    setSelectedWalletId(resolvedWalletId);
    setPendingTransactions([]);
  };

  const loadSampleNotifications = () => {
    const target = ensureAccountOrCreateGuest();
    const updated: StoredUserAccount = {
      ...target,
      notifications: PDF_SAMPLE_NOTIFICATIONS,
    };
    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
  };

  const loadSamplePdfDataIntoAccount = () => {
    const target = ensureAccountOrCreateGuest();
    const sampleWallets: WalletCard[] = [
      {
        id: 'wal_gopay',
        accountNumber: '0812 5887 7807',
        balance: 500620,
        type: 'Gopay',
        color: '#135D78',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wal_hana',
        accountNumber: '0812 5887 7807',
        balance: 500620,
        type: 'Hana Bank',
        color: '#0D6E5B',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wal_blu',
        accountNumber: '0812 5887 7807',
        balance: 500620,
        type: 'blu',
        color: '#1CA7B8',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wal_octo',
        accountNumber: '0812 5887 7807',
        balance: 500620,
        type: 'OCTO Mobile',
        color: '#7C1919',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wal_shopee',
        accountNumber: '0812 5887 7807',
        balance: 500620,
        type: 'ShopeePay Visa',
        color: '#1E242B',
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleTransactions: TransactionItem[] = [
      {
        id: 'tx_1',
        walletId: 'wal_gopay',
        title: 'Company',
        category: 'FnB',
        amount: -230000,
        date: '12/07/2026 - 19:35',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        walletId: 'wal_gopay',
        title: 'Company',
        category: 'Income',
        amount: 5550000,
        date: '12/07/2026 - 17:42',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_3',
        walletId: 'wal_gopay',
        title: 'Taxi',
        category: 'Transportation',
        amount: -24000,
        date: '12/07/2026 - 14:42',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_4',
        walletId: 'wal_gopay',
        title: 'Clothes Brand',
        category: 'Shopping',
        amount: -440000,
        date: '12/06/2026 - 15:36',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_5',
        walletId: 'wal_gopay',
        title: 'Transfer',
        category: 'Transfer',
        amount: -50000,
        date: '12/06/2026 - 12:42',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_6',
        walletId: 'wal_gopay',
        title: 'Electricity Bill',
        category: 'Bills',
        amount: -283000,
        date: '12/06/2026 - 08:30',
        createdAt: new Date().toISOString(),
      },
    ];

    const liveFinancialData = calculateLiveFinancialData(
      sampleWallets,
      sampleTransactions
    );

    const updated: StoredUserAccount = {
      ...target,
      profile: {
        ...target.profile,
        streakWeeks: 8,
        personaBadge: 'Balanced Planner',
      },
      wallets: sampleWallets,
      transactions: sampleTransactions,
      notifications: PDF_SAMPLE_NOTIFICATIONS,
      financialData: liveFinancialData,
    };

    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
    setSelectedWalletId('wal_gopay');
  };

  const resetAccountToDefault = () => {
    const target = ensureAccountOrCreateGuest();
    const updated: StoredUserAccount = {
      ...target,
      profile: {
        ...target.profile,
        streakWeeks: 0,
      },
      wallets: [],
      transactions: [],
      notifications: [],
      financialData: createFreshFinancialData(),
    };
    upsertLocalAccount(updated);
    syncAccountToFirestore(updated);
    setSelectedWalletId(null);
    setPendingTransactions([]);
  };

  const submitUserFeedback = async (
    message: string,
    rating = 5
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = message.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter your feedback before submitting.' };
    }

    const target = ensureAccountOrCreateGuest();
    const newFeedback: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userEmail: target.email,
      userName: target.profile.fullName || 'Anonymous User',
      rating,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextFeedbacks = [newFeedback, ...(target.feedbacks || [])];
    const updated: StoredUserAccount = {
      ...target,
      feedbacks: nextFeedbacks,
    };

    upsertLocalAccount(updated);
    await syncAccountToFirestore(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('bankers_feedback').insert({
          id: newFeedback.id,
          user_email: newFeedback.userEmail,
          user_name: newFeedback.userName,
          rating: newFeedback.rating,
          message: newFeedback.message,
          created_at: newFeedback.createdAt,
        });
      } catch (err) {
        console.warn('Supabase feedback table insert warning:', err);
      }
    }

    return { success: true };
  };

  // One-time cleanup on hot-reload or mount if PDF sample cards are currently loaded
  useEffect(() => {
    try {
      if (localStorage.getItem('bankers_hmr_sample_cleanup_v2') !== 'done') {
        localStorage.setItem('bankers_hmr_sample_cleanup_v2', 'done');
        setAccounts((prev) =>
          prev.map((acc) => {
            const w = (acc.wallets || []).filter(
              (item) => !PDF_SAMPLE_WALLET_IDS.has(item.id)
            );
            const t = (acc.transactions || []).filter(
              (item) => !PDF_SAMPLE_TX_IDS.has(item.id)
            );
            const n = (acc.notifications || []).filter(
              (item) => !PDF_SAMPLE_NOTIF_IDS.has(item.id)
            );
            return {
              ...acc,
              wallets: w,
              transactions: t,
              notifications: normalizeNotificationsToEnglish(n),
              financialData: calculateLiveFinancialData(w, t),
              profile: {
                ...EMPTY_PROFILE,
                ...acc.profile,
                streakWeeks:
                  w.length === 0 && t.length === 0
                    ? 0
                    : acc.profile?.streakWeeks || 0,
              },
            };
          })
        );
        setSelectedWalletId(null);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const toggleBalanceHidden = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  return (
    <BankersContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        accounts,
        currentAccount,
        user,
        updateUser,
        onboardingStep,
        setOnboardingStep,
        onboardingAnswers,
        onboardingCustomAnswers,
        selectOnboardingAnswer,
        setOnboardingCustomAnswer,
        isBalanceHidden,
        setIsBalanceHidden,
        toggleBalanceHidden,
        financialHealthScore: financialData.financialHealthScore,
        financialHealthDelta: financialData.financialHealthDelta,
        totalNetWorth: financialData.totalNetWorth,
        cashFlowMonthly: financialData.cashFlowMonthly,
        emergencyFundPercent: financialData.emergencyFundPercent,
        emergencyFundGoal: financialData.emergencyFundGoal,
        monthlySpendingTotal: financialData.monthlySpendingTotal,
        spendingCategories: financialData.spendingCategories,
        coffeeSavingPotential: financialData.coffeeSavingPotential,
        planAdjustDelta: financialData.planAdjustDelta,
        timeLeftMonths: financialData.timeLeftMonths,
        cashFlowHistory: financialData.cashFlowHistory,
        wallets,
        transactions,
        notifications,
        feedbacks,
        submitUserFeedback,
        selectedWalletId,
        setSelectedWalletId,
        addWalletCard,
        updateWalletCard,
        deleteWalletCard,
        pendingTransactions,
        setPendingTransactions,
        savePendingTransactionsToWallet,
        loadSampleNotifications,
        loadSamplePdfDataIntoAccount,
        resetAccountToDefault,
        isSupabaseConnected: Boolean(supabaseConfig),
        supabaseProjectName: getSupabaseProjectHost(supabaseConfig),
        showSupabaseModal,
        setShowSupabaseModal,
        connectSupabaseConfig,
        disconnectSupabaseConfig,
        isAuthLoading,
        registerAccount,
        loginAccount,
        logoutAccount,
        completeOnboardingAndGoHome,
      }}
    >
      {children}
    </BankersContext.Provider>
  );
};

export const useBankers = () => {
  const ctx = useContext(BankersContext);
  if (!ctx) {
    throw new Error('useBankers must be used within a BankersProvider');
  }
  return ctx;
};

export const formatRupiah = (amount: number): string => {
  const absFormatted = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${absFormatted}`;
};
