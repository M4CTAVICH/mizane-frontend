import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius as radiusTokens, shadow, spacing } from "../../constants/tokens";

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  /** NativeWind passthrough — applied to the outer (shadow) layer. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Blur strength (0–100). Higher = clearer "functional layer" glass. */
  intensity?: number;
  radius?: number;
  padding?: number;
  tint?: "dark" | "light" | "default";
  /** Slightly brighter body fill for pressed / prominent surfaces. */
  prominent?: boolean;
}

/**
 * LiquidGlassContainer — the FUNCTIONAL layer material (iOS 26 Liquid Glass).
 *
 * Use for floating tab bars, header bars, active inputs, and primary action
 * surfaces. It pairs a high-intensity clear blur with an explicit specular
 * "liquid" highlight: a top-edge light catch (LinearGradient) plus an ultra-fine
 * hairline border. Renders on iOS, Android, and Web (CSS backdrop-filter).
 *
 * For static cards and data lists use ContentCard instead — over-blurring the
 * content layer makes the UI visually exhausting.
 */
export function LiquidGlassContainer({
  children,
  className,
  style,
  intensity = 40,
  radius = radiusTokens.xl,
  padding = spacing.lg,
  tint = "dark",
  prominent = false,
}: LiquidGlassContainerProps) {
  return (
    // Outer layer carries the drop shadow (not clipped).
    <View className={className} style={[{ borderRadius: radius }, shadow.glass, style]}>
      {/* Inner layer clips the blur + specular edge to the rounded shape. */}
      <View style={[styles.clip, { borderRadius: radius }]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />

        {/* Translucent body — gives the glass mass on top of the blur. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: prominent ? colors.glassFillStrong : colors.glassFill },
          ]}
        />

        {/* Specular highlight — the asymmetric "liquid" light catch on the top edge. */}
        <LinearGradient
          colors={[colors.glassHighlight, "rgba(255,255,255,0.04)", "transparent"]}
          locations={[0, 0.16, 0.55]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.45, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={{ padding }}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder, // specular hairline edge
    backgroundColor: "transparent",
  },
});

export default LiquidGlassContainer;
