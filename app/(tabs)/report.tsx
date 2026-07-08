import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import Footer from '@/components/Footer';
import BloodPanelSummaryChart from '@/components/BloodPanelSummaryChart';
import BloodPanelCard from '@/components/BloodPanelCard';
import { fetchMyReport } from '@/services/companionService';
import { CompanionReport } from '@/types/types';
import Card from '@/components/Card';
import { FileText, AlertCircle } from 'lucide-react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function ReportScreen() {
  const client = useStore((state) => state.client);
  const [report, setReport] = useState<CompanionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { headerPaddingTop, scrollPaddingBottom, contentPaddingHorizontal } = useResponsiveLayout();

  useEffect(() => {
    if (client?.id) {
      loadReport();
    }
  }, [client?.id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchMyReport(client?.id);
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
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
          <Text style={styles.appName}>MendRx Companion</Text>
          <Text style={styles.title}>Your Health Report</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading...' : report ? `Analysis from ${formatDate(report.reportDate)}` : 'No report available'}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {loading ? (
             <View style={styles.centerContainer}>
               <ActivityIndicator size="large" color={colors.primary} />
               <Text style={styles.loadingText}>Fetching your detailed analysis...</Text>
             </View>
          ) : report && Object.keys(report.bloodPanelListMap || {}).length > 0 ? (
            <>
              {/* Summary Chart */}
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <FileText size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Metabolic Overview</Text>
                </View>
                <View style={styles.chartWrapper}>
                  <BloodPanelSummaryChart bloodPanelListMap={report.bloodPanelListMap} />
                </View>
              </Card>

              {/* Patient Info Summary */}
              <Card style={styles.infoCard}>
                <Text style={styles.infoTitle}>Patient Summary</Text>
                <View style={styles.infoGrid}>
                  {report.weight ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Weight</Text>
                      <Text style={styles.infoValue}>{report.weight} kg</Text>
                    </View>
                  ) : null}
                  {report.height ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Height</Text>
                      <Text style={styles.infoValue}>{report.height} cm</Text>
                    </View>
                  ) : null}
                  {report.bmi ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>BMI</Text>
                      <Text style={styles.infoValue}>{report.bmi}</Text>
                    </View>
                  ) : null}
                </View>
                {report.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Doctor's Notes</Text>
                    <Text style={styles.notesText}>{report.notes}</Text>
                  </View>
                )}
              </Card>

              <Text style={styles.sectionTitle}>Detailed Panels</Text>
              
              {/* Detailed Panels */}
              {Object.entries(report.bloodPanelListMap).map(([key, markers], index) => {
                return (
                  <BloodPanelCard
                    key={index}
                    panelName={key}
                    markers={markers}
                  />
                );
              })}
            </>
          ) : (
             <Card style={styles.centerContainer}>
               <AlertCircle size={40} color={colors.text.light} style={{ marginBottom: spacing.md }} />
               <Text style={styles.loadingText}>No blood report data found for your account yet.</Text>
             </Card>
          )}

          <View style={{ height: 60 }} />
        </View>
        
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#D1DDD6',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  chartCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  infoCard: {
    padding: spacing.md,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: 80,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  notesBox: {
    backgroundColor: '#FAFBFA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#F2F5F2',
  },
  notesTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  notesText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    paddingLeft: 4,
  },
});
