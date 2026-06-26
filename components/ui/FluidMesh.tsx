import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * FluidMesh — the backdrop for the Mizan dark theme.
 *
 * Sits at the very back of the canvas (z-0), behind every surface. A flat
 * neutral near-black canvas — the ambient colour gradients were removed, so
 * every screen reads on a clean solid background.
 *
 * Purely decorative — never receives touches.
 */
export default function FluidMesh() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: "#050506" }]}
      pointerEvents="none"
    />
  );
}
