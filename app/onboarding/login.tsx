import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { fetchMyProfile, fetchMyPlan, fetchMyReport } from '@/services/companionService';
import { LinearGradient } from 'expo-linear-gradient';
import { MailCheck, ShieldCheck, RefreshCw } from 'lucide-react-native';

const RESEND_COOLDOWN = 30; // seconds

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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);

  const OTP_EXPIRY_MS = 60 * 60 * 1000; // 1 hour (matches Supabase default)

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isValid = otpSent ? /^\d{8}$/.test(otp.trim()) : isEmailValid;

  const calculateAge = (birthMonth?: string) => {
    if (!birthMonth || !birthMonth.includes('-')) return undefined;
    const [year, month] = birthMonth.split('-').map(Number);
    if (!year || !month) return undefined;
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month) age -= 1;
    return age;
  };

  const sendOtp = async (emailAddr: string) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailAddr,
    });
    if (otpError) {
      if (otpError.status === 429) {
        throw new Error('Please wait before requesting another OTP.');
      }
      throw otpError;
    }
    startCooldown();
    setOtpSentAt(Date.now());
  };

  const handleContinue = async () => {
    if (!isValid || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError('');
    try {
      if (!otpSent) {
        await sendOtp(normalizedEmail);
        setOtpSent(true);
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp.trim(),
        type: 'email',
      });

      console.log('[Login] verifyOtp data:', JSON.stringify(data));
      console.log('[Login] verifyOtp error:', JSON.stringify(verifyError));

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
        program_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

      try {
        const sndPlan = await fetchMyPlan();
        if (sndPlan) setSndPlan(sndPlan);
        const report = await fetchMyReport();
        if (report) setCompanionReport(report);
      } catch (dataError) {
        console.warn('Could not fetch companion data:', dataError);
      }

      router.push('/onboarding/health-snapshot');
    } catch (err: any) {
      console.log('[Login] Error:', JSON.stringify(err));
      let message = 'Something went wrong. Please try again.';
      if (err instanceof Error || err?.message) {
        const msg = err.message || '';
        const isOtpError = msg.toLowerCase().includes('otp') ||
          msg.toLowerCase().includes('token') ||
          msg.toLowerCase().includes('expired');
        if (isOtpError) {
          const elapsed = otpSentAt ? Date.now() - otpSentAt : 0;
          if (elapsed >= OTP_EXPIRY_MS) {
            message = 'Your OTP has expired. Please request a new one.';
          } else {
            message = 'Incorrect OTP. Please double-check the 8-digit code.';
          }
        } else {
          message = msg;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError('');
    setOtp('');
    try {
      await sendOtp(normalizedEmail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not resend OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <LinearGradient colors={['#FAF9F6', '#FAF9F6', '#EAF2EB']} style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.appName}>MendRx</Text>
            <Text style={styles.title}>{otpSent ? 'Verify your email' : "Let's find your profile"}</Text>
            <Text style={styles.subtitle}>
              {otpSent
                ? `Enter the 8-digit code sent to ${normalizedEmail}.`
                : 'Use the email your practitioner added while onboarding your profile.'}
            </Text>
          </View>

          <Card variant="elevated" style={styles.card}>
            {!otpSent ? (
              <Input
                label="Email"
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
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
                  onChangeText={(text) => { setOtp(text.replace(/\s/g, '')); setError(''); }}
                  placeholder="Enter 8-digit code"
                  editable={!loading}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  maxLength={8}
                />
                <TouchableOpacity
                  style={[styles.resendRow, (resendCooldown > 0 || loading) && styles.resendDisabled]}
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  <RefreshCw size={13} color={resendCooldown > 0 ? colors.text.light : colors.primary} />
                  <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
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
                  if (cooldownRef.current) clearInterval(cooldownRef.current);
                  setResendCooldown(0);
                }}
                disabled={loading}
                variant="ghost"
                style={styles.secondaryButton}
              />
            ) : null}
          </Card>

          <View style={styles.securityWrapper}>
            <ShieldCheck size={16} color={colors.text.light} />
            <Text style={styles.securityText}>Prescription security & HIPAA privacy protected.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl * 1.5 : spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: { marginBottom: spacing.xl, paddingHorizontal: spacing.xs },
  appName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, lineHeight: 23 },
  card: { padding: spacing.lg, marginBottom: spacing.xl },
  button: { marginTop: spacing.sm },
  secondaryButton: { marginTop: spacing.sm },
  otpIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  otpHint: { ...typography.small, color: colors.primary, fontWeight: '600' },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  resendDisabled: { opacity: 0.5 },
  resendText: { ...typography.small, color: colors.primary, fontWeight: '600' },
  resendTextDisabled: { color: colors.text.light },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  securityWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, opacity: 0.8 },
  securityText: { ...typography.caption, color: colors.text.light },
});
