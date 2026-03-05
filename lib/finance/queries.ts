// lib/finance/queries.ts

import { supabase } from "@/lib/supabase/client";
import { calculateDailyTargets, DayRecord, PeriodSummary } from "./dailyTarget";

/**
 * Ambil semua data yang dibutuhkan untuk menghitung summary periode target.
 * Fetch income + expense secara paralel, build DayRecord dengan keduanya.
 */
export async function getPeriodSummary(
  targetId: string,
  userId: string
): Promise<PeriodSummary> {
  const target  = await fetchTarget(targetId, userId);
  const records = await fetchDayRecords(userId, target.start_date, target.end_date);

  return calculateDailyTargets(
    {
      targetAmount: target.target_amount,
      startDate: new Date(target.start_date),
      endDate:   new Date(target.end_date),
    },
    records
  );
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function fetchTarget(targetId: string, userId: string) {
  const { data, error } = await supabase
    .from("targets")
    .select("target_amount, start_date, end_date")
    .eq("id", targetId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Target tidak ditemukan");
  return data;
}

async function fetchDayRecords(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DayRecord[]> {
  // Fetch income dan expense secara paralel
  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("date, amount")
      .eq("user_id", userId)
      .eq("type", "income")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("transactions")
      .select("date, amount")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("date", startDate)
      .lte("date", endDate),
  ]);

  if (incomeRes.error)  throw new Error("Gagal mengambil data income");
  if (expenseRes.error) throw new Error("Gagal mengambil data expense");

  // Group income per tanggal
  const incomeMap = new Map<string, number>();
  for (const tx of incomeRes.data ?? []) {
    incomeMap.set(tx.date, (incomeMap.get(tx.date) ?? 0) + tx.amount);
  }

  // Group expense per tanggal
  const expenseMap = new Map<string, number>();
  for (const tx of expenseRes.data ?? []) {
    expenseMap.set(tx.date, (expenseMap.get(tx.date) ?? 0) + tx.amount);
  }

  // Merge: semua tanggal yang punya income ATAU expense
  const allDates = new Set([...incomeMap.keys(), ...expenseMap.keys()]);

  return Array.from(allDates, (date) => ({
    date,
    income:  incomeMap.get(date)  ?? 0,
    expense: expenseMap.get(date) ?? 0,
  }));
}