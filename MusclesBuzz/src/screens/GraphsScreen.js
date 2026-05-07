import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../api/client';
import { Card, Input, Screen, Title } from '../components/UI';
import { photoTags } from '../utils/constants';

function Chart({ title, rows, valueKey }) {
  if (!rows?.length) return <Card><Text>{title}: no data yet</Text></Card>;
  const labels = rows.slice(-7).map(r => String(r.date).slice(5));
  const data = rows.slice(-7).map(r => Number(r[valueKey] || 0));
  return (
    <Card>
      <Text style={{ fontWeight: '800', marginBottom: 8 }}>{title}</Text>
      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={Dimensions.get('window').width - 64}
        height={220}
        chartConfig={{ backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', decimalPlaces: 0, color: () => '#f59e0b', labelColor: () => '#111827' }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </Card>
  );
}

export default function GraphsScreen() {
  const [graphs, setGraphs] = useState(null);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [tag, setTag] = useState('full');
  const [photos, setPhotos] = useState([]);

  async function load() { setGraphs(await api('/status/graphs')); }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, []);

  async function compare() {
    const [p1, p2] = await Promise.all([api(`/photos?date=${date1}&tag=${tag}`), api(`/photos?date=${date2}&tag=${tag}`)]);
    setPhotos([p1[0], p2[0]].filter(Boolean));
  }

  return (
    <Screen>
      <ScrollView>
        <Title>Graphs</Title>
        <Chart title="Body Weight" rows={graphs?.weights || []} valueKey="body_weight" />
        <Chart title="Calorie Intake" rows={graphs?.calorie_intake || []} valueKey="calories" />
        <Chart title="Calorie Expense" rows={graphs?.calorie_expense || []} valueKey="calories" />
        <Card>
          <Text style={{ fontWeight: '800', marginBottom: 8 }}>Compare Photos</Text>
          <Input label="Date 1 YYYY-MM-DD" value={date1} onChangeText={setDate1} />
          <Input label="Date 2 YYYY-MM-DD" value={date2} onChangeText={setDate2} />
          <Input label={`Tag: ${photoTags.join(', ')}`} value={tag} onChangeText={setTag} />
          <Text onPress={() => compare().catch(e => Alert.alert('Error', e.message))} style={{ color: '#f59e0b', fontWeight: '900', paddingVertical: 10 }}>Compare</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {photos.map(p => <Image key={p.id} source={{ uri: p.image_url }} style={{ flex: 1, height: 240, borderRadius: 14 }} />)}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
