import api from "./api";

export interface EscalationAlert {
  id: string;
  department: "Technology" | "Operations";
  category: string;
  issue_count: number;
  risk_score: number;
  severity: "High" | "Critical";
  notify: string[];
  error: string;
  why_it_occurred: string;
  productivity_loss: string;
  reputation_risk: string;
  recommended_action: string;
  assigned_executive: "CTO" | "COO";
}

export const getEscalationAlerts = async (): Promise<EscalationAlert[]> => {
  const response = await api.get("/alerts/escalations");
  return response.data;
};
