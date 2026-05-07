import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, styles, Title } from '../components/UI';

const empty = { name: '', protein_per_100g: '', fat_per_100g: '', carbs_per_100g: '', sodium_per_100g: '', calories_per_100g: '', water_per_100g: '' };

export default function FoodListScreen() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(empty);

  async function load() { setFoods(await api('/foods')); }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, []);

  async function save() {
    if (!form.name.trim()) return Alert.alert('Required', 'Food name is required');
    await api('/foods', { method: 'POST', body: JSON.stringify(form) });
    setForm(empty);
    await load();
  }

  async function remove(id) {
    await api(`/foods/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <Screen>
      <Title>Food List</Title>
      <FlatList
        ListHeaderComponent={
          <Card>
            <Input label="Product name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <Input label="Protein / 100g" value={form.protein_per_100g} onChangeText={v => setForm({ ...form, protein_per_100g: v })} keyboardType="numeric" />
            <Input label="Fat / 100g" value={form.fat_per_100g} onChangeText={v => setForm({ ...form, fat_per_100g: v })} keyboardType="numeric" />
            <Input label="Carbs / 100g" value={form.carbs_per_100g} onChangeText={v => setForm({ ...form, carbs_per_100g: v })} keyboardType="numeric" />
            <Input label="Sodium / 100g" value={form.sodium_per_100g} onChangeText={v => setForm({ ...form, sodium_per_100g: v })} keyboardType="numeric" />
            <Input label="Calories / 100g" value={form.calories_per_100g} onChangeText={v => setForm({ ...form, calories_per_100g: v })} keyboardType="numeric" />
            <Input label="Water / 100g" value={form.water_per_100g} onChangeText={v => setForm({ ...form, water_per_100g: v })} keyboardType="numeric" />
            <Button title="Add food" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
          </Card>
        }
        data={foods}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800', fontSize: 18 }}>{item.name}</Text>
            <Text style={styles.muted}>P {item.protein_per_100g}g | F {item.fat_per_100g}g | C {item.carbs_per_100g}g | {item.calories_per_100g} kcal /100g</Text>
            <Button title="Delete" danger onPress={() => remove(item.id).catch(e => Alert.alert('Error', e.message))} />
          </Card>
        )}
      />
    </Screen>
  );
}
