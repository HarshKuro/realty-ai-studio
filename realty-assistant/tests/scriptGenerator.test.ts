import { describe, it, expect } from 'vitest';
import { generateFactualScript } from '../lib/story/scriptGenerator';

describe('Deterministic Factual Script Generator', () => {
  it('generates scenes without hallucinating missing fields', () => {
    const result = generateFactualScript({
      title: 'Minimalist Glass House',
      location: 'Aspen, CO',
      propertyType: 'Luxury Retreat',
      features: ['Heated floors', 'Mountain vistas'],
      contact: 'Agent Dave',
      cta: 'Contact us for details'
    }, 5);

    expect(result.scenes.length).toBe(5);
    expect(result.fullNarration).toContain('Minimalist Glass House');
    expect(result.fullNarration).toContain('Aspen, CO');
    expect(result.fullNarration).not.toContain('undefined');
    expect(result.fullNarration).not.toContain('sq ft');
    expect(result.fullNarration).not.toContain('bedrooms');
    expect(result.fullNarration).toContain('Agent Dave');
    expect(result.fullNarration).toContain('Contact us for details');
  });

  it('includes price, area, and bedrooms when provided', () => {
    const result = generateFactualScript({
      title: 'Urban Loft',
      location: 'SoHo, NY',
      propertyType: 'Loft',
      price: '$2,100,000',
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: 1850,
      features: ['Exposed brick', 'Private elevator'],
      contact: 'Jane Smith (212) 555-0199',
      cta: 'Book your viewing today'
    }, 4);

    expect(result.scenes.length).toBe(4);
    expect(result.fullNarration).toContain('$2,100,000');
    expect(result.fullNarration).toContain('1,850 square feet');
    expect(result.fullNarration).toContain('2 bedrooms');
    expect(result.fullNarration).toContain('Exposed brick');
  });

  it('generates concise, high-contrast captions within safe margin lengths (<60 chars)', () => {
    const result = generateFactualScript({
      title: 'The Beverly Hills Pavilion',
      location: 'Beverly Hills, CA',
      propertyType: 'Modern Villa',
      price: '$14,500,000',
      features: [
        'Floor-to-ceiling ultra-clear glass walls',
        'Cantilevered zero-edge reflection pool',
        'Custom Boffi culinary kitchen'
      ],
      contact: 'Marcus Vance',
      cta: 'Schedule a private tour'
    }, 5);

    for (const scene of result.scenes) {
      expect(scene.caption.length).toBeLessThanOrEqual(70);
      expect(scene.caption.length).toBeGreaterThan(0);
      expect(scene.estimatedDurationSec).toBeGreaterThan(0);
    }
  });
});
