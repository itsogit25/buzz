import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, styles, Title } from '../components/UI';
import { today } from '../utils/date';
import { exerciseTags } from '../utils/constants';

export default function ExerciseDoneScreen() {
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [date, setDate] = useState(today());
  const [tag, setTag] = useState('chest');
  const [exerciseId, setExerciseId] = useState(null);
  const [setsText, setSetsText] = useState('10x20,8x25,6x30');
  const [calories, setCalories] = useState('');
  const [duration, setDuration] = useState('');
  const [speed, setSpeed] = useState('');
  const [steps, setSteps] = useState('');

  async function load() {
    const [e, s] = await Promise.all([api('/exercises'), api(`/workouts?date=${date}`)]);
    setExercises(e); setSessions(s); if (!exerciseId && e[0]) setExerciseId(e[0].id);
  }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, [date]);

  const filtered = exercises.filter(e => e.body_part_tag === tag);

  function parseSets() {
    return setsText.split(',').map(x => x.trim()).filter(Boolean).map(x => {
      const [reps, weight] = x.toLowerCase().split('x');
      return { reps: Number(reps || 0), weight: Number(weight || 0) };
    });
  }

  async function save() {
    const selected = exerciseId || filtered[0]?.id || exercises[0]?.id;
    if (!selected) return Alert.alert('Add exercise first', 'Create exercise in Exercises tab.');
    await api('/workouts', { method: 'POST', body: JSON.stringify({ date, entries: [{ exercise_id: selected, body_part_tag: tag, calories_burned: calories, duration_minutes: duration, speed, steps, sets: parseSets() }] }) });
    setCalories(''); await load();
  }

  return (
    <Screen>
      <Title>Exercise Done</Title>
      <FlatList
        ListHeaderComponent={
          <Card>
            <Input label="Date YYYY-MM-DD" value={date} onChangeText={setDate} />
            <Text style={styles.label}>Body part</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {exerciseTags.map(t => <Pressable key={t} onPress={() => { setTag(t); const first = exercises.find(e => e.body_part_tag === t); setExerciseId(first?.id || null); }} style={{ padding: 10, borderRadius: 12, backgroundColor: tag === t ? '#f59e0b' : '#e5e7eb' }}><Text>{t}</Text></Pressable>)}
            </View>
            <Text style={styles.label}>Exercise</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {(filtered.length ? filtered : exercises).map(e => <Pressable key={e.id} onPress={() => setExerciseId(e.id)} style={{ padding: 10, borderRadius: 12, backgroundColor: exerciseId === e.id ? '#f59e0b' : '#e5e7eb' }}><Text>{e.name}</Text></Pressable>)}
            </View>
            <Input label="Sets format: repsxweight,repsxweight" value={setsText} onChangeText={setSetsText} />
            <Input label="Calories burned" value={calories} onChangeText={setCalories} keyboardType="numeric" />
            <Input label="Running/walking duration minutes" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <Input label="Running speed" value={speed} onChangeText={setSpeed} keyboardType="numeric" />
            <Input label="Walking steps" value={steps} onChangeText={setSteps} keyboardType="numeric" />
            <Button title="Add exercise for day" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
          </Card>
        }
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800' }}>{item.date}</Text>
            {(item.workout_entries || []).map(entry => <Text key={entry.id}>{entry.exercises?.name} - {entry.calories_burned} kcal</Text>)}
          </Card>
        )}
      />
    </Screen>
  );
}
