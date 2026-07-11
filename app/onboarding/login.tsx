import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { fetchMyProfile, fetchMyPlan, fetchMyReport } from '@/services/companionService';
import { LinearGradient } from 'expo-linear-gradient';
import { MailCheck, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const setClient = useStore((state) => state.setClient);
  const setSndPlan = useStore((state) => state.setSndPlan);
  const setCompanionReport = useStore((state) => state.setCompanionReport);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isValid = otpSent ? otp.trim().length >= 4 : isEmailValid;

  const calculateAge = (birthMonth?: string) => {
    if (!birthMonth || !birthMonth.includes('-')) return undefined;

    const [year, month] = birthMonth.split('-').map(Number);
    if (!year || !month) return undefined;

    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month) {
      age -= 1;
    }
    return age;
  };

  const handleContinue = async () => {
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      if (!otpSent) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
        });

        if (otpError) {
          throw otpError;
        }

        setOtpSent(true);
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp.trim(),
        type: 'email',
      });

      if (verifyError) {
        throw verifyError;
      }

      const client = await fetchMyProfile();

      if (!client) {
        setError('No client profile is linked to this email. Please contact your practitioner.');
        setLoading(false);
        return;
      }

      setClient(client);

      setUser({
        id: client.id,
        phone_number: client.phoneNumber || '',
        name: client.name,
        age: calculateAge(client.birthMonth),
        subscription_status: 'active',
        program_start_date: new Date().toISOString(),
        program_end_date: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      try {
        const sndPlan = await fetchMyPlan();
        if (sndPlan) {
          setSndPlan(sndPlan);
        }
        
        const report = await fetchMyReport();
        if (report) {
          setCompanionReport(report);
        }
      } catch (dataError) {
        console.warn('Could not fetch companion data:', dataError);
      }

      router.push('/onboarding/health-snapshot');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FAF9F6', '#FAF9F6', '#EAF2EB']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
              <Text style={styles.appName}>MendRx</Text>
            <Text style={styles.title}>
              {otpSent ? 'Verify your email' : "Let's find your profile"}
            </Text>
            <Text style={styles.subtitle}>
              {otpSent
                ? `Enter the one-time code sent to ${normalizedEmail}.`
                : 'Use the email your practitioner added while onboarding your profile.'}
            </Text>
          </View>

          <Card variant="elevated" style={styles.card}>
            {!otpSent ? (
              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                placeholder="you@example.com"
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            ) : (
              <>
                <View style={styles.otpIconRow}>
                  <MailCheck size={18} color={colors.primary} />
                  <Text style={styles.otpHint}>OTP sent successfully</Text>
                </View>
                <Input
                  label="One-time code"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/\s/g, ''));
                    setError('');
                  }}
                  placeholder="Enter OTP"
                  editable={!loading}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                />
              </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title={otpSent ? 'Verify & Continue' : 'Send OTP'}
              onPress={handleContinue}
              disabled={!isValid || loading}
              loading={loading}
              style={styles.button}
            />
            {otpSent && !loading ? (
              <Button
                title="Use a different email"
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                disabled={loading}
                variant="ghost"
                style={styles.secondaryButton}
              />
            ) : null}
          </Card>

          <View style={styles.securityWrapper}>
            <ShieldCheck size={16} color={colors.text.light} />
            <Text style={styles.securityText}>
              Prescription security & HIPAA privacy protected.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl * 1.5 : spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  appName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 23,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  otpIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  otpHint: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  securityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    opacity: 0.8,
  },
  securityText: {
    ...typography.caption,
    color: colors.text.light,
  },
});

