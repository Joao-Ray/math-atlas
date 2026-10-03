import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet, Text } from 'react-native';

import { palette } from '@/constants/Theme';

function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={[styles.icon, { color }]}>{icon}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: '#8D948F',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: '首页', tabBarIcon: ({ color }) => <TabIcon icon="⌂" color={color} /> }}
      />
      <Tabs.Screen
        name="topics"
        options={{ title: '知识', tabBarIcon: ({ color }) => <TabIcon icon="◇" color={color} /> }}
      />
      <Tabs.Screen
        name="formulas"
        options={{ title: '公式', tabBarIcon: ({ color }) => <TabIcon icon="ƒ" color={color} /> }}
      />
      <Tabs.Screen
        name="problems"
        options={{ title: '例题', tabBarIcon: ({ color }) => <TabIcon icon="✦" color={color} /> }}
      />
      <Tabs.Screen
        name="papers"
        options={{ title: '论文', tabBarIcon: ({ color }) => <TabIcon icon="⌁" color={color} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', height: 78, paddingTop: 8, paddingBottom: 12,
    backgroundColor: 'rgba(255,253,247,0.98)', borderTopColor: palette.line,
  },
  label: { fontSize: 11, fontWeight: '700' },
  icon: { fontSize: 23, lineHeight: 25, fontWeight: '700' },
});
