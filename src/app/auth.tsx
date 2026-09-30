import { Redirect, router } from 'expo-router';
import React from 'react';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../store/AuthStore';
export default function AuthScreen() {
  const { user } = useAuth();
  if (user) return <Redirect href="/" />;
  return <AuthForm onBack={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}
