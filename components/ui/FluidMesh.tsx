import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

/**
 * FluidMesh — the underlying ambient light layer for the Obsidian Dark theme.
 *
 * Sits at the very back of the canvas (z-0), behind every glass surface, and
 * injects ultra-soft, low-opacity colored blobs into pitch black so the Liquid
 * Glass above it has colored light to refract:
 *   · deep Royal Indigo  (top)    — rgba(99,102,241, …)
 *   · dark Emerald/Cyan  (bottom) — rgba(20,184,166, …)
 *
 * Purely decorative — never receives touches.
 */
export default function FluidMesh() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="meshIndigo" cx="78%" cy="10%" r="70%">
            <Stop offset="0%" stopColor="#6366F1" stopOpacity={0.14} />
            <Stop offset="55%" stopColor="#6366F1" stopOpacity={0.035} />
            <Stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="meshCyan" cx="14%" cy="92%" r="72%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity={0.1} />
            <Stop offset="55%" stopColor="#14B8A6" stopOpacity={0.025} />
            <Stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {/* True pitch-black base */}
        <Rect x="0" y="0" width="100%" height="100%" fill="#000000" />
        {/* Ambient colored light */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#meshIndigo)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#meshCyan)" />
      </Svg>
    </View>
  );
}
