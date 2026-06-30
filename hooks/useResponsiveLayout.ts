import { useWindowDimensions, Platform } from 'react-native';
import { spacing } from '@/constants/theme';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const headerPaddingTop = isMobile 
    ? (Platform.OS === 'ios' ? 60 : 40) // Standard safe area when tab is at bottom
    : (Platform.OS === 'ios' ? 90 + spacing.xl : 70 + spacing.xl); // Room for top tab bar

  const scrollPaddingBottom = isMobile 
    ? (Platform.OS === 'ios' ? 110 : 90) // Room for bottom tab bar
    : spacing.xl;

  return {
    isMobile,
    headerPaddingTop,
    scrollPaddingBottom,
  };
}
