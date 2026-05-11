import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppRoute, AppRouteId } from '../navigation/appRoutes';

interface RouteTabsProps {
  readonly routes: readonly AppRoute[];
  readonly activeRoute: AppRouteId;
  readonly onChange: (route: AppRouteId) => void;
}

export function RouteTabs({ routes, activeRoute, onChange }: RouteTabsProps) {
  return (
    <View style={styles.container}>
      {routes.map((route) => {
        const active = route.id === activeRoute;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={route.id}
            onPress={() => onChange(route.id)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.tabText, active && styles.activeTabText]}>{route.shortLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e8edf3',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  tabText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0f172a',
  },
});
