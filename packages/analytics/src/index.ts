export type AnalyticsConsent = "necessary" | "analytics" | "all";
export interface AnalyticsAdapter { page(path: string): void; event(name: string, properties?: Record<string, string | number>): void }
