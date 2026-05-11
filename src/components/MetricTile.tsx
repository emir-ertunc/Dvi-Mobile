import { StyleSheet, Text, View } from 'react-native';

interface MetricTileProps {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

export function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 132,
    padding: 14,
    gap: 8,
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  value: {
    color: '#0f172a',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  detail: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
