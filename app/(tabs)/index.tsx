import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, shadows, borderRadius } from '@/constants/theme';
import { Activity, Zap, UtensilsCrossed, Moon, ChevronRight, Flame, CircleCheck as CheckCircle, Sparkles, Trophy } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import ProgressCircle from '@/components/ProgressCircle';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CheckinStatus {
  symptoms_done: boolean;
  gut_done: boolean;
  meals_done: boolean;
  lifestyle_done: boolean;
  streak_count: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const userId = user?.id || DEMO_USER_ID;
  const userName = user?.name || 'Priya';

  const [status, setStatus] = useState<CheckinStatus>({
    symptoms_done: false,
    gut_done: false,
    meals_done: false,
    lifestyle_done: false,
    streak_count: 3,
  });
  const [loading, setLoading] = useState(true);
  const { headerPaddingTop, scrollPaddingBottom } = useResponsiveLayout();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTodayStatus();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [userId]);

  const fetchTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('checkin_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('session_date', today)
        .maybeSingle();

      if (data) {
        setStatus({
          symptoms_done: data.symptoms_done,
          gut_done: data.gut_done,
          meals_done: data.meals_done,
          lifestyle_done: data.lifestyle_done,
          streak_count: data.streak_count ?? 3,
        });
      }
    } catch (e) {
      console.warn('Error fetching status:', e);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      key: 'symptoms',
      title: 'Symptoms',
      subtitle: status.symptoms_done ? 'Logged today' : 'Not logged',
      icon: Activity,
      color: colors.indigo, // Use new vibrant color
      bgColor: '#E0E7FF',
      done: status.symptoms_done,
      route: '/checkin/symptoms',
    },
    {
      key: 'gut',
      title: 'Gut Health',
      subtitle: status.gut_done ? 'Logged today' : 'Not logged',
      icon: Zap,
      color: colors.warning, // Keep warning for energy/gut
      bgColor: '#FFF3E5',
      done: status.gut_done,
      route: '/checkin/gut',
    },
    {
      key: 'meals',
      title: 'Meals',
      subtitle: status.meals_done ? 'Logged today' : 'Not logged',
      icon: UtensilsCrossed,
      color: colors.lime, // Use new vibrant color
      bgColor: '#ECF3D6',
      done: status.meals_done,
      route: '/checkin/meals',
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle',
      subtitle: status.lifestyle_done ? 'Logged today' : 'Not logged',
      icon: Moon,
      color: colors.pink, // Use new vibrant color
      bgColor: '#FDE8F3',
      done: status.lifestyle_done,
      route: '/checkin/lifestyle',
    },
  ];

  const doneCount = cards.filter((c) => c.done).length;
  const progressPercent = (doneCount / 4) * 100;
  const allDone = doneCount === 4;

  const weeklyData = [
    { day: 'Mon', done: true },
    { day: 'Tue', done: true },
    { day: 'Wed', done: false },
    { day: 'Thu', done: true },
    { day: 'Fri', done: true },
    { day: 'Sat', done: true },
    { day: 'Sun', done: false, isToday: true },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={['#1B3B2B', '#0E2319']}
          style={[styles.heroHeader, { paddingTop: headerPaddingTop }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appName}>MendRx Companion</Text>
              <Text style={styles.greeting}>
                {getGreeting()},{'\n'}
                <Text style={styles.userName}>{userName}</Text>
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={16} color="#FF724C" fill="#FF724C" />
              <Text style={styles.streakText}>{status.streak_count} Day Streak</Text>
            </View>
          </View>

          {/* Circle Progress Hero Card */}
          <Card variant="glass" style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Daily Check-in</Text>
                <Text style={styles.progressSubtitle}>
                  {allDone ? 'All categories logged!' : `${doneCount} of 4 completed`}
                </Text>
                <Text style={styles.progressTip}>
                  Consistent logs unlock deeper metabolic insights.
                </Text>
              </View>
              <View style={styles.progressRingWrapper}>
                <ProgressCircle progress={progressPercent} size={90} strokeWidth={8} />
              </View>
            </View>
          </Card>
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          {allDone && (
            <View style={styles.completeBanner}>
              <CheckCircle size={18} color={colors.success} />
              <Text style={styles.completeText}>Check-in complete! Great job today.</Text>
            </View>
          )}

          {/* Program Journey Map */}
          <Text style={styles.sectionLabel}>Program Journey</Text>
          <Card variant="elevated" style={styles.journeyCard}>
            <View style={styles.journeyHeader}>
              <Trophy size={18} color={colors.warning} />
              <Text style={styles.journeyTitle}>90-Day Metabolic Restoration</Text>
            </View>
            <View style={styles.journeyTrack}>
              <View style={styles.journeyLine} />
              <View style={[styles.journeyFill, { width: '35%' }]} />
              <View style={[styles.journeyNode, styles.nodeActive]}>
                <Text style={styles.nodeLabel}>Reset</Text>
              </View>
              <View style={[styles.journeyNode, { left: '50%' }]}>
                <Text style={styles.nodeLabel}>Balance</Text>
              </View>
              <View style={[styles.journeyNode, { left: '96%' }]}>
                <Text style={styles.nodeLabel}>Adapt</Text>
              </View>
            </View>
            <Text style={styles.journeyFooter}>Currently in Week 4: Gut Reset Phase</Text>
          </Card>

          {/* Weekly Adherence */}
          <Text style={styles.sectionLabel}>This Week's Adherence</Text>
          <Card variant="elevated" style={styles.weeklyCard}>
            <View style={styles.weeklyRow}>
              {weeklyData.map((day, i) => (
                <View key={i} style={styles.dayCol}>
                  <Text style={[styles.dayText, day.isToday && styles.dayTextToday]}>{day.day}</Text>
                  <View style={[
                    styles.dayCircle, 
                    day.done && styles.dayCircleDone,
                    day.isToday && !day.done && styles.dayCircleToday
                  ]}>
                    {day.done ? <CheckCircle size={16} color={colors.white} /> : null}
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* AI Insight Card */}
          <Text style={styles.sectionLabel}>AI Insights</Text>
          <Card variant="elevated" style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Sparkles size={18} color="#FF724C" />
              <Text style={styles.insightTitle}>Smart Recommendation</Text>
            </View>
            <Text style={styles.insightText}>
              Your thyroid indicators show peak absorption early in the morning. Try adjusting your morning routine to take your prescribed Iron complex precisely 30 minutes before breakfast.
            </Text>
          </Card>

        </Animated.View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroHeader: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.caption,
    color: '#A8C7A7',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  userName: {
    color: '#A8C7A7',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 114, 76, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 114, 76, 0.25)',
  },
  streakText: {
    ...typography.caption,
    color: '#FF724C',
    fontWeight: '700',
  },
  progressCard: {
    marginTop: spacing.sm,
    padding: spacing.md + 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  progressTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  progressSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#D1DDD6',
    marginBottom: spacing.sm,
  },
  progressTip: {
    ...typography.caption,
    color: '#A8C7A7',
    lineHeight: 18,
  },
  progressRingWrapper: {
    marginLeft: spacing.sm,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2EB',
    borderRadius: borderRadius.lg,
    padding: spacing.md - 2,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(40, 125, 75, 0.15)',
  },
  completeText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingLeft: 2,
  },
  journeyCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg + 4,
  },
  journeyTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  journeyTrack: {
    height: 6,
    backgroundColor: '#EDF1EE',
    borderRadius: 3,
    position: 'relative',
    marginBottom: spacing.lg + 4,
  },
  journeyLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E5EAE6',
    borderRadius: 3,
  },
  journeyFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  journeyNode: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EDF1EE',
    borderWidth: 3,
    borderColor: '#E5EAE6',
    transform: [{ translateX: -7 }],
  },
  nodeActive: {
    backgroundColor: colors.primary,
    borderColor: '#D5EAE2',
  },
  nodeLabel: {
    position: 'absolute',
    top: 18,
    width: 60,
    textAlign: 'center',
    transform: [{ translateX: -23 }],
    ...typography.caption,
    color: colors.text.light,
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: colors.text.light,
    opacity: 0.3,
  },
  journeyFooter: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardTouch: {
    width: '47.5%',
    marginBottom: spacing.xs,
  },
  cardTouchDone: {
    opacity: 0.95,
  },
  checkinCard: {
    padding: spacing.md - 2,
    height: 165,
    justifyContent: 'space-between',
  },
  checkinCardDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(40, 125, 75, 0.1)',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md + 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  doneCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  cardTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.light,
    marginTop: -4,
    marginBottom: spacing.xs,
  },
  cardSubtitleDone: {
    color: colors.success,
    fontWeight: '600',
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E9EDE9',
  },
  cardBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  cardBtnTextDone: {
    color: colors.text.light,
  },
  insightCard: {
    backgroundColor: '#FCF8EE',
    borderColor: 'rgba(239, 169, 74, 0.15)',
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs + 2,
  },
  insightTitle: {
    ...typography.bodyMedium,
    color: '#8A5E12',
    fontWeight: '700',
  },
  insightText: {
    ...typography.body,
    fontSize: 14,
    color: '#5C441E',
    lineHeight: 21,
  },
  weeklyCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  dayCol: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleDone: {
    backgroundColor: colors.success,
  },
  dayCircleToday: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  copyrightContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    ...typography.caption,
    color: colors.text.light,
  },
});
