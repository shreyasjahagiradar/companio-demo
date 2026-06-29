import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import Footer from '@/components/Footer';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { FileText, ChevronRight, Calendar, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

interface HealthReport {
  id: string;
  report_date: string;
  report_name: string;
}

export default function ReportsListScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const userId = user?.id || DEMO_USER_ID;

  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [userId]);

  const fetchReports = async () => {
    try {
      console.log('--- FETCH REPORTS ---');
      console.log('Current client id:', userId);
      console.log('Table being queried: report');

      const { data, error } = await supabase
        .from('report')
        .select('id, report_date, client_id')
        .eq('client_id', userId)
        .order('report_date', { ascending: false });

      console.log('Returned data:', JSON.stringify(data, null, 2));
      console.log('Returned error:', error);

      if (error) {
        console.error('Error fetching reports:', error);
      }
      if (data) {
        // map report to HealthReport interface expected by UI
        const mappedReports = data.map(r => ({
          id: r.id,
          report_date: r.report_date,
          report_name: `Diagnostic Report ${r.id.substring(0, 8)}`, // Use ID as name since there's no name column
          client_id: r.client_id
        }));
        setReports(mappedReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.appName}>MendRx Companion</Text>
            <Text style={styles.title}>My Reports</Text>
            <Text style={styles.subtitle}>View your diagnostic files</Text>
          </View>
        </View>
        {loading ? (
          <Card style={styles.stateCard}>
            <Text style={styles.loadingText}>Synchronizing reports...</Text>
          </Card>
        ) : reports.length === 0 ? (
          <Card style={styles.stateCard}>
            <View style={styles.emptyState}>
              <FileText size={42} color={colors.text.light} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No reports loaded</Text>
              <Text style={styles.emptyText}>
                Your clinic practitioner has not uploaded diagnostic results yet.
              </Text>
            </View>
          </Card>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => router.push(`/reports/${report.id}`)}
              activeOpacity={0.9}
              style={styles.touchItem}
            >
              <Card variant="elevated" style={styles.reportCard}>
                <View style={styles.reportLeft}>
                  <View style={styles.iconContainer}>
                    <FileText size={20} color={colors.primary} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportName}>{report.report_name}</Text>
                    <View style={styles.dateRow}>
                      <Calendar size={12} color={colors.text.light} />
                      <Text style={styles.reportDate}>
                        {formatDate(report.report_date)}
                      </Text>
                      <Text style={styles.reportRelative}>
                        · {getRelativeTime(report.report_date)}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.text.light} />
              </Card>
            </TouchableOpacity>
          ))
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + 20 : spacing.xl + 20,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#EDF1EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
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
    fontSize: 26,
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
    gap: spacing.sm,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  touchItem: {
    marginBottom: spacing.xs,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  reportDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  reportRelative: {
    ...typography.caption,
    color: colors.text.light,
  },
});

