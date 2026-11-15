import Tesseract from 'tesseract.js';
import {
  TransactionItem,
  TransactionCategoryType,
} from '../context/BankersContext';

export interface SampleGalleryReceipt {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  previewType: 'mutation_list' | 'restaurant_bill' | 'ewallet_transfer' | 'utility_bill';
  extractedTransactions: Omit<TransactionItem, 'id' | 'walletId' | 'createdAt'>[];
}

export const SAMPLE_GALLERY_RECEIPTS: SampleGalleryReceipt[] = [
  {
    id: 'sample_pdf_mutations',
    title: 'E-Wallet Mutation History',
    subtitle: '6 Transactions (Company, Taxi, Clothes...)',
    badge: 'Bank/E-Wallet Statement',
    previewType: 'mutation_list',
    extractedTransactions: [
      {
        title: 'Company',
        category: 'FnB',
        amount: -230000,
        date: '12/07/2026 - 19:35',
      },
      {
        title: 'Company',
        category: 'Income',
        amount: 5550000,
        date: '12/07/2026 - 17:42',
      },
      {
        title: 'Taxi',
        category: 'Transportation',
        amount: -24000,
        date: '12/07/2026 - 14:42',
      },
      {
        title: 'Clothes Brand',
        category: 'Shopping',
        amount: -440000,
        date: '12/06/2026 - 15:36',
      },
      {
        title: 'Transfer',
        category: 'Transfer',
        amount: -50000,
        date: '12/06/2026 - 12:42',
      },
      {
        title: 'Electricity Bill',
        category: 'Bills',
        amount: -283000,
        date: '12/06/2026 - 08:30',
      },
    ],
  },
  {
    id: 'sample_restaurant_bill',
    title: 'Dine-In Restaurant Bill',
    subtitle: 'Manhattan Fish & Chips, Pastrami Melt (Rp 453.915)',
    badge: 'Restaurant Receipt',
    previewType: 'restaurant_bill',
    extractedTransactions: [
      {
        title: 'Manhattan Fish & Chips',
        category: 'FnB',
        amount: -72500,
        date: '11/07/2026 - 20:45',
      },
      {
        title: 'Pastrami Melt & Ice Tea',
        category: 'FnB',
        amount: -89000,
        date: '11/07/2026 - 20:45',
      },
      {
        title: 'Chicken Pesto & Steak Gravy',
        category: 'FnB',
        amount: -159000,
        date: '11/07/2026 - 20:45',
      },
      {
        title: 'Grilled Chicken Parmigiana + Tax',
        category: 'FnB',
        amount: -133415,
        date: '11/07/2026 - 20:45',
      },
    ],
  },
  {
    id: 'sample_gopay_topup',
    title: 'GoPay & Transport Receipt',
    subtitle: 'Top Up & GrabCar Ride (Rp 190.100)',
    badge: 'GoPay / Grab',
    previewType: 'ewallet_transfer',
    extractedTransactions: [
      {
        title: 'GoFood - Kopi Kenangan',
        category: 'FnB',
        amount: -45000,
        date: '13/07/2026 - 10:15',
      },
      {
        title: 'GrabCar Airport Transfer',
        category: 'Transportation',
        amount: -145100,
        date: '13/07/2026 - 08:30',
      },
    ],
  },
  {
    id: 'sample_pln_bill',
    title: 'PLN & Internet Bill',
    subtitle: 'Monthly Electricity & Wi-Fi Bill',
    badge: 'Recurring Bills',
    previewType: 'utility_bill',
    extractedTransactions: [
      {
        title: 'Electricity Bill (PLN Token)',
        category: 'Bills',
        amount: -283000,
        date: '12/06/2026 - 08:30',
      },
      {
        title: 'Home Fiber Internet',
        category: 'Bills',
        amount: -350000,
        date: '12/06/2026 - 08:35',
      },
    ],
  },
];

export const inferCategoryFromText = (text: string): TransactionCategoryType => {
  const lower = text.toLowerCase();
  if (
    /bi-fast|bifast|bi fast|admin fee|biaya admin|biaya administrasi|monthly fee|monthly bank|biaya bulanan|bank fee|biaya layanan|service fee|biaya transfer|top up fee|top-up fee|biaya top up|materai|bea materai|\badmin\b/.test(
      lower
    )
  ) {
    return 'Admin Fee';
  }
  if (
    /gaji|salary|income|pemasukan|terima|refund|cashback|bonus|deposit/.test(
      lower
    )
  ) {
    return 'Income';
  }
  if (
    /taxi|grab|gojek|goride|gocar|uber|bensin|pertamina|shell|parkir|tol|kereta|mrt|transjakarta|transport/.test(
      lower
    )
  ) {
    return 'Transportation';
  }
  if (
    /listrik|pln|electricity|air|pdam|internet|wifi|indihome|biznet|pulsa|telkomsel|tagihan|bill|bpjs/.test(
      lower
    )
  ) {
    return 'Bills';
  }
  if (/transfer|kirim|top up|topup|qris transfer|send|nominal/.test(lower)) {
    return 'Transfer';
  }
  if (
    /apotek|rs|hospital|klinik|halodoc|obat|vitamin|health|dokter|gym/.test(
      lower
    )
  ) {
    return 'Health';
  }
  if (
    /clothes|uniqlo|zara|shopee|tokopedia|lazada|mall|fashion|baju|sepatu|belanja/.test(
      lower
    )
  ) {
    return 'Shopping';
  }
  return 'FnB';
};

/**
 * Parses raw OCR text from Tesseract.js into structured TransactionItem objects.
 * Supports both printed itemized receipts and mobile banking / e-wallet screenshots
 * (BCA, Mandiri, blu, OCTO, GoPay, DANA, OVO, Grab, ShopeePay, QRIS), including
 * automatic extraction of BI-FAST, transfer admin fees, and monthly bank fees.
 */
export const parseRawOcrTextToTransactions = (
  rawText: string,
  fallbackFileName = 'Scanned Receipt'
): TransactionItem[] => {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const nowStr =
    new Date().toLocaleDateString('en-GB') +
    ' - ' +
    new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const itemLines: TransactionItem[] = [];
  const summaryLines: TransactionItem[] = [];

  const ignoreKeywords =
    /^(subtotal|sub total|change|kembalian|cash|tunai|card|visa|mastercard|thank you|terima kasih|table|server|cashier|date|time|pax|free|gratis|balance|saldo|no\.?\s*ref|ref|id transaksi|transaction id|status|berhasil|successful)$/i;

  const summaryKeywordRegex =
    /\b(grand total|total bayar|total pembayaran|total transaksi|total tagihan|total)\b/i;

  const transferAmountKeywordRegex = /\b(jumlah|nominal|amount|nominal transfer)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines that look like dates, times, reference numbers, or phone/account numbers
    if (
      /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(line) ||
      /\b\d{4}\s+\d{4}\s+\d{4}\b/.test(line) ||
      /\b08\d{2}[\s-]?\d{4}[\s-]?\d{3,4}\b/.test(line)
    ) {
      continue;
    }

    // Match Indonesian/international price patterns: e.g. Rp 2.500, Rp 15.000, Rp50.000,00, 72.500
    const priceMatch = line.match(
      /([+-]?\s*(?:Rp\.?|IDR)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|[+-]?\s*\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)/i
    );
    if (!priceMatch) continue;

    const rawPriceStr = priceMatch[1];
    const isPositive =
      rawPriceStr.includes('+') || /\b(income|gaji|masuk|cr|top\s*up\s*berhasil)\b/i.test(line);

    // Strip trailing decimal cents (.00 or ,00) before extracting integer Rupiah digits
    const withoutCents = rawPriceStr.replace(/[.,]\d{2}\s*$/, '');
    const digits = withoutCents.replace(/[^\d]/g, '');
    const numericVal = Number(digits);
    // Allow amounts starting from Rp 500 so admin fees (Rp 1.000, BI-FAST Rp 2.500, Rp 6.500, Monthly Bank Fee Rp 15.000) are captured
    if (!numericVal || numericVal < 500 || numericVal > 999999999) continue;

    // Extract title on the same line before/after the price
    let label = line
      .replace(rawPriceStr, '')
      .replace(/^[\d\s*xX•-]+/, '')
      .replace(/[:|-]+$/, '')
      .trim();

    const isSummaryLine = summaryKeywordRegex.test(label) || !label;
    const isAdminFeeLine =
      /bi-fast|bifast|bi fast|admin|biaya administrasi|monthly fee|biaya bulanan|biaya layanan|service fee|biaya transfer/i.test(
        line
      );

    // If the price was on its own line or labeled "Nominal"/"Total", look at nearby lines for merchant/recipient name (unless it's an Admin Fee line)
    if (
      !isAdminFeeLine &&
      (!label || summaryKeywordRegex.test(label) || transferAmountKeywordRegex.test(label))
    ) {
      for (const offset of [-1, -2, 1]) {
        const candidate = lines[i + offset];
        if (
          candidate &&
          candidate.length >= 3 &&
          !/\d{1,3}[.,]\d{3}/.test(candidate) &&
          !ignoreKeywords.test(candidate) &&
          !summaryKeywordRegex.test(candidate) &&
          !transferAmountKeywordRegex.test(candidate)
        ) {
          label = candidate.replace(/[:|-]+$/, '').trim();
          break;
        }
      }
    }

    if (!label || label.length < 2) {
      label = isAdminFeeLine
        ? 'Admin Fee'
        : fallbackFileName.replace(/\.[^.]+$/, '') || 'Scanned Transaction';
    }
    if (ignoreKeywords.test(label)) continue;

    const category: TransactionCategoryType = isPositive
      ? 'Income'
      : isAdminFeeLine
      ? 'Admin Fee'
      : inferCategoryFromText(`${label} ${line}`);
    const signedAmount =
      category === 'Income' ? Math.abs(numericVal) : -Math.abs(numericVal);

    const txItem: TransactionItem = {
      id: `ocr_${Date.now()}_${i}`,
      walletId: '',
      title: label.slice(0, 40),
      category,
      amount: signedAmount,
      date: nowStr,
      createdAt: new Date().toISOString(),
    };

    if (isSummaryLine && !isAdminFeeLine) {
      summaryLines.push(txItem);
    } else {
      itemLines.push(txItem);
    }
  }

  const extracted = itemLines.length > 0 ? itemLines : summaryLines;

  if (extracted.length === 0) {
    extracted.push({
      id: `ocr_${Date.now()}_0`,
      walletId: '',
      title: fallbackFileName.replace(/\.[^.]+$/, '') || 'Scanned Receipt',
      category: inferCategoryFromText(rawText),
      amount: 0,
      date: nowStr,
      createdAt: new Date().toISOString(),
    });
  }

  return extracted.slice(0, 10);
};

export const runTesseractOnFiles = async (
  files: File[],
  onProgress?: (progress: number, statusText: string) => void
): Promise<TransactionItem[]> => {
  const allItems: TransactionItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      Math.round((i / files.length) * 100),
      `Scanning ${file.name} (${i + 1}/${files.length})...`
    );

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            const overall = Math.round(
              ((i + m.progress) / files.length) * 100
            );
            onProgress?.(overall, `OCR Processing (${overall}%)...`);
          }
        },
      });

      const parsed = parseRawOcrTextToTransactions(
        result.data.text || '',
        file.name
      );
      allItems.push(...parsed);
    } catch (err) {
      console.warn('Tesseract OCR fallback on file:', err);
      allItems.push(...parseRawOcrTextToTransactions('', file.name));
    }
  }

  onProgress?.(100, 'Complete!');
  return allItems;
};
