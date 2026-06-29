import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import {
  Activity,
  Flame,
  Apple,
  HeartPulse,
  Droplet,
  Leaf,
  Zap,
  Droplets,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface HealthCategory {
  id: string;
  category_name: string;
  status: 'good' | 'needs_attention' | 'at_risk';
  icon_name: string;
  summary: string;
}

interface HealthReport {
  id: string;
  report_date: string;
  report_name?: string;
  weight?: number;
  height?: number;
  waist?: number;
  diet?: string;
}

const ICON_MAP: Record<string, any> = {
  activity: Activity,
  flame: Flame,
  apple: Apple,
  'heart-pulse': HeartPulse,
  droplet: Droplet,
  leaf: Leaf,
  zap: Zap,
  droplets: Droplets,
};

const STATUS_CONFIG = {
  good: {
    color: colors.success,
    bgColor: '#EAF2EB',
    label: 'Good',
  },
  needs_attention: {
    color: colors.warning,
    bgColor: '#FFF7EE',
    label: 'Needs Attention',
  },
  at_risk: {
    color: colors.error,
    bgColor: '#FFF0F0',
    label: 'At Risk',
  },
};

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const userId = user?.id || DEMO_USER_ID;

  const [report, setReport] = useState<HealthReport | null>(null);
  const [categories, setCategories] = useState<HealthCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [id, userId]);

  const fetchReportDetails = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('report')
        .select('*')
        .eq('id', id)
        .eq('client_id', userId)
        .maybeSingle();

      if (reportError) {
        console.error('Error fetching report:', reportError);
      }
      if (reportData) {
        setReport({
          ...reportData,
          report_name: `Diagnostic Report ${reportData.id.substring(0, 8)}`,
        });
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('health_categories')
        .select('*')
        .eq('report_id', id)
        .order('category_name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      }
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching report details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusSummary = () => {
    const good = categories.filter((c) => c.status === 'good').length;
    const needsAttention = categories.filter((c) => c.status === 'needs_attention').length;
    const atRisk = categories.filter((c) => c.status === 'at_risk').length;

    return { good, needsAttention, atRisk };
  };

  const statusSummary = getStatusSummary();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>Diagnostic Report</Text>
            <Text style={styles.title} numberOfLines={1}>
              {report?.report_name || 'Report Detail'}
            </Text>
            {report && (
              <Text style={styles.subtitle}>{formatDate(report.report_date)}</Text>
            )}
          </View>
        </View>
        {loading ? (
          <Card style={styles.stateCard}>
            <Text style={styles.loadingText}>Loading report details...</Text>
          </Card>
        ) : (
          <>
            <Card variant="elevated" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Category Distribution</Text>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryItem, { backgroundColor: '#EAF2EB' }]}>
                  <CheckCircle size={14} color={colors.success} fill="#EAF2EB" />
                  <Text style={[styles.summaryLabel, { color: colors.success }]}>
                    {statusSummary.good} Good
                  </Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: '#FFF7EE' }]}>
                  <AlertCircle size={14} color={colors.warning} fill="#FFF7EE" />
                  <Text style={[styles.summaryLabel, { color: '#8A6612' }]}>
                    {statusSummary.needsAttention} Watch
                  </Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: '#FFF0F0' }]}>
                  <AlertCircle size={14} color={colors.error} fill="#FFF0F0" />
                  <Text style={[styles.summaryLabel, { color: colors.error }]}>
                    {statusSummary.atRisk} Risk
                  </Text>
                </View>
              </View>
            </Card>

            {report?.weight || report?.height || report?.diet ? (
              <>
                <Text style={styles.sectionTitle}>Patient Vitals</Text>
                <Card variant="elevated" style={styles.categoryCard}>
                  <View style={{ gap: spacing.md, padding: spacing.sm }}>
                    {report?.weight && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.categoryName}>Weight</Text>
                        <Text style={styles.categorySummary}>{report.weight} kg</Text>
                      </View>
                    )}
                    {report?.height && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.categoryName}>Height</Text>
                        <Text style={styles.categorySummary}>{report.height} cm</Text>
                      </View>
                    )}
                    {report?.waist && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.categoryName}>Waist</Text>
                        <Text style={styles.categorySummary}>{report.waist} inches</Text>
                      </View>
                    )}
                    {report?.diet && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.categoryName}>Diet</Text>
                        <Text style={styles.categorySummary}>{report.diet}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </>
            ) : null}

            {categories.length > 0 && (
              <Text style={styles.sectionTitle}>Biomarker Categories</Text>
            )}

            {categories.map((category) => {
              const Icon = ICON_MAP[category.icon_name] || Activity;
              const statusConfig = STATUS_CONFIG[category.status];

              return (
                <Card key={category.id} variant="elevated" style={styles.categoryCard}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: statusConfig.bgColor },
                      ]}
                    >
                      <Icon size={20} color={statusConfig.color} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <View style={styles.categoryTitleHeader}>
                        <Text style={styles.categoryName}>
                          {category.category_name}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusConfig.bgColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: statusConfig.color },
                            ]}
                          >
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.categorySummary}>
                        {category.summary}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}

            {categories.length === 0 && (
              <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
                <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
                  No biomarker categories found for this report.
                </Text>
              </Card>
            )}

            <View style={{ height: spacing.xl }} />
          </>
        )}
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
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + 20 : spacing.xl + 20,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#EDF1EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  appName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  summaryCard: {
    padding: spacing.md,
  },
  summaryTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm - 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  summaryLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  categoryCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '750' as any,
  },
  categorySummary: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
