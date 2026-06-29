import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Footer from '@/components/Footer';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const isOnboarded = useStore((state) => state.isOnboarded);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/(tabs)');
      return;
    }

    // Parallel entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 15,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOnboarded]);

  if (isOnboarded) return null;

  return (
    <LinearGradient
      colors={['#FAF9F6', '#EAF2EB', '#FAF9F6']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.brandWrapper}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#2E5E43', '#1B3B2B']}
                style={styles.iconGradient}
              >
                <Heart size={36} color="#FFFFFF" strokeWidth={1.8} />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>MendRx</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Your personalized health companion</Text>
            <Text style={styles.subtitle}>
              Track metrics, view tailored diagnostic meal plans, and achieve optimal metabolic wellness under practitioner guidance.
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Button
            title="Begin Journey"
            onPress={() => router.push('/onboarding/login')}
            size="large"
          />
          <Text style={styles.footerText}>Secure Supabase HIPAA Compliant Cloud</Text>
        </Animated.View>
        <Footer />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: spacing.xs,
  },
  buttonContainer: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  footerText: {
    ...typography.caption,
    color: colors.text.light,
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: 0.5,
  },
});
