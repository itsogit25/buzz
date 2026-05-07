import React, { useState, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Button, Input, Screen, Title } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const submitInProgress = useRef(false);

  async function submit() {
    // Prevent multiple simultaneous submissions
    if (submitInProgress.current || busy) return;
    
    try {
      submitInProgress.current = true;
      setBusy(true);
      if (mode === 'login') await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
    } catch (error) {
      const message = error.message || 'Authentication failed';
      // Provide better feedback for rate limit errors
      if (message.includes('rate') || message.includes('too many')) {
        Alert.alert('Too many attempts', 'Please wait a moment before trying again.');
      } else {
        Alert.alert('Auth error', message);
      }
    } finally {
      submitInProgress.current = false;
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={{ fontSize: 42, fontWeight: '900', color: '#f59e0b', marginTop: 60 }}>MusclesBuzz</Text>
        <Title>{mode === 'login' ? 'Login' : 'Create account'}</Title>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} />
        <Button title={mode === 'login' ? 'Login' : 'Sign up'} onPress={submit} disabled={busy} />
        <Button title={mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
