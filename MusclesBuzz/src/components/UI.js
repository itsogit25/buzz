import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function Screen({ children }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Input({ label, value, onChangeText, keyboardType = 'default', placeholder }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder || label} />
    </View>
  );
}

export function Button({ title, onPress, danger, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, danger && styles.danger, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

export function Loader() {
  return <ActivityIndicator size="large" style={{ margin: 24 }} />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 12 },
  field: { marginBottom: 10 },
  label: { fontSize: 13, color: '#374151', fontWeight: '700', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, color: '#111827' },
  button: { backgroundColor: '#f59e0b', padding: 13, borderRadius: 14, alignItems: 'center', marginVertical: 6 },
  danger: { backgroundColor: '#dc2626' },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#111827', fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { color: '#6b7280' },
});
