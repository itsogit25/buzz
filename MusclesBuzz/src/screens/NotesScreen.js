import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, Title } from '../components/UI';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  async function load() { setNotes(await api('/notes')); }
  useEffect(() => { load().catch(e => Alert.alert('Error', e.message)); }, []);

  async function save() {
    if (!note.trim()) return Alert.alert('Required', 'Note is required');
    await api('/notes', { method: 'POST', body: JSON.stringify({ title, note }) });
    setTitle(''); setNote(''); await load();
  }

  async function remove(id) {
    await api(`/notes/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <Screen>
      <Title>Personal Notes</Title>
      <FlatList
        ListHeaderComponent={
          <Card>
            <Input label="Title" value={title} onChangeText={setTitle} />
            <Input label="Note" value={note} onChangeText={setNote} />
            <Button title="Add note" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
          </Card>
        }
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '800' }}>{item.title || 'Note'}</Text>
            <Text>{item.note}</Text>
            <Button title="Delete" danger onPress={() => remove(item.id).catch(e => Alert.alert('Error', e.message))} />
          </Card>
        )}
      />
    </Screen>
  );
}
