import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, Input, Screen, Title } from '../components/UI';
import { selectImage } from '../utils/imagePicker';

export default function ProfileScreen() {
  const [form, setForm] = useState({ name: '', profile_picture_url: '', country: '', age: '', language: 'en', theme: 'light' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api('/profile').then(p => { if (p) setForm({ ...form, ...p, age: p.age ? String(p.age) : '' }); }).catch(e => Alert.alert('Error', e.message));
  }, []);

  async function selectProfilePicture() {
    try {
      setUploading(true);
      const asset = await selectImage();
      if (!asset?.uri) return;

      const data = new FormData();
      data.append('profile', { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || 'profile.jpg' });
      const response = await api('/profile/picture', { method: 'POST', body: data });
      setForm({ ...form, profile_picture_url: response.profile_picture_url });
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    await api('/profile', { method: 'PUT', body: JSON.stringify({ ...form, age: form.age ? Number(form.age) : null }) });
    Alert.alert('Saved', 'Profile updated');
  }

  return (
    <Screen>
      <ScrollView>
        <Title>Profile</Title>
        <Card>
          {form.profile_picture_url && (
            <Image source={{ uri: form.profile_picture_url }} style={{ height: 200, borderRadius: 14, marginBottom: 12 }} resizeMode="cover" />
          )}
          <Button title="Select profile picture" onPress={selectProfilePicture} disabled={uploading} />
          <Input label="Name" value={form.name || ''} onChangeText={v => setForm({ ...form, name: v })} />
          <Input label="Country" value={form.country || ''} onChangeText={v => setForm({ ...form, country: v })} />
          <Input label="Age" value={form.age || ''} onChangeText={v => setForm({ ...form, age: v })} keyboardType="numeric" />
          <Button title="Save profile" onPress={() => save().catch(e => Alert.alert('Error', e.message))} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
