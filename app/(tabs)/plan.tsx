import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Card from '@/components/Card';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Pill, Sun, Footprints, Moon as Sleep } from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import MealTimeline from '@/components/MealTimeline';
import { fetchMyPlan } from '@/services/companionService';
import { fetchMyReport } from '@/services/companionService';
import { LinearGradient } from 'expo-linear-gradient';
import ReportSummaryCard from '@/components/ReportSummaryCard';
import BloodPanelSummaryChart from '@/components/BloodPanelSummaryChart';
import BloodPanelCard from '@/components/BloodPanelCard';
import NotesCard from '@/components/NotesCard';
import Footer from '@/components/Footer';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getDietCycleDay } from '@/utils/getDietCycleDay';

const TABS = ['Diet', 'Supplements', 'Lifestyle', 'Report'];

const SUPPLEMENTS = [
  {
    name: 'Iron Complex',
    dosage: '1 tablet',
    timing: 'Morning',
    note: 'Take with vitamin C (orange juice) for maximum absorption.',
  },
  {
    name: 'Vitamin D3',
    dosage: '2000 IU',
    timing: 'Morning',
    note: 'Take with healthy fat source (breakfast).',
  },
  {
    name: 'B-Complex',
    dosage: '1 tablet',
    timing: 'Afternoon',
    note: 'Take with lunch to support mitochondrial energy.',
  },
  {
    name: 'Zinc + Magnesium',
    dosage: '1 tablet',
    timing: 'Night',
    note: 'Take 30 minutes before bed to promote restorative sleep.',
  },
];

const LIFESTYLE = [
  {
    activity: 'Morning Sunlight',
    icon: Sun,
    duration: '15-20 mins',
    timing: '6:30 AM - 8:00 AM',
    benefit: 'Aids circadian rhythm & hormone balance',
  },
  {
    activity: 'Aerobic Walk',
    icon: Footprints,
    duration: '30 mins',
    timing: 'Evening',
    benefit: 'Enhances metabolic efficiency and digestion',
  },
  {
    activity: 'Circadian Sleep',
    icon: Sleep,
    duration: '7-8 hours',
    timing: '10:00 PM - 6:00 AM',
    benefit: 'Crucial for metabolic detoxification & cellular recovery',
  },
];

export default function PlanScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const sndPlan = useStore((state) => state.sndPlan);
  const setSndPlan = useStore((state) => state.setSndPlan);
  const companionReport = useStore((state) => state.companionReport);
  const setCompanionReport = useStore((state) => state.setCompanionReport);
  const client = useStore((state) => state.client);
  const { headerPaddingTop, scrollPaddingBottom } = useResponsiveLayout();
  
  // Safely find the diet plan version with the highest versionNumber
  const latestDietPlanVersion = sndPlan?.dietPlanVersions?.reduce((latest, current) => {
    if (!latest) return current;
    return (current.versionNumber > latest.versionNumber) ? current : latest;
  }, null as any);

  const allDayPlans = latestDietPlanVersion?.dayPlans ?? [];
  const totalCycleDays = allDayPlans.length || 1;

  // Compute today's cycle day
  const todayCycle = getDietCycleDay(sndPlan?.createdAt, new Date(), totalCycleDays);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayCycle.index);

  // Keep selectedDayIndex in sync when plan data loads
  useEffect(() => {
    if (allDayPlans.length > 0) {
      const cycle = getDietCycleDay(sndPlan?.createdAt, new Date(), allDayPlans.length);
      setSelectedDayIndex(cycle.index);
    }
  }, [sndPlan?.createdAt, allDayPlans.length]);

  const selectedDayPlan = allDayPlans[selectedDayIndex] ?? allDayPlans[0] ?? null;
  const supplements = sndPlan?.supplements || [];

  useEffect(() => {
    async function loadPlan() {
      if (!client) return;
      const identifier = client.phone_number || client.name;
      const plan = await fetchMyPlan(identifier);
      if (plan) {
        setSndPlan(plan);
      }
      const report = await fetchMyReport(identifier);
      if (report) {
        setCompanionReport(report);
      }
    }
    loadPlan();
  }, [client]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
      >
        {/* Header section with gradient highlights */}
        <LinearGradient
          colors={['#1B3B2B', '#0E2319']}
          style={[styles.header, { paddingTop: headerPaddingTop }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text style={styles.appName}>MendRx Companio</Text>
          <Text style={styles.title}>Your Plan</Text>
          <Text style={styles.subtitle}>Tailored clinical nutrition protocol</Text>
        </LinearGradient>

        {/* Premium capsule selector */}
        <View style={styles.tabOuter}>
          <View style={styles.tabContainer}>
            {TABS.map((tab, index) => {
              const isSelected = activeTab === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.tab, isSelected && styles.tabActive]}
                  onPress={() => setActiveTab(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {activeTab === 0 && (
          <>
            {/* Day Cycle Selector */}
            {allDayPlans.length > 1 && (
              <View style={styles.daySelectorOuter}>
              <View style={styles.daySelectorContainer}>
                  {allDayPlans.map((_: any, i: number) => {
                    const isToday = i === todayCycle.index;
                    const isSelected = i === selectedDayIndex;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                        ]}
                        onPress={() => setSelectedDayIndex(i)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.dayPillText,
                          isSelected && styles.dayPillTextActive,
                        ]}>
                          {`Day ${i + 1}`}
                        </Text>
                        {isToday && (
                          <View style={styles.todayDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
              </View>
            )}
            <MealTimeline dayPlan={selectedDayPlan} readOnly />
          </>
        )}

        {activeTab === 1 && (
          <View style={styles.listContainer}>
            {supplements.length === 0 ? (
               <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>💊</Text>
                <Text style={styles.emptyTitle}>No Supplements Configured</Text>
              </Card>
            ) : supplements.map((supplement, index) => (
              <Card key={index} variant="elevated" style={styles.supplementCard}>
                <View style={styles.supplementHeader}>
                  <View style={styles.supplementIcon}>
                    <Pill size={18} color={colors.primary} />
                  </View>
                  <View style={styles.supplementInfo}>
                    <Text style={styles.supplementName}>{supplement.name}</Text>
                    <View style={styles.doseRow}>
                      <Text style={styles.dosageLabel}>{supplement.dosage}</Text>
                      <Text style={styles.dotSeparator}>·</Text>
                      <Text style={styles.timingLabel}>{supplement.timing}</Text>
                    </View>
                  </View>
                </View>
                
                {supplement.purpose && (
                  <View style={styles.supplementDetailSection}>
                    <Text style={styles.supplementDetailLabel}>Purpose</Text>
                    <Text style={styles.supplementDetailText}>{supplement.purpose}</Text>
                  </View>
                )}
                
                {supplement.precautions && (
                  <View style={styles.supplementDetailSection}>
                    <Text style={styles.supplementDetailLabel}>Precautions</Text>
                    <Text style={styles.supplementDetailText}>{supplement.precautions}</Text>
                  </View>
                )}

              </Card>
            ))}
            
            {sndPlan?.supplementNotes && (
               <View style={styles.supplementNote}>
                 <Text style={{fontWeight: '700', marginBottom: 4, color: colors.text.primary}}>Notes from Practitioner:</Text>
                 <Text style={styles.supplementNoteText}>{sndPlan.supplementNotes}</Text>
               </View>
            )}
          </View>
        )}

        {activeTab === 2 && (
          <View style={styles.listContainer}>
            {LIFESTYLE.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} variant="elevated" style={styles.lifestyleCard}>
                  <View style={styles.lifestyleHeader}>
                    <View style={styles.lifestyleIconContainer}>
                      <Icon size={20} color={colors.lavender} />
                    </View>
                    <View style={styles.lifestyleInfo}>
                      <Text style={styles.lifestyleActivity}>{item.activity}</Text>
                      <View style={styles.doseRow}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                        <Text style={styles.dotSeparator}>·</Text>
                        <Text style={styles.lifestyleTiming}>{item.timing}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.lifestyleBenefit}>{item.benefit}</Text>
                </Card>
              );
            })}
          </View>
        )}

        {activeTab === 3 && (
          <View style={styles.listContainer}>
            {companionReport ? (
              <>
                <ReportSummaryCard report={companionReport} />
                
                {companionReport.bloodPanelListMap && (
                  <BloodPanelSummaryChart bloodPanelListMap={companionReport.bloodPanelListMap} />
                )}

                {companionReport.bloodPanelListMap && Object.entries(companionReport.bloodPanelListMap).map(([panelName, markers], index) => (
                  <BloodPanelCard key={`panel-${index}`} panelName={panelName} markers={markers} />
                ))}

                {companionReport.notes ? (
                  <NotesCard notes={companionReport.notes} />
                ) : null}
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyTitle}>No Report Available</Text>
                <Text style={styles.emptySubtitle}>Your clinical report analysis is not available yet.</Text>
              </Card>
            )}
          </View>
        )}

        {/* Spacing for bottom tab bar */}
        <View style={{ height: 110 }} />
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  appName: {
    ...typography.caption,
    color: '#A8C7A7', // Light green
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '850' as any,
    color: colors.white, // White text for dark background
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#D1DDD6', // Light grayish green
    marginTop: 2,
  },
  tabOuter: {
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF1EE',
    borderRadius: borderRadius.lg,
    padding: 4,
    gap: 2,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  tabText: {
    ...typography.caption,
    fontSize: 10, // Reduced to ensure "Supplements" fits without truncation
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  daySelectorOuter: {
    marginBottom: spacing.sm,
  },
  daySelectorContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  dayPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#EDF1EE',
    alignItems: 'center',
    position: 'relative',
  },
  dayPillActive: {
    backgroundColor: colors.primary,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  dayPillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A8C7A7',
  },
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
    lineHeight: 22,
  },
  listContainer: {
    gap: spacing.md,
  },
  supplementCard: {
    padding: spacing.md,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  supplementIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3EDFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  dosageLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  dotSeparator: {
    color: colors.text.light,
  },
  timingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  supplementNote: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E9EDE9',
    marginTop: spacing.sm,
  },
  supplementNoteText: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  supplementDetailSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  supplementDetailLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  supplementDetailText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  lifestyleCard: {
    padding: spacing.md,
  },
  lifestyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lifestyleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lifestyleInfo: {
    flex: 1,
  },
  lifestyleActivity: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  durationText: {
    ...typography.caption,
    color: colors.lavender,
    fontWeight: '600',
  },
  lifestyleTiming: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  lifestyleBenefit: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

