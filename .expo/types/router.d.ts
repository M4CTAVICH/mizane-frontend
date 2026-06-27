/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/language` | `/(auth)/otp` | `/(auth)/welcome` | `/(tabs)` | `/(tabs)/` | `/(tabs)/activity` | `/(tabs)/procedures` | `/(tabs)/scan-tab` | `/(tabs)/vault` | `/_sitemap` | `/activity` | `/language` | `/otp` | `/procedures` | `/profile` | `/scan` | `/scan-tab` | `/vault` | `/welcome`;
      DynamicRoutes: `/letter/${Router.SingleRoutePart<T>}` | `/procedure/${Router.SingleRoutePart<T>}` | `/vault/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/letter/[template]` | `/procedure/[id]` | `/vault/[id]`;
    }
  }
}
