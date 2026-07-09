import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useStore } from '@/store/useStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import DatePickerModal from '@/components/DatePickerModal';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Check, Coffee, Pill, Activity, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveLog, loadLog } from '@/services/logService';
import Footer from '@/components/Footer';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getDietCycleDay } from '@/utils/getDietCycleDay';

/** Format a Date to 'YYYY-MM-DD' for Supabase */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

const parseMealItems = (value: string | null | undefined): string[] => {
  if (!value || value.trim() === '') return [];
  const lines = value.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return value.split(',').map((l) => l.trim()).filter(Boolean);
};

export default function TrackScreen() {
  const sndPlan = useStore((state) => state.sndPlan);
  const user = useStore((state) => state.user);
  const clientId = user?.id;
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Extract meals from the correct cycle day based on selectedDate
  const mealItems = useMemo(() => {
    if (!sndPlan?.dietPlanVersions || sndPlan.dietPlanVersions.length === 0) {
      return [];
    }
    const latestVersion = sndPlan.dietPlanVersions[sndPlan.dietPlanVersions.length - 1];
    const allDayPlans = latestVersion.dayPlans ?? [];
    if (allDayPlans.length === 0) return [];

    // Compute which cycle day to use based on selectedDate
    const { index } = getDietCycleDay(sndPlan.createdAt, selectedDate, allDayPlans.length);
    const dayPlan = allDayPlans[index] ?? allDayPlans[0];
    if (!dayPlan) return [];
    
    const items: any[] = [];
    const isConsolidated = allDayPlans.length === 1;

    const addSlot = (slotKey: string, slotName: string, slotValue: string | undefined | null) => {
      if (!slotValue) return;
      
      const parsed = parseMealItems(slotValue);
      if (isConsolidated && parsed.length > 1) {
        parsed.forEach((opt, idx) => {
          // Clean up numbering (e.g. "1. Option" -> "Option") if it exists, for cleaner display, or just keep it
          const cleanOpt = opt.replace(/^\d+\.\s*/, '');
          items.push({
            id: `dp-${slotKey}-opt${idx}-d${index}`,
            label: `${slotName} (Option ${idx + 1}): ${cleanOpt}`,
            type: 'meal',
            groupId: `dp-${slotKey}-group`
          });
        });
      } else {
        items.push({ id: `dp-${slotKey}-d${index}`, label: `${slotName}: ${slotValue}`, type: 'meal' });
      }
    };

    addSlot('preMorning', 'Pre-Morning', dayPlan.preMorning);
    addSlot('morning', 'Breakfast', dayPlan.morning);
    addSlot('midMorning', 'Mid-Morning', dayPlan.midMorning);
    addSlot('lunch', 'Lunch', dayPlan.lunch);
    addSlot('earlyEvening', 'Evening', dayPlan.earlyEvening);
    addSlot('night', 'Dinner', dayPlan.night);
    
    return items;
  }, [sndPlan, selectedDate]);

  // Extract supplements
  const supplementItems = useMemo(() => {
    if (!sndPlan?.supplements || sndPlan.supplements.length === 0) {
      return [];
    }
    return sndPlan.supplements.map(s => ({
      id: s.id,
      label: `${s.name} (${s.dosage} - ${s.timing})`,
      type: 'supplement'
    }));
  }, [sndPlan]);

  // Activity items (Generic)
  const activityItems = [
    { id: 'a1', label: '30 min brisk walk', type: 'activity' },
    { id: 'a2', label: '10 min morning stretching', type: 'activity' },
    { id: 'a3', label: '10,000 steps', type: 'activity' },
  ];

  const allItems = [...mealItems, ...supplementItems, ...activityItems];
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSavedLog, setHasSavedLog] = useState(false);
  const { isMobile, headerPaddingTop, scrollPaddingBottom, contentPaddingHorizontal } = useResponsiveLayout();

  // Load saved log when date changes or on mount
  const fetchLogForDate = useCallback(async (date: Date) => {
    if (!clientId) return;
    setLoadingLog(true);
    try {
      const log = await loadLog(clientId, toDateString(date));
      if (log && log.checked_item_ids) {
        setCheckedIds(new Set(log.checked_item_ids));
        setHasSavedLog(true);
      } else {
        setCheckedIds(new Set());
        setHasSavedLog(false);
      }
    } catch (err) {
      console.error('[Track] Error loading log:', err);
      setCheckedIds(new Set());
      setHasSavedLog(false);
    } finally {
      setLoadingLog(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchLogForDate(selectedDate);
  }, [selectedDate, fetchLogForDate]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    if (newDate <= new Date()) { // Don't go into future
      setSelectedDate(newDate);
    }
  };
  
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const toggleCheck = (id: string) => {
    const item = allItems.find(i => i.id === id);
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      if (item && item.groupId) {
        allItems
          .filter(i => i.groupId === item.groupId && i.id !== id)
          .forEach(i => newChecked.delete(i.id));
      }
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  const handleUncheckAll = () => {
    setCheckedIds(new Set());
  };

  const progress = allItems.length > 0 ? (checkedIds.size / allItems.length) * 100 : 0;
  
  // Submit handler — saves to Supabase
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async () => {
    if (!clientId) {
      console.warn('[Track] No client ID, cannot save log');
      return;
    }
    
    setSaving(true);
    try {
      const result = await saveLog(
        clientId,
        toDateString(selectedDate),
        Array.from(checkedIds),
        allItems.length
      );
      
      if (result) {
        setHasSavedLog(true);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
        }, 2500);
      }
    } catch (err) {
      console.error('[Track] Error saving log:', err);
    } finally {
      setSaving(false);
    }
  };
  
  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={[styles.successContainer, { paddingHorizontal: contentPaddingHorizontal }]}>
          <View style={styles.successIcon}>
            <Check size={48} color={colors.primary} strokeWidth={3} />
          </View>
          <Text style={styles.successTitle}>Great job!</Text>
          <Text style={styles.successText}>Log saved successfully.</Text>
        </View>
      </View>
    );
  }

  // Render Checkbox list
  const renderList = (items: any[], color: string) => {
    return items.map((item, index) => {
      const isChecked = checkedIds.has(item.id);
      return (
        <TouchableOpacity 
          key={item.id} 
          style={[styles.checkItem, index === items.length - 1 && { borderBottomWidth: 0 }]}
          onPress={() => toggleCheck(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isChecked && { borderColor: color, backgroundColor: color }]}>
            {isChecked && <Check size={14} color={colors.white} strokeWidth={3.5} />}
          </View>
          <Text style={[styles.checkLabel, isChecked && styles.checkLabelDone]}>{item.label}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
        stickyHeaderIndices={[1]}
      >
        {/* Index 0: Header Top */}
        <LinearGradient
          colors={['#1B3B2B', '#132D21']}
          style={[styles.headerTopHalf, { paddingTop: headerPaddingTop, paddingHorizontal: contentPaddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text style={styles.appName}>MendRx Companio</Text>
          
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Daily Log</Text>
              <Text style={styles.subtitle}>Track your prescribed plan</Text>
            </View>
            
            <View style={styles.dateSelector}>
              <TouchableOpacity onPress={handlePrevDay} style={styles.dateBtn}>
                <ChevronLeft size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <Text style={styles.dateText}>{dateLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleNextDay} 
                style={[styles.dateBtn, isToday && { opacity: 0.3 }]} 
                disabled={isToday}
              >
                <ChevronRight size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Index 1: Sticky Progress Bar */}
        <View style={styles.stickyContainer}>
          <LinearGradient
            colors={['#132D21', '#0E2319']}
            style={[styles.headerBottomHalf, { paddingHorizontal: contentPaddingHorizontal }]}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.progressText}>{isToday ? "Today's" : dateLabel + "'s"} Completion</Text>
                  {hasSavedLog && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#A8C7A7' }} />}
                </View>
                <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Index 2: Content */}
        <View style={[styles.scrollContent, { paddingHorizontal: contentPaddingHorizontal }]}>
          {loadingLog ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading log...</Text>
            </View>
          ) : (
            <>
              <Card variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#ECF3D6' }]}>
                  <Coffee size={20} color={colors.lime} />
                </View>
                <Text style={styles.cardTitle}>Meals & Diet Plan</Text>
              </View>
              <View style={styles.cardBody}>
                {renderList(mealItems, colors.lime)}
              </View>
            </Card>

            <Card variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FDE8F3' }]}>
                  <Pill size={20} color={colors.pink} />
                </View>
                <Text style={styles.cardTitle}>Supplements</Text>
              </View>
              <View style={styles.cardBody}>
                {renderList(supplementItems, colors.pink)}
              </View>
            </Card>

            <Card variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#E0E7FF' }]}>
                  <Activity size={20} color={colors.indigo} />
                </View>
                <Text style={styles.cardTitle}>Activity</Text>
              </View>
              <View style={styles.cardBody}>
                {renderList(activityItems, colors.indigo)}
              </View>
            </Card>
            
            <View style={styles.actionContainer}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Uncheck all"
                  onPress={handleUncheckAll}
                  size="medium"
                  variant="outline"
                  disabled={saving || checkedIds.size === 0}
                  style={{ height: 56 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={saving ? 'Saving...' : hasSavedLog ? 'Update Log' : 'Save Log'}
                  onPress={handleSubmit}
                  size="medium"
                  disabled={saving}
                  loading={saving}
                  style={{ height: 56 }}
                />
              </View>
            </View>
            
            <View style={{ height: spacing.xxl * 2 }} />
            <Footer />
          </>
          )}
        </View>
      </ScrollView>

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
        }}
        maxDate={new Date()}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTopHalf: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl, // Just normal padding now
    paddingBottom: spacing.sm,
  },
  headerBottomHalf: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  stickyContainer: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    ...typography.caption,
    color: '#A8C7A7',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '850' as any,
    color: colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.body,
    color: '#A8C7A7',
    marginTop: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dateBtn: {
    padding: spacing.xs,
  },
  dateText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
    paddingHorizontal: spacing.xs,
    minWidth: 55,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressPercent: {
    ...typography.h2,
    color: '#A8C7A7',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A8C7A7',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardBody: {
    paddingVertical: spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F5F2',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  checkLabelDone: {
    color: colors.text.light,
    textDecorationLine: 'line-through',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EAF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
