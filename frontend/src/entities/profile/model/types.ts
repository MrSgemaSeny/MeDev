export interface ProfileDto {
  id?: number;
  fullName?: string;
  headline?: string;
  summary?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  githubUsername?: string;
  telegram?: string;
  linkedin?: string;
  experience?: ExperienceDto[];
  education?: EducationDto[];
  skills?: SkillDto[];
  languages?: LanguageDto[];
  projects?: ProjectDto[];
  sectionOrder?: string[];
  isOnboardingCompleted?: boolean;
}

export interface ExperienceDto {
  id: number;
  company: string;
  position: string;
  description?: string;
  techStack?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  sortOrder: number;
}

export interface EducationDto {
  id: number;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  sortOrder: number;
}

export interface SkillDto {
  id: number;
  name: string;
  category?: string;
  level?: string;
  sortOrder: number;
}

export interface LanguageDto {
  id: number;
  name: string;
  level?: string;
  sortOrder: number;
}

export interface ProjectDto {
  id: number;
  name: string;
  description?: string;
  githubUrl?: string;
  techStack?: string;
  sortOrder: number;
}
