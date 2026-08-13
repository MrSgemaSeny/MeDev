import { create } from 'zustand';

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects';

export interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
  label: string;
}

interface ResumeEditorStore {
  sections: Section[];
  selectedTemplate: string;
  setSections: (sections: Section[]) => void;
  toggleSection: (id: string) => void;
  reorderSections: (from: number, to: number) => void;
  setTemplate: (template: string) => void;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'summary',    type: 'summary',    visible: true, label: 'About' },
  { id: 'experience', type: 'experience', visible: true, label: 'Experience' },
  { id: 'education',  type: 'education',  visible: true, label: 'Education' },
  { id: 'skills',     type: 'skills',     visible: true, label: 'Skills' },
  { id: 'languages',  type: 'languages',  visible: true, label: 'Languages' },
  { id: 'projects',   type: 'projects',   visible: true, label: 'Projects' },
];

export const useResumeEditorStore = create<ResumeEditorStore>((set) => ({
  sections: DEFAULT_SECTIONS,
  selectedTemplate: 'github',

  setSections: (sections) => set({ sections }),

  toggleSection: (id) => set((state) => ({
    sections: state.sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    )
  })),

  reorderSections: (from, to) => set((state) => {
    const sections = [...state.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    return { sections };
  }),

  setTemplate: (selectedTemplate) => set({ selectedTemplate }),
}));
