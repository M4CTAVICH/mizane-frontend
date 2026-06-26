import { Redirect } from "expo-router";

// This tab is just a placeholder — the scan button in the layout opens /scan modal
export default function ScanTab() {
  return <Redirect href="/scan" />;
}
