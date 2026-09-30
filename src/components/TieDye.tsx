import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const texture = require('../../assets/tie-dye.jpg');

/** Decorative only: a bundled texture needs no network or native dependency. */
export function TieDyeBackdrop({ wash = 0 }: { wash?: number }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Image source={texture} accessible={false} resizeMode="cover" style={styles.image} />
    {wash > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255, 255, 255, ${wash})` }]} />}
  </View>;
}

export function TieDyePanel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={styles.panel}>
    <TieDyeBackdrop />
    <View style={[styles.content, style]}>{children}</View>
  </View>;
}

const styles = StyleSheet.create({
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  panel: { borderRadius: 28, overflow: 'hidden', padding: 12, paddingTop: 42, backgroundColor: '#F3DBFF' },
  content: { borderRadius: 19, padding: 20, gap: 12, backgroundColor: 'rgba(255, 255, 255, 0.94)' },
});
