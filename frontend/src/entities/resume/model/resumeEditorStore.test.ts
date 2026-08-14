import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeEditorStore } from './resumeEditorStore';

describe('ResumeEditorStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useResumeEditorStore.setState({
      sections: [
        { id: 'summary',    type: 'summary',    visible: true, label: 'About' },
        { id: 'experience', type: 'experience', visible: true, label: 'Experience' },
        { id: 'education',  type: 'education',  visible: true, label: 'Education' },
        { id: 'skills',     type: 'skills',     visible: true, label: 'Skills' },
        { id: 'languages',  type: 'languages',  visible: true, label: 'Languages' },
        { id: 'projects',   type: 'projects',   visible: true, label: 'Projects' },
      ],
      selectedTemplate: 'github',
    });
  });

  it('should have initial state', () => {
    const state = useResumeEditorStore.getState();
    expect(state.selectedTemplate).toBe('github');
    expect(state.sections.length).toBe(6);
  });

  it('toggleSection should toggle visibility', () => {
    useResumeEditorStore.getState().toggleSection('experience');
    let state = useResumeEditorStore.getState();
    expect(state.sections.find(s => s.id === 'experience')?.visible).toBe(false);

    useResumeEditorStore.getState().toggleSection('experience');
    state = useResumeEditorStore.getState();
    expect(state.sections.find(s => s.id === 'experience')?.visible).toBe(true);
  });

  it('reorderSections should reorder elements', () => {
    useResumeEditorStore.getState().reorderSections(0, 2);
    const state = useResumeEditorStore.getState();
    // Initially summary (0), experience (1), education (2)
    // Moving summary to index 2
    // new order: experience, education, summary
    expect(state.sections[0].id).toBe('experience');
    expect(state.sections[1].id).toBe('education');
    expect(state.sections[2].id).toBe('summary');
  });

  it('setTemplate should change selectedTemplate', () => {
    useResumeEditorStore.getState().setTemplate('minimalist');
    const state = useResumeEditorStore.getState();
    expect(state.selectedTemplate).toBe('minimalist');
  });
});
