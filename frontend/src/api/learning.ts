import api from "./api";

export interface LearningCandidatePayload {
  source_submission_id?: string;
  complaint_id?: number;
  complaint_title: string;
  complaint_description: string;
  original_category: string;
  original_department: string;
  original_manager: string;
  original_recommendation: string;
  verification_rating: "Yes" | "Partially" | "No";
  verification_score: number;
  employee_comments: string;
  corrected_category?: string;
  corrected_department?: string;
  corrected_manager?: string;
  corrected_action?: string;
}

export interface LearningCandidateResponse extends LearningCandidatePayload {
  id: number;
  reviewer_notes?: string;
  status: "Needs Review" | "Approved" | "Rejected";
  created_at: string;
  reviewed_at?: string;
}

export interface LearningDecisionPayload {
  action: "approve" | "reject";
  corrected_category?: string;
  corrected_department?: string;
  corrected_manager?: string;
  corrected_action?: string;
  reviewer_notes?: string;
}

export const createLearningCandidate = async (
  data: LearningCandidatePayload
): Promise<LearningCandidateResponse> => {
  const response = await api.post("/learning/candidates", data);
  return response.data;
};

export const getLearningCandidates = async (
  status?: LearningCandidateResponse["status"]
): Promise<LearningCandidateResponse[]> => {
  const response = await api.get("/learning/candidates", {
    params: status ? { status } : undefined
  });
  return response.data;
};

export const decideLearningCandidate = async (
  id: number,
  data: LearningDecisionPayload
): Promise<LearningCandidateResponse> => {
  const response = await api.patch(`/learning/candidates/${id}/decision`, data);
  return response.data;
};
