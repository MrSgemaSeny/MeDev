import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeBuilder } from './ResumeBuilder';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';
import { useAiChatStore } from '../../features/ai-assistant/model/store';
import { api } from '../../shared/api/axios';

// Mock API
vi.mock('../../shared/api/axios', () => ({
  api: {
    get: vi.fn(),
  }
}));

describe('ResumeBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: new Blob(['test html'], { type: 'text/html' }) });
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    window.URL.revokeObjectURL = vi.fn();
    
    useResumeEditorStore.setState({
      sections: [
        { id: 'summary', type: 'summary', visible: true, label: 'About' },
        { id: 'experience', type: 'experience', visible: true, label: 'Experience' },
      ],
      selectedTemplate: 'github',
    });
    
    useAiChatStore.setState({ isOpen: false });
  });

  it('renders ResumeBuilder with templates and sections', async () => {
    render(<ResumeBuilder />);
    
    expect(screen.getByText('Resume Builder')).toBeDefined();
    expect(screen.getByText('Templates')).toBeDefined();
    expect(screen.getByText('GitHub')).toBeDefined();
    expect(screen.getByText('Milky Soft')).toBeDefined();
    
    expect(screen.getByText('About')).toBeDefined();
    expect(screen.getByText('Experience')).toBeDefined();
    
    expect(screen.getByRole('button', { name: /AI Analysis/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /PDF/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /HTML/i })).toBeDefined();
  });

  it('changes selected template when a template is clicked', async () => {
    render(<ResumeBuilder />);
    const milkySoftBtn = screen.getByText('Milky Soft');
    fireEvent.click(milkySoftBtn);
    
    const state = useResumeEditorStore.getState();
    expect(state.selectedTemplate).toBe('milky-soft');
  });

  it('toggles section visibility when checkbox is clicked', async () => {
    render(<ResumeBuilder />);
    const aboutCheckbox = screen.getByLabelText('About') as HTMLInputElement;
    expect(aboutCheckbox.checked).toBe(true);
    
    fireEvent.click(aboutCheckbox);
    
    const state = useResumeEditorStore.getState();
    expect(state.sections.find(s => s.id === 'summary')?.visible).toBe(false);
  });
  
  it('loads preview HTML iframe', async () => {
    render(<ResumeBuilder />);
    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe?.src).toContain('blob:test-url');
    });
  });
});
