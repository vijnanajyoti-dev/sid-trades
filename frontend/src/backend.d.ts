import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewTradeData {
    key: string;
    currentPrice: string;
    duration: string;
    shares: string;
    ratedPerTrade: string;
    tradeType: string;
    riskPerTrade: string;
    contractNotes: string;
    exit: string;
    entry: string;
    position: string;
    potential: string;
}
export interface UserProfile {
    name: string;
}
export enum FieldVisibilityLevel {
    publicField = "publicField",
    premiumOnly = "premiumOnly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Delete a trade. Admin-only.
     */
    deleteTrade(key: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return the full visibility config. Admin-only.
     */
    getFieldVisibilityConfig(): Promise<Array<[string, FieldVisibilityLevel]>>;
    /**
     * / Return only the public-facing visibility info (no auth required).
     */
    getPublicFieldVisibility(): Promise<Array<[string, FieldVisibilityLevel]>>;
    /**
     * / Retrieve a single trade, with field-level visibility applied.
     */
    getTrade(key: string): Promise<NewTradeData | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Returns the role of the calling principal.
     */
    getUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all trades, with field-level visibility applied per caller role.
     */
    listTrades(): Promise<Array<NewTradeData>>;
    /**
     * / List all principals and their roles. Admin-only.
     */
    listUsers(): Promise<Array<[Principal, UserRole]>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Add or update a trade. Only authenticated users (non-guest) may write.
     */
    saveTrade(trade: NewTradeData): Promise<void>;
    /**
     * / Set visibility for a single field. Admin-only.
     */
    setFieldVisibility(field: string, level: FieldVisibilityLevel): Promise<void>;
    /**
     * / Assign a role to a principal. Admin-only (guard is inside assignRole).
     */
    setUserRole(user: Principal, role: UserRole): Promise<void>;
}
