import { describe, it, expect, beforeEach } from 'vitest';
import { useUpsellStore } from './upsellStore';

describe('UpsellStore', () => {
  beforeEach(() => {
    useUpsellStore.setState({ isOpen: false });
  });

  it('should have initial state isOpen false', () => {
    expect(useUpsellStore.getState().isOpen).toBe(false);
  });

  it('openUpsell should set isOpen to true', () => {
    useUpsellStore.getState().openUpsell();
    expect(useUpsellStore.getState().isOpen).toBe(true);
  });

  it('closeUpsell should set isOpen to false', () => {
    useUpsellStore.setState({ isOpen: true });
    useUpsellStore.getState().closeUpsell();
    expect(useUpsellStore.getState().isOpen).toBe(false);
  });
});
