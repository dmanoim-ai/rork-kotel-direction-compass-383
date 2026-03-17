import { Tabs } from 'expo-router';
import { Compass, MapPinned, FileText, Info, Clock } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.compass.gold,
        tabBarInactiveTintColor: Colors.compass.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.compass.background,
          borderTopColor: Colors.compass.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.compass'),
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="target"
        options={{
          title: t('tab.target'),
          tabBarIcon: ({ color, size }) => <MapPinned size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="zmanim"
        options={{
          title: t('tab.zmanim'),
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="terms"
        options={{
          title: t('tab.terms'),
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: t('tab.info'),
          tabBarIcon: ({ color, size }) => <Info size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="NativeMapView"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
