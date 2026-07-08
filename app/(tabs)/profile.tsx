import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Footer from '@/components/Footer';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { User, FileText, CreditCard, Bell, LogOut, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const companionReport = useStore((state) => state.companionReport);
  const reset = useStore((state) => state.reset);
  const setIsOnboarded = useStore((state) => state.setIsOnboarded);
  const { headerPaddingTop, scrollPaddingBottom, contentPaddingHorizontal } = useResponsiveLayout();

  const userName = user?.name || 'Priya Sharma';
  const initial = userName.charAt(0).toUpperCase();
  const phone = user?.phone_number || '+91 98765 43210';

  // Dynamic calculations
  const ageDisplay = user?.age ? `${user.age} years` : 'Not specified';
  const conditionsDisplay = companionReport?.existingConditions?.length 
    ? companionReport.existingConditions.join(', ')
    : 'None specified';

  const startDate = user?.program_start_date ? new Date(user.program_start_date) : new Date();
  const endDate = user?.program_end_date ? new Date(user.program_end_date) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, Math.round((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleLogout = () => {
    reset();
    setIsOnboarded(false);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom, paddingHorizontal: contentPaddingHorizontal }]}
      >
        <LinearGradient
          colors={['#1B3B2B', '#0E2319']}
          style={[styles.header, { paddingTop: headerPaddingTop, paddingHorizontal: contentPaddingHorizontal }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text style={styles.brandName}>MendRx Companio</Text>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{phone}</Text>
        </LinearGradient>
        <Card>
          <Text style={styles.sectionTitle}>Health Profile</Text>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Age</Text>
            <Text style={styles.profileValue}>{ageDisplay}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Health Conditions</Text>
            <Text style={styles.profileValue}>{conditionsDisplay}</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Program Duration</Text>
            <Text style={styles.profileValue}>{totalDays} days</Text>
          </View>
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Days Remaining</Text>
            <Text style={styles.profileValue}>{daysRemaining} days</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionBadgeText}>Active</Text>
            </View>
            <Text style={styles.subscriptionText}>
              Your program is active until {formattedEndDate}
            </Text>
          </View>
        </Card>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/reports')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0F7F0' }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>My Reports</Text>
            </View>
            <ChevronRight size={20} color={colors.text.light} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFF4E6' }]}>
                <CreditCard size={20} color={colors.warning} />
              </View>
              <Text style={styles.menuText}>Subscription & Billing</Text>
            </View>
            <ChevronRight size={20} color={colors.text.light} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0F0FF' }]}>
                <Bell size={20} color="#6B7FE8" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={colors.text.light} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />
        </View>

        <View style={{ height: spacing.xl }} />
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
    alignItems: 'center',
    ...shadows.lg,
  },
  brandName: {
    ...typography.small,
    color: '#A8C7A7',
    marginBottom: spacing.md,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: '#D1DDD6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  profileValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  subscriptionBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  subscriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  menuSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text.primary,
  },
  logoutContainer: {
    marginTop: spacing.xl,
  },
});
