import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { BloodMarker } from '@/types/types';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import GaugeChart from './GaugeChart';

interface BloodPanelCardProps {
  panelName: string;
  markers: BloodMarker[];
}

export default function BloodPanelCard({ panelName, markers }: BloodPanelCardProps) {
  const [showOptimal, setShowOptimal] = useState(false);

  // Parse the panel key if it's JSON (backend returns JSON stringified BloodPanel as key)
  let parsedName = panelName;
  let healthScore = '';
  let status = '';

  try {
    const parsed = JSON.parse(panelName);
    parsedName = parsed.name || panelName;
    healthScore = parsed.healthScore || '';
    status = parsed.status || '';
  } catch (e) {
    // If not JSON, use as is
  }

  const deviatedMarkers = markers.filter(m => m.result !== 'OPTIMAL' && m.result !== 'NORMAL');
  const optimalMarkers = markers.filter(m => m.result === 'OPTIMAL' || m.result === 'NORMAL');

  const getStatusColor = (s: string) => {
    switch (s.toUpperCase()) {
      case 'GOOD': return colors.success;
      case 'FAIR': return '#FFA726';
      case 'POOR': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const renderMarkerResultBadge = (result: string) => {
    if (result === 'HIGH') {
      return (
        <View style={[styles.badge, styles.badgeHigh]}>
          <Text style={styles.badgeHighText}>HIGH</Text>
        </View>
      );
    }
    if (result === 'LOW') {
      return (
        <View style={[styles.badge, styles.badgeLow]}>
          <Text style={styles.badgeLowText}>LOW</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgeOptimal]}>
        <Text style={styles.badgeOptimalText}>OPTIMAL</Text>
      </View>
    );
  };

  return (
    <Card variant="elevated" style={styles.card}>
      {/* Panel Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{parsedName}</Text>
          {status ? (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>{status}</Text>
            </View>
          ) : null}
        </View>
        {healthScore ? (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{healthScore}</Text>
          </View>
        ) : null}
      </View>

      {/* Deviated Markers */}
      {deviatedMarkers.length > 0 ? (
        <View style={styles.deviatedSection}>
          {deviatedMarkers.map((marker, index) => (
            <View key={index} style={styles.markerBlock}>
              <View style={styles.markerHeader}>
                <View style={styles.markerNameRow}>
                  <AlertCircle size={16} color={marker.result === 'HIGH' ? colors.error : '#FFA726'} />
                  <Text style={styles.markerName}>{marker.parameterName}</Text>
                </View>
                {renderMarkerResultBadge(marker.result)}
              </View>

              <View style={styles.valueRow}>
                <View style={styles.valueBox}>
                  <Text style={styles.valueNumber}>{marker.value}</Text>
                  <Text style={styles.valueUnit}>{marker.units}</Text>
                </View>
                <View style={styles.gaugeWrapper}>
                  <GaugeChart 
                    deviation={marker.deviation}
                    result={marker.result}
                    minValue={marker.parameterInfo?.minValue || 0}
                    maxValue={marker.parameterInfo?.maxValue || 0}
                    units={marker.units}
                  />
                </View>
              </View>

              {marker.reason && (
                <View style={styles.reasonBox}>
                  <View style={styles.reasonHeader}>
                    <Info size={14} color={colors.primary} />
                    <Text style={styles.reasonTitle}>Possible Reasons</Text>
                  </View>
                  <View style={styles.reasonList}>
                    {marker.reason.split(/(?<=\.)\s+/).filter(r => r.trim()).map((reason, idx) => (
                      <View key={idx} style={styles.reasonBulletRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.reasonText}>{reason.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.allOptimalBox}>
          <CheckCircle2 size={20} color={colors.success} />
          <Text style={styles.allOptimalText}>All markers in this panel are optimal</Text>
        </View>
      )}

      {/* Optimal Markers Toggle */}
      {optimalMarkers.length > 0 && (
        <View style={styles.optimalSection}>
          <TouchableOpacity 
            style={styles.optimalToggle}
            onPress={() => setShowOptimal(!showOptimal)}
            activeOpacity={0.7}
          >
            <Text style={styles.optimalToggleText}>
              {showOptimal ? 'Hide' : 'Show'} {optimalMarkers.length} Optimal Markers
            </Text>
            {showOptimal ? (
              <ChevronUp size={16} color={colors.text.secondary} />
            ) : (
              <ChevronDown size={16} color={colors.text.secondary} />
            )}
          </TouchableOpacity>

          {showOptimal && (
            <View style={styles.optimalList}>
              {optimalMarkers.map((marker, idx) => (
                <View key={idx} style={styles.optimalRow}>
                  <Text style={styles.optimalName}>{marker.parameterName}</Text>
                  <View style={styles.optimalValueBox}>
                    <Text style={styles.optimalValue}>{marker.value}</Text>
                    <Text style={styles.optimalUnit}>{marker.units}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FAFBFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F5F2',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#EAF2EB',
  },
  scoreLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.light,
  },
  scoreValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
  },
  deviatedSection: {
    padding: spacing.md,
  },
  markerBlock: {
    marginBottom: spacing.xl,
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  markerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  markerName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeHigh: {
    backgroundColor: '#FFF0F0',
  },
  badgeHighText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.error,
    fontWeight: '700',
  },
  badgeLow: {
    backgroundColor: '#FFF8E6',
  },
  badgeLowText: {
    ...typography.caption,
    fontSize: 10,
    color: '#B2821D',
    fontWeight: '700',
  },
  badgeOptimal: {
    backgroundColor: '#EAF2EB',
  },
  badgeOptimalText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingLeft: 24,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valueNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  valueUnit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  gaugeWrapper: {
    transform: [{ scale: 0.9 }],
  },
  reasonBox: {
    backgroundColor: '#FAFBFA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F2F5F2',
    marginLeft: 24,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  reasonTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  reasonList: {
    gap: 6,
  },
  reasonBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  reasonText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  allOptimalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#EAF2EB',
  },
  allOptimalText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '500',
  },
  optimalSection: {
    borderTopWidth: 1,
    borderTopColor: '#F2F5F2',
  },
  optimalToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  optimalToggleText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  optimalList: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  optimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAF9',
  },
  optimalName: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  optimalValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  optimalValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.success,
  },
  optimalUnit: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.light,
  },
});
