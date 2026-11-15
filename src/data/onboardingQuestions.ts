export interface OnboardingOption {
  id: string;
  label: string;
  subtitle?: string;
  isOther?: boolean;
  placeholder?: string;
}

export interface OnboardingQuestion {
  id: string;
  stepNumber: number;
  category: string;
  question: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'prior_app_experience',
    stepNumber: 1,
    category: 'Experience',
    question: 'Have you ever used a similar financial tracking app?',
    subtitle: 'Help us tailor the app interface and guidance for you.',
    options: [
      {
        id: 'never',
        label: 'Never',
        subtitle: 'First time trying a personal finance tracking app',
      },
      {
        id: 'not_sure',
        label: 'Not Sure',
        subtitle: 'Tried one occasionally but never tracked consistently',
      },
      {
        id: 'yes_experienced',
        label: 'Yes, I Have',
        subtitle: 'Already familiar with using personal finance apps',
      },
    ],
  },
  {
    id: 'primary_purpose',
    stepNumber: 2,
    category: 'Primary Goal',
    question: 'What is your main goal in using this app?',
    subtitle: 'Choose the main focus you want to achieve with BANKERS.',
    options: [
      {
        id: 'saving',
        label: 'Saving Money',
        subtitle: 'Set aside income consistently every month',
      },
      {
        id: 'track_expenses',
        label: 'Tracking Expenses',
        subtitle: 'Monitor daily transactions & receipts with automatic OCR',
      },
      {
        id: 'manage_multi_wallets',
        label: 'Managing Multiple Accounts & E-Wallets',
        subtitle: 'Track Bank & E-Wallet balances in one unified dashboard',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Write your own primary financial goal',
        isOther: true,
        placeholder: 'e.g. Pay off installments & manage monthly budgets...',
      },
    ],
  },
  {
    id: 'financial_goal',
    stepNumber: 3,
    category: 'Financial Goal',
    question: 'Do you want to set a specific financial goal?',
    subtitle: 'Select the savings priority you want to track.',
    options: [
      {
        id: 'emergency_fund',
        label: 'Emergency Fund',
        subtitle: 'Build a safety net of 3–6x monthly expenses',
      },
      {
        id: 'vacation_travel',
        label: 'Travel & Dream Savings',
        subtitle: 'Save specifically for travel, gadgets, or personal rewards',
      },
      {
        id: 'long_term_investing',
        label: 'Investments & Financial Freedom',
        subtitle: 'Grow long-term assets, education, or housing funds',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Write a specific financial goal you want to achieve',
        isOther: true,
        placeholder: 'e.g. Buy a new laptop Rp 15,000,000 in 6 months...',
      },
    ],
  },
  {
    id: 'occupation_profile',
    stepNumber: 4,
    category: 'User Profile',
    question: 'What is your current primary occupation or activity?',
    subtitle: 'We customize budget allocation recommendations to fit your profile.',
    options: [
      {
        id: 'student',
        label: 'Student',
        subtitle: 'Managing allowance, tuition fees, and daily essentials',
      },
      {
        id: 'young_professional',
        label: 'Employee / Young Professional',
        subtitle: 'Managing monthly salary, recurring bills, and savings',
      },
      {
        id: 'freelancer_business',
        label: 'Freelancer / Entrepreneur',
        subtitle: 'Managing dynamic cash flow and business income',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Write your current occupation or role',
        isOther: true,
        placeholder: 'e.g. Homemaker / Content Creator / Business Owner...',
      },
    ],
  },
  {
    id: 'monthly_income_range',
    stepNumber: 5,
    category: 'Monthly Cash Flow',
    question: 'What is the monthly income or budget range you manage?',
    subtitle: 'Used to calibrate safe spending limits and savings targets.',
    options: [
      {
        id: 'under_3m',
        label: 'Under Rp 3,000,000',
        subtitle: 'Focus on daily expense efficiency and allowance tracking',
      },
      {
        id: '3m_to_7m',
        label: 'Rp 3,000,000 – Rp 7,500,000',
        subtitle: 'Balancing routine essentials, lifestyle, and emergency fund',
      },
      {
        id: '7m_to_15m',
        label: 'Rp 7,500,000 – Rp 15,000,000',
        subtitle: 'Optimizing savings allocation, investments & multi-wallets',
      },
      {
        id: 'above_15m',
        label: 'Above Rp 15,000,000',
        subtitle: 'Net worth portfolio management and asset planning',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Specify your exact monthly budget amount',
        isOther: true,
        placeholder: 'e.g. Rp 4,500,000 / month (variable)...',
      },
    ],
  },
  {
    id: 'active_accounts_count',
    stepNumber: 6,
    category: 'Banks & E-Wallets',
    question: 'How many Bank & E-Wallet accounts do you actively use?',
    subtitle: 'Includes BCA/blu, OCTO, Hana Bank, GoPay, DANA, ShopeePay, etc.',
    options: [
      {
        id: '1_2_accounts',
        label: '1 – 2 Accounts',
        subtitle: '1 primary bank account and 1 digital wallet',
      },
      {
        id: '3_4_accounts',
        label: '3 – 4 Accounts',
        subtitle: 'A mix of digital banks and daily e-wallets',
      },
      {
        id: '5_plus_accounts',
        label: '5 or More Accounts',
        subtitle: 'Active multi-bank & e-wallet user for promos and budgeting',
      },
    ],
  },
  {
    id: 'biggest_expense_category',
    stepNumber: 7,
    category: 'Spending Habits',
    question: 'Which category normally takes up your biggest spending?',
    subtitle: 'BANKERS AI Insight will monitor this category to prevent overspending.',
    options: [
      {
        id: 'food_drink',
        label: 'Food, Drinks & Coffee (FnB)',
        subtitle: 'Dining out, food delivery, and coffee runs',
      },
      {
        id: 'transport',
        label: 'Transportation & Commute',
        subtitle: 'Ride-hailing, fuel, parking, and travel tickets',
      },
      {
        id: 'shopping_lifestyle',
        label: 'Shopping & Entertainment',
        subtitle: 'E-commerce, fashion, hobbies, and streaming subscriptions',
      },
      {
        id: 'bills_routine',
        label: 'Recurring Bills & Housing',
        subtitle: 'Electricity, internet, rent, and monthly installments',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Write your other largest spending category',
        isOther: true,
        placeholder: 'e.g. Education / Healthcare / Hobbies...',
      },
    ],
  },
  {
    id: 'report_frequency',
    stepNumber: 8,
    category: 'Financial Reports',
    question: 'How often would you like to receive financial reports?',
    subtitle: 'We will send Cash Flow & AI Insight summaries on your schedule.',
    options: [
      {
        id: 'daily',
        label: 'Daily',
        subtitle: 'Transaction summary every evening at 8:00 PM',
      },
      {
        id: 'weekly',
        label: 'Weekly',
        subtitle: 'Spending review & Financial Health score every weekend',
      },
      {
        id: 'monthly',
        label: 'Monthly',
        subtitle: 'Complete net worth report & monthly breakdown',
      },
      {
        id: 'other',
        label: 'Other',
        subtitle: 'Write your preferred financial report schedule',
        isOther: true,
        placeholder: 'e.g. Every payday on the 25th of each month...',
      },
    ],
  },
];
