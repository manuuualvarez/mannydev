import { describe, it, expect } from 'vitest';
import esMessages from '../../../messages/es.json';
import enMessages from '../../../messages/en.json';

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

describe('i18n messages consistency', () => {
  it('es.json and en.json have the same keys', () => {
    const esKeys = getKeys(esMessages).sort();
    const enKeys = getKeys(enMessages).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('no empty values in es.json', () => {
    const esKeys = getKeys(esMessages);
    for (const key of esKeys) {
      const parts = key.split('.');
      let value: unknown = esMessages;
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part];
      }
      if (typeof value === 'string') {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('no empty values in en.json', () => {
    const enKeys = getKeys(enMessages);
    for (const key of enKeys) {
      const parts = key.split('.');
      let value: unknown = enMessages;
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part];
      }
      if (typeof value === 'string') {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
