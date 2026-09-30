import { router } from 'expo-router';
import React from 'react';
import { Button, Empty, Page } from '../components/ui';
export default function NotFound() { return <Page><Empty title="That story took a wrong turn" body="This page doesn’t exist. Let’s get you back to the conversation." /><Button label="Back to the feed" onPress={() => router.replace('/')} /></Page>; }
