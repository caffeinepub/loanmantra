import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    id: bigint;
    age: bigint;
    pan: string;
    salary: string;
    loanAmount: bigint;
    callStatus: CallStatus;
    cibil: bigint;
    name: string;
    email: string;
    abVariant: string;
    timestamp: bigint;
    phone: string;
    selectedLenders: Array<string>;
}
export interface ABTestVariants {
    variantA: bigint;
    variantB: bigint;
    variantC: bigint;
}
export interface LeadsStats {
    convertedCount: bigint;
    totalLeads: bigint;
    totalRevenueEstimate: bigint;
}
export interface Lender {
    id: bigint;
    maxAmount: bigint;
    processingFee: string;
    minCibil: bigint;
    name: string;
    badges: Array<string>;
    interestRate: string;
    category: string;
}
export interface UserProfile {
    name: string;
}
export enum CallStatus {
    closed = "closed",
    pending = "pending",
    contacted = "contacted",
    converted = "converted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeads(): Promise<Array<Lead>>;
    getLeadsStats(): Promise<LeadsStats>;
    getLenders(): Promise<Array<Lender>>;
    getLendersByCibil(minCibil: bigint): Promise<Array<Lender>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVariantStats(): Promise<ABTestVariants>;
    initLenders(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    recordVariant(variant: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitLead(name: string, phone: string, email: string, salary: string, age: bigint, pan: string, cibil: bigint, loanAmount: bigint, selectedLenders: Array<string>, abVariant: string): Promise<bigint>;
    updateLeadStatus(leadId: bigint, status: CallStatus): Promise<void>;
}
