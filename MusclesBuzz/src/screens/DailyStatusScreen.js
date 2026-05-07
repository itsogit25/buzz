import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, styles, Title } from '../components/UI';
import { today } from '../utils/date';
import { photoTags } from '../utils/constants';
import { selectImage } from '../utils/imagePicker';

export default function DailyStatusScreen() {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [weight, setWeight] = useState('');
  const [tag, setTag] = useState('full');
  const [uploading, setUploading] = useState(false);

  async function load() {
    const data = await api(`/status/daily?date=${date}`);
    setSummary(data);
    setWeight(data.body_weight ? String(data.body_weight) : '');
  }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, [date]);

  async function saveWeight() {
    await api('/status/weight', { method: 'PUT', body: JSON.stringify({ date, body_weight: weight }) });
    await load();
  }

  async function uploadPhoto() {
    try {
      setUploading(true);
      const asset = await selectImage();
      if (!asset?.uri) return;
      const data = new FormData();
      data.append('date', date);
      data.append('tag', tag);
      data.append('photo', { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || `${tag}.jpg` });
      await api('/photos', { method: 'POST', body: data });
      await load();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  }

  const n = summary?.nutrition || {};
  const rows = [
    ['Protein', `${Number(n.protein || 0).toFixed(1)} g`],
    ['Fat', `${Number(n.fat || 0).toFixed(1)} g`],
    ['Carbs', `${Number(n.carbs || 0).toFixed(1)} g`],
    ['Sodium', `${Number(n.sodium || 0).toFixed(1)} mg`],
    ['Water', `${Number(n.water || 0).toFixed(1)}`],
    ['Calories intake', `${Number(n.calories || 0).toFixed(0)} kcal`],
    ['Calories burned', `${Number(summary?.calories_burned || 0).toFixed(0)} kcal`],
    ['Net calories', `${Number(summary?.net_calories || 0).toFixed(0)} kcal`],
  ];

  return (
    <Screen>
      <Title>Daily Status</Title>
      <FlatList
        ListHeaderComponent={
          <>
            <Card>
              <Input label="Date YYYY-MM-DD" value={date} onChangeText={setDate} />
              {rows.map(([k, v]) => <Text key={k} style={{ marginBottom: 4 }}><Text style={{ fontWeight: '800' }}>{k}:</Text> {v}</Text>)}
            </Card>
            <Card>
              <Input label="Body weight" value={weight} onChangeText={setWeight} keyboardType="numeric" />
              <Button title="Save body weight" onPress={() => saveWeight().catch(e => Alert.alert('Error', e.message))} />
            </Card>
            <Card>
              <Text style={styles.label}>Photo tag</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {photoTags.map(t => <Pressable key={t} onPress={() => setTag(t)} style={{ padding: 10, borderRadius: 12, backgroundColor: tag === t ? '#f59e0b' : '#e5e7eb' }}><Text>{t}</Text></Pressable>)}
              </View>
              <Button title="Upload body photo" onPress={() => uploadPhoto().catch(e => Alert.alert('Error', e.message))} disabled={uploading} />
            </Card>
          </>
        }
        data={summary?.photos || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800' }}>{item.tag}</Text>
            <Image source={{ uri: item.image_url }} style={{ height: 220, borderRadius: 14, marginTop: 8 }} resizeMode="cover" />
          </Card>
        )}
      />
    </Screen>
  );
}
