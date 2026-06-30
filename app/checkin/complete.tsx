import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { CircleCheck as CheckCircle, TrendingUp } from 'lucide-react-native';

export default function CompleteScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <CheckCircle size={72} color={colors.primary} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>Check-in Complete!</Text>
          <Text style={styles.subtitle}>Great work, Priya</Text>

          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>3-day streak — keep it going!</Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={18} color="#4A90D9" />
              <Text style={styles.insightTitle}>Today's Insight</Text>
            </View>
            <Text style={styles.insightText}>
              Your energy is lower than usual today. Make sure to take your iron supplement and get good sleep tonight.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🩺</Text>
              <Text style={styles.summaryLabel}>Symptoms</Text>
              <Text style={styles.summaryDone}>Logged</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🌿</Text>
              <Text style={styles.summaryLabel}>Gut</Text>
              <Text style={styles.summaryDone}>Logged</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🍽️</Text>
              <Text style={styles.summaryLabel}>Meals</Text>
              <Text style={styles.summaryDone}>Logged</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🌙</Text>
              <Text style={styles.summaryLabel}>Lifestyle</Text>
              <Text style={styles.summaryDone}>Logged</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/report')}
          activeOpacity={0.85}
        >
          <TrendingUp size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>View Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EDF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 3,
    borderColor: '#C8DFCA',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3EE',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FFD4C2',
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakText: {
    ...typography.bodyMedium,
    color: '#FF6B35',
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#EBF4FF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#BDD8F5',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightTitle: {
    ...typography.bodyMedium,
    color: '#4A90D9',
  },
  insightText: {
    ...typography.body,
    color: '#2C5282',
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
    ...shadows.sm,
  },
  summaryEmoji: {
    fontSize: 22,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  summaryDone: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#F5F6F3',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  primaryBtnText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
