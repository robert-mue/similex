import { describe, expect, it } from 'vitest';
import {
  loadWidget,
  registerWidget,
  registeredWidgets,
} from './widget-registry.js';

describe('widget-registry', () => {
  it('rejects unknown widgets', async () => {
    await expect(loadWidget('does-not-exist')).rejects.toThrow(
      /Unknown widget/,
    );
  });

  it('records registered widget names', () => {
    registerWidget('fake', async () => ({ default: 'fake' }));
    expect(registeredWidgets()).toContain('fake');
  });

  it('resolves to the method name the widget module exports', async () => {
    registerWidget('fake', async () => ({ default: 'fake' }));
    await expect(loadWidget('fake')).resolves.toBe('fake');
  });

  it('rejects widgets that do not export a method name', async () => {
    registerWidget('broken', async () => ({ default: 42 }));
    await expect(loadWidget('broken')).rejects.toThrow(/method name/);
  });
});
