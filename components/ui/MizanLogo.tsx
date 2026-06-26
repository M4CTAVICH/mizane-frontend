import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

// The Mizan mark — a gold scale-of-justice inside a mihrab arch (Figma node
// 5:139). Built from react-native-svg primitives (not SvgXml, which is not
// reliably exported on web) so it renders on iOS, Android, and web alike.
interface MizanLogoProps {
  size?: number;
}

export default function MizanLogo({ size = 104 }: MizanLogoProps) {
  const g = "url(#mizanGold)";
  return (
    <Svg width={size} height={size} viewBox="0 0 104 104" fill="none">
      <Defs>
        <LinearGradient
          id="mizanGold"
          x1="18.72"
          y1="6.24"
          x2="85.28"
          y2="97.76"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#F7DD8C" />
          <Stop offset="0.5" stopColor="#E0B64D" />
          <Stop offset="1" stopColor="#B07F2A" />
        </LinearGradient>
      </Defs>

      {/* Arch outline */}
      <Path
        d="M52 8.32C70.72 8.32 83.2 22.88 83.2 43.68V89.44C83.2 92.2133 81.8133 93.6 79.04 93.6H24.96C22.1867 93.6 20.8 92.2133 20.8 89.44V43.68C20.8 22.88 33.28 8.32 52 8.32Z"
        fill="#E0B64D"
        fillOpacity={0.05}
        stroke={g}
        strokeWidth={2.288}
        strokeLinejoin="round"
      />
      {/* Inner arch */}
      <Path
        opacity={0.4}
        d="M52 16.64C66.56 16.64 75.92 28.08 75.92 44.72V85.28H28.08V44.72C28.08 28.08 37.44 16.64 52 16.64Z"
        stroke={g}
        strokeWidth={0.832}
      />
      {/* Top pivot dot */}
      <Path
        d="M52 30.16C53.7231 30.16 55.12 28.7631 55.12 27.04C55.12 25.3169 53.7231 23.92 52 23.92C50.2769 23.92 48.88 25.3169 48.88 27.04C48.88 28.7631 50.2769 30.16 52 30.16Z"
        fill={g}
      />
      {/* Central beam */}
      <Path d="M52 30.16V70.72" stroke={g} strokeWidth={2.704} strokeLinecap="round" />
      {/* Scale arms */}
      <Path
        d="M31.2 41.6C45.0667 36.7467 58.9333 36.7467 72.8 41.6"
        stroke={g}
        strokeWidth={2.704}
        strokeLinecap="round"
      />
      <Path d="M32.24 41.6V50.96" stroke={g} strokeWidth={1.352} />
      <Path d="M71.76 41.6V50.96" stroke={g} strokeWidth={1.352} />
      {/* Left pan */}
      <Path
        opacity={0.95}
        d="M22.88 50.96C22.88 53.4424 23.8661 55.8232 25.6215 57.5785C27.3768 59.3339 29.7576 60.32 32.24 60.32C34.7224 60.32 37.1032 59.3339 38.8585 57.5785C40.6139 55.8232 41.6 53.4424 41.6 50.96H22.88Z"
        fill={g}
      />
      {/* Right pan */}
      <Path
        opacity={0.95}
        d="M62.4 50.96C62.4 53.4424 63.3861 55.8232 65.1415 57.5785C66.8968 59.3339 69.2776 60.32 71.76 60.32C74.2424 60.32 76.6232 59.3339 78.3785 57.5785C80.1339 55.8232 81.12 53.4424 81.12 50.96H62.4Z"
        fill={g}
      />
      {/* Base */}
      <Path d="M41.6 70.72H62.4" stroke={g} strokeWidth={2.704} strokeLinecap="round" />
      <Path
        opacity={0.7}
        d="M37.44 75.92H66.56"
        stroke={g}
        strokeWidth={2.288}
        strokeLinecap="round"
      />
    </Svg>
  );
}
