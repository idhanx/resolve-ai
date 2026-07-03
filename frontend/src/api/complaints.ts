import api from "./api";

export interface ComplaintCreatePayload {
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  manager: string;
  title: string;
  description: string;
  submission_type?: "Feedback" | "Concern" | "Suggestion" | "Survey";
}

export interface ComplaintResponse {
  id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  manager: string;
  assigned_manager_id?: string;
  title: string;
  description: string;
  submission_type?: "Feedback" | "Concern" | "Suggestion" | "Survey";
  category: string;
  confidence: number;
  severity: string;
  priority: string;
  executive_summary: string;
  recommendation: string;
  business_impact: string;
  policy_evidence?: Array<{
    id?: string;
    source_type?: string;
    title?: string;
    category?: string;
    department?: string;
    owner?: string;
    citation?: string;
    score?: number;
    matched_terms?: string[];
    content?: string;
    recommended_action?: string;
  }>;
  action_plan?: Record<string, unknown> | null;
  verification?: Record<string, unknown> | null;
  status: string;
  routing_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintLifecyclePayload {
  status?: string;
  manager?: string;
  assigned_manager_id?: string;
  priority?: string;
  resolution?: string;
  action_plan?: Record<string, unknown> | null;
  verification?: Record<string, unknown> | null;
}

export const createComplaint = async (data: ComplaintCreatePayload): Promise<ComplaintResponse> => {
  const response = await api.post("/complaints/", data);
  return response.data;
};

export const getMyComplaints = async (): Promise<ComplaintResponse[]> => {
  const response = await api.get("/complaints/");
  return response.data;
};

export const getComplaint = async (id: string | number): Promise<ComplaintResponse> => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const updateComplaintLifecycle = async (
  id: string | number,
  data: ComplaintLifecyclePayload
): Promise<ComplaintResponse> => {
  const response = await api.patch(`/complaints/${id}/lifecycle`, data);
  return response.data;
};
