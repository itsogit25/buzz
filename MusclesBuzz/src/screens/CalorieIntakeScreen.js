import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, styles, Title } from '../components/UI';
import { today } from '../utils/date';

export default function CalorieIntakeScreen() {
  const [foods, setFoods] = useState([]);
  const [logs, setLogs] = useState([]);
  const [foodId, setFoodId] = useState(null);
  const [date, setDate] = useState(today());
  const [grams, setGrams] = useState('');

  async function load() {
    const [f, l] = await Promise.all([api('/foods'), api(`/intakes?date=${date}`)]);
    setFoods(f); setLogs(l); if (!foodId && f[0]) setFoodId(f[0].id);
  }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, [date]);

  async function save() {
    if (!foodId) return Alert.alert('Add food first', 'Create a food in Food List tab first.');
    await api('/intakes', { method: 'POST', body: JSON.stringify({ food_id: foodId, date, consumed_grams: grams }) });
    setGrams(''); await load();
  }

  return (
    <Screen>
      <Title>Calorie Intake</Title>
      <FlatList
        ListHeaderComponent={
          <Card>
            <Input label="Date YYYY-MM-DD" value={date} onChangeText={setDate} />
            <Text style={styles.label}>Select food</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {foods.map(f => <Pressable key={f.id} onPress={() => setFoodId(f.id)} style={{ padding: 10, borderRadius: 12, backgroundColor: foodId === f.id ? '#f59e0b' : '#e5e7eb' }}><Text>{f.name}</Text></Pressable>)}
            </View>
            <Input label="Consumed grams" value={grams} onChangeText={setGrams} keyboardType="numeric" />
            <Button title="Add intake" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
          </Card>
        }
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800' }}>{item.foods?.name || 'Food'} - {item.consumed_grams}g</Text>
            <Text>Protein {Number(item.calculated_protein).toFixed(1)}g | Fat {Number(item.calculated_fat).toFixed(1)}g | Carbs {Number(item.calculated_carbs).toFixed(1)}g</Text>
            <Text>{Number(item.calculated_calories).toFixed(0)} kcal | Water {Number(item.calculated_water).toFixed(1)}</Text>
          </Card>
        )}
      />
    </Screen>
  );
}
