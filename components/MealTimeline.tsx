import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '@/components/Card';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Coffee, Utensils, Moon, Sun, Sunrise, Apple, Sunset, BedDouble, CheckCircle } from 'lucide-react-native';
import { DayPlan } from '@/types/types';

const MEAL_SLOTS = [
  { key: 'preMorning' as const, label: 'Pre Morning', icon: Sunrise, time: '06:30 AM' },
  { key: 'morning' as const, label: 'Morning', icon: Coffee, time: '08:00 AM' },
  { key: 'midMorning' as const, label: 'Mid Morning', icon: Apple, time: '11:00 AM' },
  { key: 'lunch' as const, label: 'Lunch', icon: Utensils, time: '01:30 PM' },
  { key: 'earlyEvening' as const, label: 'Early Evening', icon: Sunset, time: '05:00 PM' },
  { key: 'night' as const, label: 'Night', icon: Moon, time: '08:30 PM' },
  { key: 'bedtime' as const, label: 'Bedtime', icon: BedDouble, time: '10:00 PM' },
];

/**
 * Parse a meal value into displayable lines.
 * Handles both plain text (newline-separated) and potential comma-separated values.
 */
const parseMealItems = (value: string | null | undefined): string[] => {
  if (!value || value.trim() === '') return [];
  const lines = value.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return value.split(',').map((l) => l.trim()).filter(Boolean);
};

interface MealTimelineProps {
  dayPlan: DayPlan | null;
  readOnly?: boolean;
  isConsolidated?: boolean;
}

export default function MealTimeline({ dayPlan, readOnly = false, isConsolidated = false }: MealTimelineProps) {
  // Interactive state to check off meals eaten visually (even if read-only, checking off locally can feel nice, but we respect readOnly)
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});

  const toggleMealComplete = (key: string) => {
    if (readOnly) return;
    setCompletedMeals((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!dayPlan) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyTitle}>No Diet Plan Configured</Text>
        <Text style={styles.emptySubtitle}>
          Your personalized timeline will appear here once sync'd with your clinic practitioner.
        </Text>
      </Card>
    );
  }

  const hasAnyPlan = MEAL_SLOTS.some(slot => {
    const items = parseMealItems(dayPlan[slot.key as keyof DayPlan] as string);
    return items.length > 0;
  });

  if (!hasAnyPlan) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyTitle}>No Diet Plan Configured</Text>
        <Text style={styles.emptySubtitle}>
          Your personalized timeline will appear here once sync'd with your clinic practitioner.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      {isConsolidated && (
        <View style={styles.consolidatedTipWrapper}>
          <Text style={styles.consolidatedTip}>
            💡 Note: Select any one option for each meal from the list below.
          </Text>
        </View>
      )}
      {MEAL_SLOTS.map((slot, index) => {
        const Icon = slot.icon;
        const items = parseMealItems(dayPlan[slot.key as keyof DayPlan] as string);
        if (items.length === 0) return null;

        const isCompleted = !!completedMeals[slot.key];

        return (
          <View key={slot.key} style={styles.timelineRow}>
            {/* Vertical line and node */}
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, isCompleted && styles.timelineNodeComplete]}>
                {isCompleted ? (
                  <CheckCircle size={14} color="#FFFFFF" fill={colors.success} />
                ) : (
                  <View style={styles.timelineInnerDot} />
                )}
              </View>
              {index < MEAL_SLOTS.length - 1 && <View style={styles.timelineConnector} />}
            </View>

            {/* Meal details card */}
            <TouchableOpacity
              onPress={() => toggleMealComplete(slot.key)}
              activeOpacity={readOnly ? 1 : 0.9}
              style={styles.cardWrapper}
            >
              <Card
                variant={isCompleted ? 'glass' : 'elevated'}
                style={[styles.mealCard, isCompleted && styles.mealCardComplete]}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealMeta}>
                    <View style={styles.timeTag}>
                      <Text style={styles.timeText}>{slot.time}</Text>
                    </View>
                    <Text style={[styles.mealTitle, isCompleted && styles.mealTitleComplete]}>
                      {slot.label}
                    </Text>
                  </View>
                  <Icon size={20} color={isCompleted ? colors.success : colors.primary} />
                </View>
                <View style={styles.mealItems}>
                  {items.map((item, idx) => {
                    const displayItem = (isConsolidated && items.length > 1) 
                      ? `Option ${idx + 1}: ${item.replace(/^\d+\.\s*/, '')}` 
                      : item;
                      
                    return (
                      <View key={idx} style={styles.mealItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={[styles.mealItemText, isCompleted && styles.mealItemTextComplete]}>
                          {displayItem}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineTrack: {
    width: 28,
    alignItems: 'center',
    position: 'relative',
  },
  timelineNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: '#D5EAE2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 14,
  },
  timelineNodeComplete: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  timelineInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  timelineConnector: {
    position: 'absolute',
    top: 26,
    bottom: -22,
    width: 2,
    backgroundColor: '#EDF1EE',
    zIndex: 1,
  },
  cardWrapper: {
    flex: 1,
  },
  mealCard: {
    marginLeft: spacing.sm,
    padding: spacing.md,
  },
  mealCardComplete: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(40, 125, 75, 0.1)',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  mealMeta: {
    flex: 1,
  },
  timeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  mealTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  mealTitleComplete: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  mealItems: {
    gap: spacing.xs,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 1,
  },
  mealItemText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  mealItemTextComplete: {
    color: colors.text.light,
    textDecorationLine: 'line-through',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  consolidatedTipWrapper: {
    backgroundColor: 'rgba(40, 125, 75, 0.08)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    marginLeft: 28,
  },
  consolidatedTip: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  }
});
