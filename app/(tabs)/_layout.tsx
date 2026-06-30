import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { House, ChartLine, CalendarDays, CircleUserRound, ClipboardList, FileText } from 'lucide-react-native';
import { colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function TabLayout() {
  const client = useStore((state) => state.client);

  if (!client) {
    return <Redirect href="/" />;
  }

  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const dynamicTabBarStyle = {
    ...styles.tabBar,
    top: isMobile ? undefined : 0,
    bottom: isMobile ? 0 : undefined,
    borderBottomWidth: isMobile ? 0 : 1,
    borderTopWidth: isMobile ? 1 : 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: !isMobile && Platform.OS === 'ios' ? 40 : 0,
    paddingBottom: isMobile && Platform.OS === 'ios' ? 20 : 0,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.light,
        tabBarStyle: dynamicTabBarStyle,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <House size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <ClipboardList size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          href: null,
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FileText size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <CalendarDays size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <CircleUserRound size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    top: 0, // Docked to the very top
    left: 0,
    right: 0,
    backgroundColor: '#ffffff', // Solid white
    borderWidth: 0, // Remove side borders
    borderColor: '#E9EDE9',
    ...shadows.sm,
    elevation: 4,
    zIndex: 100,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 12,
    marginBottom: 2,
  },
  tabBarItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
    position: 'relative',
    marginTop: 4,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});

