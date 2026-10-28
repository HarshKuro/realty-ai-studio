import { describe, it, expect } from 'vitest';
import { PropertySchema } from '../lib/validation/property';
import { validateImageFiles } from '../lib/validation/media';

describe('Property Schema Validation', () => {
  it('validates a complete property payload', () => {
    const valid = PropertySchema.safeParse({
      title: 'Modern Sunset Villa',
      location: 'Malibu, CA',
      propertyType: 'Single Family Villa',
      price: '$4,250,000',
      bedrooms: 4,
      bathrooms: 3.5,
      areaSqFt: 3800,
      features: ['Infinity pool', 'Ocean views', 'Chef kitchen'],
      contact: 'Sarah Jenkins (555) 019-2831',
      cta: 'Schedule a private tour today'
    });
    expect(valid.success).toBe(true);
  });

  it('permits omitted optional fields gracefully', () => {
    const valid = PropertySchema.safeParse({
      title: 'City Penthouse',
      location: 'Downtown',
      propertyType: 'Penthouse',
      features: ['Private terrace'],
      contact: 'info@realty.com',
      cta: 'Inquire now'
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.price).toBeUndefined();
      expect(valid.data.bedrooms).toBeUndefined();
    }
  });

  it('rejects payload missing mandatory title, location, contact, or cta', () => {
    const invalid = PropertySchema.safeParse({
      location: 'Downtown',
      propertyType: 'Penthouse'
    });
    expect(invalid.success).toBe(false);
  });

  it('validates image count constraint (must be 4 to 8 images)', () => {
    expect(validateImageFiles(0).valid).toBe(false);
    expect(validateImageFiles(3).valid).toBe(false);
    expect(validateImageFiles(4).valid).toBe(true);
    expect(validateImageFiles(6).valid).toBe(true);
    expect(validateImageFiles(8).valid).toBe(true);
    expect(validateImageFiles(9).valid).toBe(false);
  });
});
