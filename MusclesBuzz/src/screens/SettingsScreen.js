import React from 'react';
import { Alert, Text } from 'react-native';
import { Button, Card, Screen, Title } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <Screen>
      <Title>Settings</Title>
      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 6 }}>Theme</Text>
        <Text>Light/Dark settings are stored in profile. Full app theming can be added next.</Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 6 }}>Language</Text>
        <Text>Language preference is stored in profile. Add i18n files next.</Text>
      </Card>
      <Button title="Logout" onPress={() => signOut()} />
      <Button title="Delete account" danger onPress={() => Alert.alert('Delete account', 'For safety, implement this as a backend endpoint with confirmation.')} />
    </Screen>
  );
}
