import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

import HomeScreen    from '../screens/HomeScreen';
import FitnessScreen from '../screens/FitnessScreen';
import MediaScreen   from '../screens/MediaScreen';
import TasksScreen   from '../screens/TasksScreen';
import NewsScreen    from '../screens/NewsScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IoniconName; iconActive: IoniconName; screen: React.ComponentType<any>; accent: string }[] = [
  { name: 'Home',    label: 'Home',    icon: 'home-outline',           iconActive: 'home',           screen: HomeScreen,    accent: colors.weather  },
  { name: 'Fitness', label: 'Train',   icon: 'fitness-outline',        iconActive: 'fitness',        screen: FitnessScreen, accent: colors.fitness  },
  { name: 'Media',   label: 'Media',   icon: 'musical-notes-outline',  iconActive: 'musical-notes',  screen: MediaScreen,   accent: colors.spotify  },
  { name: 'Tasks',   label: 'Tasks',   icon: 'checkbox-outline',       iconActive: 'checkbox',       screen: TasksScreen,   accent: colors.notion   },
  { name: 'News',    label: 'News',    icon: 'newspaper-outline',      iconActive: 'newspaper',      screen: NewsScreen,    accent: colors.news     },
];

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          return {
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarBackground: () => (
              <View style={styles.tabBarBg} />
            ),
            tabBarActiveTintColor: tab?.accent || colors.textPrimary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={focused ? 24 : 22}
                color={color}
              />
            ),
          };
        }}
      >
        {TABS.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.screen}
            options={{ title: tab.label }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: 'rgba(8,13,26,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
