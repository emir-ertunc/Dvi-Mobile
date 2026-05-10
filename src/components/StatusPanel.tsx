import { StyleSheet, Text, View } from 'react-native';

interface StatusPanelProps {
  title: string;
  rows: Array<[string, string]>;
}

export function StatusPanel({ title, rows }: StatusPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rows}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  rows: {
    gap: 10,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#edf0f4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  label: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
});
