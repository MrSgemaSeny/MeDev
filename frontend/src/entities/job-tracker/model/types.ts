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
  appliedDate?: string;
  updatedAt: string;
}

export type CreateJobApplicationRequest = Omit<JobApplicationDto, 'id' | 'updatedAt'>;
export type UpdateJobApplicationRequest = Partial<CreateJobApplicationRequest>;
