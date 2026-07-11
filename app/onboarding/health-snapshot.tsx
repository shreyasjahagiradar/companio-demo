import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Activity, CheckCircle, Target, Sparkles } from 'lucide-react-native';

export default function HealthSnapshotScreen() {
  const router = useRouter();
  const setIsOnboarded = useStore((state) => state.setIsOnboarded);

  const conditions = [
    { name: 'Thyroid', icon: '🦋', color: '#EAF2EB', textColor: '#1B3B2B' },
    { name: 'Anemia', icon: '🩸', color: '#FFF0F0', textColor: '#C53030' },
  ];

  const goals = [
    { title: 'Improve Energy', progress: 40, detail: 'Target sleep & iron markers' },
    { title: 'Weight Gain', progress: 25, detail: 'Dietary caloric surplus' },
    { title: 'Better Digestion', progress: 60, detail: 'Prebiotic & meal timings' },
  ];

  const handleConfirm = () => {
    setIsOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#FAF9F6', '#FAF9F6', '#EAF2EB']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.brandName}>MendRx Companio</Text>
          <Text style={styles.title}>Your Health Snapshot</Text>
          <Text style={styles.subtitle}>
            Practitioner-analyzed diagnostic summary & target protocols.
          </Text>
        </View>

        {/* Hero Health Score Card */}
        <Card variant="elevated" style={styles.scoreCard}>
          <LinearGradient
            colors={['#1B3B2B', '#0E2319']}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreHeader}>
              <Activity size={18} color="#A8C7A7" />
              <Text style={styles.scoreLabel}>INITIAL METABOLIC SCORE</Text>
            </View>
            <View style={styles.scoreMain}>
              <Text style={styles.scoreNum}>84</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={styles.scoreDesc}>
              Moderate metabolic stability. Focus on micro-nutritional deficiencies to elevate score.
            </Text>
            <View style={styles.divider} />
            <View style={styles.scoreFooter}>
              <Sparkles size={14} color="#F2B84B" />
              <Text style={styles.scoreTip}>2 core improvements identified</Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Conditions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracked Conditions</Text>
          <View style={styles.chipsContainer}>
            {conditions.map((condition, index) => (
              <View
                key={index}
                style={[styles.chip, { backgroundColor: condition.color }]}
              >
                <Text style={styles.chipIcon}>{condition.icon}</Text>
                <Text style={[styles.chipText, { color: condition.textColor }]}>
                  {condition.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Protocol Goals</Text>
          {goals.map((goal, index) => (
            <Card key={index} variant="elevated" style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleWrap}>
                  <Target size={18} color={colors.primary} />
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                <Text style={styles.goalPercentage}>{goal.progress}%</Text>
              </View>
              <Text style={styles.goalDetail}>{goal.detail}</Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[styles.progressBarFill, { width: `${goal.progress}%` }]}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Confirm & Start Journey"
          onPress={handleConfirm}
          size="large"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl * 1.5 : spacing.xxl,
    paddingBottom: spacing.xxl * 1.5,
  },
  header: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  brandName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  scoreCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  scoreGradient: {
    padding: spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  scoreLabel: {
    ...typography.caption,
    color: '#A8C7A7',
    letterSpacing: 1,
    fontWeight: '700',
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  scoreNum: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 54,
  },
  scoreMax: {
    fontSize: 20,
    color: '#A8C7A7',
    fontWeight: '600',
  },
  scoreDesc: {
    ...typography.small,
    color: '#D1DDD6',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.md,
  },
  scoreFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreTip: {
    ...typography.caption,
    color: '#F2B84B',
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  chipIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  chipText: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
  },
  goalCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  goalTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  goalPercentage: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  goalDetail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    paddingLeft: 22,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#EDF1EE',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 12 : spacing.xl,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

