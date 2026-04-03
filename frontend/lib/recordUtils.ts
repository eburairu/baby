import { RECORD_TYPES } from '@/types/enums';

export function getRecordEndpoint(type: string, id?: number | string): string {
  const basePath = (() => {
    switch (type) {
      case RECORD_TYPES.FEEDING: return '/feedings';
      case RECORD_TYPES.SLEEP: return '/sleeps';
      case RECORD_TYPES.DIAPER: return '/diapers';
      case RECORD_TYPES.GROWTH: return '/growths';
      case RECORD_TYPES.NOTE: return '/notes';
      case RECORD_TYPES.CONTRACTION: return '/contractions';
      case RECORD_TYPES.TEMPERATURE: return '/temperatures';
      default: return `/${type}s`;
    }
  })();

  return id ? `${basePath}/${id}` : basePath;
}
