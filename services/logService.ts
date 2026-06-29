import { supabase } from '@/lib/supabase';
import { CompanionDailyLog } from '@/types/types';

const TABLE = 'companion_daily_log';

/**
 * Save (upsert) a daily log for the given client and date.
 * If a log already exists for that client+date, it updates it.
 */
export async function saveLog(
  clientId: string,
  logDate: string, // 'YYYY-MM-DD'
  checkedItemIds: string[],
  totalItems: number,
  notes?: string
): Promise<CompanionDailyLog | null> {
  const progressPercent = totalItems > 0
    ? Math.round((checkedItemIds.length / totalItems) * 10000) / 100
    : 0;

  console.log('[LogService] saveLog:', { clientId, logDate, checkedItemIds, totalItems, progressPercent });

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        client_id: clientId,
        log_date: logDate,
        checked_item_ids: checkedItemIds,
        progress_percent: progressPercent,
        total_items: totalItems,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id,log_date' }
    )
    .select()
    .single();

  if (error) {
    console.error('[LogService] saveLog error:', error);
    return null;
  }

  console.log('[LogService] saveLog success:', data?.id);
  return data as CompanionDailyLog;
}

/**
 * Load a single daily log for a client on a specific date.
 * Returns null if no log exists for that date.
 */
export async function loadLog(
  clientId: string,
  logDate: string // 'YYYY-MM-DD'
): Promise<CompanionDailyLog | null> {
  console.log('[LogService] loadLog:', { clientId, logDate });

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('client_id', clientId)
    .eq('log_date', logDate)
    .maybeSingle();

  if (error) {
    console.error('[LogService] loadLog error:', error);
    return null;
  }

  if (data) {
    console.log('[LogService] loadLog found:', data.id, 'items:', data.checked_item_ids?.length);
  } else {
    console.log('[LogService] loadLog: no log for this date');
  }

  return data as CompanionDailyLog | null;
}

/**
 * Load log history for the last N days for a client.
 * Useful for progress/streak calculations.
 */
export async function loadLogHistory(
  clientId: string,
  days: number = 30
): Promise<CompanionDailyLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  console.log('[LogService] loadLogHistory:', { clientId, days, startDateStr });

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('client_id', clientId)
    .gte('log_date', startDateStr)
    .order('log_date', { ascending: false });

  if (error) {
    console.error('[LogService] loadLogHistory error:', error);
    return [];
  }

  console.log('[LogService] loadLogHistory found:', data?.length, 'logs');
  return (data || []) as CompanionDailyLog[];
}
