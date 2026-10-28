export interface ImageItem {
  id: string;
  name: string;
  url: string;
  filePath?: string;
  size: number;
  type: string;
}

export function validateImageFiles(count: number): { valid: boolean; message?: string } {
  if (count < 4) {
    return { valid: false, message: `Please upload at least 4 photos (currently ${count})` };
  }
  if (count > 8) {
    return { valid: false, message: `Maximum 8 photos permitted (currently ${count})` };
  }
  return { valid: true };
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
