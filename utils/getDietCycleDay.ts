import { DayPlan } from '@/types/types';

/**
 * Computes the current day index within a repeating diet cycle.
 *
 * The cycle starts on the day the plan was created and repeats every
 * `totalDays` days (i.e. however many DayPlans exist in the latest
 * diet plan version — typically 7, but could be fewer).
 *
 * @param planCreatedAt  ISO date string of when the SndPlan was created
 * @param targetDate     The date to compute the cycle day for (e.g. today,
 *                       or the date the user selected in the Log screen)
 * @param totalDays      Number of day plans available (dayPlans.length)
 * @returns              { index, label } where index is 0-based and label
 *                       is a human-readable string like "Day 3"
 */
export function getDietCycleDay(
  planCreatedAt: string | undefined,
  targetDate: Date,
  totalDays: number,
): { index: number; label: string } {
  if (!planCreatedAt || totalDays <= 0) {
    return { index: 0, label: 'Day 1' };
  }

  // Strip time components — we only care about calendar days
  const created = new Date(planCreatedAt);
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffMs = targetDay.getTime() - createdDay.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If the target date is before the plan was created, default to Day 1
  if (diffDays < 0) {
    return { index: 0, label: 'Day 1' };
  }

  const index = diffDays % totalDays;
  return { index, label: `Day ${index + 1}` };
}

/**
 * Convenience helper: given a full SndPlan and a target date, returns the
 * correct DayPlan for that date within the cycle.
 */
export function getDayPlanForDate(
  planCreatedAt: string | undefined,
  dayPlans: DayPlan[] | undefined,
  targetDate: Date,
): { dayPlan: DayPlan | null; cycleIndex: number; cycleLabel: string } {
  if (!dayPlans || dayPlans.length === 0) {
    return { dayPlan: null, cycleIndex: 0, cycleLabel: 'Day 1' };
  }

  const { index, label } = getDietCycleDay(planCreatedAt, targetDate, dayPlans.length);
  return {
    dayPlan: dayPlans[index] ?? dayPlans[0],
    cycleIndex: index,
    cycleLabel: label,
  };
}
