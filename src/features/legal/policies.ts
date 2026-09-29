import { api } from "@/lib/api";
export const POLICY_VERSION = "2026-09-29";
export type PolicyInfo = {
  version: string;
  minimumAge: number;
  adolescentRegistrationAvailable: boolean;
  responsible: string | null;
  responsibleRole: string;
  supportEmail: string | null;
  approvedShops: string[];
};
export const getPolicies = () => api<{ data: PolicyInfo }>("/policies");
