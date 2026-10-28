import { z } from 'zod';

export const PropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  location: z.string().min(2, 'Location is required'),
  propertyType: z.string().min(2, 'Property type is required'),
  price: z.string().optional().or(z.literal('')),
  bedrooms: z.number().positive().optional().nullable(),
  bathrooms: z.number().positive().optional().nullable(),
  areaSqFt: z.number().positive().optional().nullable(),
  features: z.array(z.string()).min(1, 'Please add at least one highlight feature'),
  contact: z.string().min(3, 'Contact details are required'),
  cta: z.string().min(3, 'Call to action is required'),
  brandName: z.string().optional().or(z.literal('')),
});

export type PropertyDetails = z.infer<typeof PropertySchema>;
