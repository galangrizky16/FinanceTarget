// lib/finance/dailyTarget.ts

// Status hari berdasarkan perbandingan net (income - expense) vs target
export type DayStatus = "success" | "minus" | "over" | "pending";

export interface TargetPeriod {
  targetAmount: number; // total target periode, contoh: 3_000_000
  startDate: Date;
  endDate: Date;
}

export interface DayRecord {
  date: string;    // format: 'YYYY-MM-DD'
  income: number;  // total income hari itu
  expense: number; // total expense hari itu
}

export interface DayResult {
  date: string;
  baseTarget: number;       // target murni = targetAmount / jumlah hari
  carryMinus: number;       // sisa minus yang dibawa dari hari sebelumnya
  effectiveTarget: number;  // target aktual hari ini = baseTarget + carryMinus
  income: number;           // income hari itu (gross, untuk tampilan)
  expense: number;          // expense hari itu (untuk tampilan)
  net: number;              // income - expense (dasar kalkulasi)
  delta: number;            // net - effectiveTarget (negatif = kurang, positif = lebih)
  status: DayStatus;
}

export interface PeriodSummary {
  days: DayResult[];
  totalIncome: number;
  totalExpense: number;
  totalNet: number;          // totalIncome - totalExpense (dasar progress)
  totalTarget: number;       // sama dengan targetAmount
  percentage: number;        // progress net terhadap total target (%)
  remainingTarget: number;   // sisa yang harus dicapai sampai akhir periode
  currentCarryMinus: number; // carry minus aktif dari hari terakhir
}

// Bulatkan ke 2 desimal untuk menghindari floating point noise
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// Konversi Date ke string 'YYYY-MM-DD' tanpa timezone shift
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Hitung jumlah hari inklusif antara dua tanggal
function countDays(start: Date, end: Date): number {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

// Generate semua tanggal dalam periode sebagai array string
function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const endNormalized = new Date(end);
  endNormalized.setHours(0, 0, 0, 0);

  while (cursor <= endNormalized) {
    dates.push(toDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

/**
 * Hitung daily target, carry minus, dan status untuk seluruh periode.
 *
 * Kalkulasi berbasis NET (income - expense) per hari:
 *   MINUS   → net < effectiveTarget, selisih dibawa ke hari berikutnya
 *   SUCCESS → net = effectiveTarget, carry reset ke 0
 *   OVER    → net > effectiveTarget, carry reset ke 0
 *   PENDING → hari future tanpa data, carry tidak berubah
 */
export function calculateDailyTargets(
  period: TargetPeriod,
  records: DayRecord[],
  today: Date = new Date()
): PeriodSummary {
  const totalDays  = countDays(period.startDate, period.endDate);
  const baseTarget = round(period.targetAmount / totalDays);
  const todayStr   = toDateString(today);

  // Build map: date → { income, expense }
  const dayMap = new Map<string, { income: number; expense: number }>();
  for (const r of records) {
    dayMap.set(r.date, { income: r.income, expense: r.expense });
  }

  const days: DayResult[] = [];
  let carryMinus = 0;

  for (const date of generateDateRange(period.startDate, period.endDate)) {
    const isFuture = date > todayStr;
    const hasData  = dayMap.has(date);

    // Hari future tanpa data ditandai pending, carry tidak bergerak
    if (isFuture && !hasData) {
      days.push({
        date,
        baseTarget,
        carryMinus,
        effectiveTarget: round(baseTarget + carryMinus),
        income:  0,
        expense: 0,
        net:     0,
        delta:   0,
        status:  "pending",
      });
      continue;
    }

    const { income, expense } = dayMap.get(date) ?? { income: 0, expense: 0 };
    const net             = round(income - expense);
    const effectiveTarget = round(baseTarget + carryMinus);
    const delta           = round(net - effectiveTarget);

    let status: DayStatus;
    let nextCarry: number;

    if (delta > 0) {
      status    = "over";
      nextCarry = 0;
    } else if (delta === 0) {
      status    = "success";
      nextCarry = 0;
    } else {
      status    = "minus";
      nextCarry = round(carryMinus + Math.abs(delta));
    }

    days.push({ date, baseTarget, carryMinus, effectiveTarget, income, expense, net, delta, status });
    carryMinus = nextCarry;
  }

  const totalIncome  = round(records.reduce((s, r) => s + r.income,  0));
  const totalExpense = round(records.reduce((s, r) => s + r.expense, 0));
  const totalNet     = round(totalIncome - totalExpense);
  const percentage   = round(Math.max(0, (totalNet / period.targetAmount) * 100));
  const remainingTarget = round(Math.max(0, period.targetAmount - totalNet));

  const lastProcessed = [...days].reverse().find((d) => d.status !== "pending");
  const currentCarryMinus =
    lastProcessed?.status === "minus"
      ? round(Math.abs(lastProcessed.delta) + lastProcessed.carryMinus)
      : 0;

  return {
    days,
    totalIncome,
    totalExpense,
    totalNet,
    totalTarget: period.targetAmount,
    percentage,
    remainingTarget,
    currentCarryMinus,
  };
}

// Ambil result untuk satu tanggal tertentu
export function getDayResult(
  summary: PeriodSummary,
  date: string = toDateString(new Date())
): DayResult | undefined {
  return summary.days.find((d) => d.date === date);
}