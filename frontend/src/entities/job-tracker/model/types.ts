export type ApplicationStatus = 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplicationDto {
  id: number;
  companyName: string;
  role: string;
  status: ApplicationStatus;
  jobUrl?: string;
  location?: string;
  salaryRange?: string;
  notes?: string;
  jobDescription?: string;
  matchScore?: number;
  matchFeedback?: string;
  appliedDate?: string;
  updatedAt: string;
}

export type CreateJobApplicationRequest = Omit<JobApplicationDto, 'id' | 'updatedAt'>;
export type UpdateJobApplicationRequest = Partial<CreateJobApplicationRequest>;

export interface AiTailorRequest {
  jobDescription: string;
  targetRole?: string;
}

export interface AiApplicationResponse {
  content: string;
  coverLetter?: string;
  suggestions?: string;
}

export type AiTailorResponse = AiApplicationResponse;

export interface AiMatchRequest {
  jobDescription: string;
}

export interface AiMatchResponse {
  score: number;
  feedback: string;
}

