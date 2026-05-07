import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, styles, Title } from '../components/UI';
import { exerciseTags } from '../utils/constants';

const empty = { name: '', notes: '', body_part_tag: 'chest', manual_pr_weight: '', manual_pr_reps: '' };

export default function ExerciseListScreen() {
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(empty);

  async function load() { setExercises(await api('/exercises')); }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, []);

  async function save() {
    if (!form.name.trim()) return Alert.alert('Required', 'Exercise name is required');
    await api('/exercises', { method: 'POST', body: JSON.stringify(form) });
    setForm(empty); await load();
  }

  return (
    <Screen>
      <Title>Exercises</Title>
      <FlatList
        ListHeaderComponent={
          <Card>
            <Input label="Exercise name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <Input label="Notes" value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} />
            <Text style={styles.label}>Body part tag</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {exerciseTags.map(tag => <Pressable key={tag} onPress={() => setForm({ ...form, body_part_tag: tag })} style={{ padding: 10, borderRadius: 12, backgroundColor: form.body_part_tag === tag ? '#f59e0b' : '#e5e7eb' }}><Text>{tag}</Text></Pressable>)}
            </View>
            <Input label="Manual PR weight" value={form.manual_pr_weight} onChangeText={v => setForm({ ...form, manual_pr_weight: v })} keyboardType="numeric" />
            <Input label="Manual PR reps" value={form.manual_pr_reps} onChangeText={v => setForm({ ...form, manual_pr_reps: v })} keyboardType="numeric" />
            <Button title="Add exercise" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
          </Card>
        }
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800', fontSize: 18 }}>{item.name}</Text>
            <Text style={styles.muted}>{item.body_part_tag}</Text>
            <Text>PR: {item.manual_pr_weight || 0} kg x {item.manual_pr_reps || 0}</Text>
            {!!item.notes && <Text>{item.notes}</Text>}
          </Card>
        )}
      />
    </Screen>
  );
}
