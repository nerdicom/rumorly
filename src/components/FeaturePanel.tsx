import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export function FeaturePanel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ borderRadius: 26, padding: 24, gap: 14, backgroundColor: c.panel, borderColor: c.panelLine, borderWidth: 1 }, style]}>{children}</View>;
}
