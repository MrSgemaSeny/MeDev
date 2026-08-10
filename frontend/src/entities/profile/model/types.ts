export interface ProfileDto {
  id?: number;
  fullName?: string;
  headline?: string;
  summary?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experience?: ExperienceDto[];
  education?: EducationDto[];
  skills?: SkillDto[];
  languages?: LanguageDto[];
  projects?: ProjectDto[];
  sectionOrder?: string[];
}

export interface ExperienceDto {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  orderIndex: number;
}

export interface EducationDto {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  orderIndex: number;
}

export interface SkillDto {
  id: number;
  name: string;
  level: string;
  orderIndex: number;
}

export interface LanguageDto {
  id: number;
  name: string;
  proficiency: string;
  orderIndex: number;
}

export interface ProjectDto {
  id: number;
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  orderIndex: number;
}
