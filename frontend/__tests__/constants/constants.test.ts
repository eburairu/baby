import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_PAGINATION_LIMIT, 
  MAX_PAGINATION_LIMIT, 
  API_TIMEOUT_MS,
  MAX_IMAGE_DIMENSION 
} from '../../constants/common';
import { 
  TOAST_DURATION_MS, 
  MOBILE_BREAKPOINT_PX
} from '../../constants/ui';
import { 
  FUTURE_DATE_BUFFER_MIN, 
  NOTE_MAX_LENGTH, 
  MAX_FEEDING_ML,
  MAX_SLEEP_HOURS,
  GROWTH_HEIGHT_MIN_CM,
  USERNAME_MIN_LENGTH
} from '../../constants/logic';
import { RECORD_TYPES, DIAPER_STATUS, FEEDING_METHODS, USER_ROLES } from '../../types/enums';

describe('Constants', () => {
  it('common constants should be defined correctly', () => {
    expect(DEFAULT_PAGINATION_LIMIT).toBe(20);
    expect(MAX_PAGINATION_LIMIT).toBe(100);
    expect(API_TIMEOUT_MS).toBe(30000);
    expect(MAX_IMAGE_DIMENSION).toBe(1200);
  });

  it('ui constants should be defined correctly', () => {
    expect(TOAST_DURATION_MS).toBe(3000);
    expect(MOBILE_BREAKPOINT_PX).toBe(768);
  });

  it('logic constants should be defined correctly', () => {
    expect(FUTURE_DATE_BUFFER_MIN).toBe(5);
    expect(NOTE_MAX_LENGTH).toBe(2000);
    expect(MAX_FEEDING_ML).toBe(500);
    expect(MAX_SLEEP_HOURS).toBe(18);
    expect(GROWTH_HEIGHT_MIN_CM).toBe(30.0);
    expect(USERNAME_MIN_LENGTH).toBe(3);
  });

  it('enums should be defined correctly', () => {
    expect(RECORD_TYPES.FEEDING).toBe('feeding');
    expect(DIAPER_STATUS.WET).toBe('wet');
    expect(FEEDING_METHODS.BREAST).toBe('breast');
    expect(USER_ROLES.ADMIN).toBe('admin');
  });
});

