'use client';

import React, { useState } from 'react';
import { PropertyDetails, PropertySchema } from '@/lib/validation/property';
import { Sparkles, Plus, X, ArrowRight, Mic } from 'lucide-react';
import { VoiceInputModal } from './VoiceInputModal';

interface PropertyFormProps {
  initialData?: Partial<PropertyDetails>;
  onSubmit: (data: PropertyDetails) => void;
  onLoadSample: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  onLoadSample,
}) => {
  const [formData, setFormData] = useState<Partial<PropertyDetails>>(
    initialData || {
      title: '',
      location: '',
      propertyType: 'Modern Residence',
      price: '',
      bedrooms: null,
      bathrooms: null,
      areaSqFt: null,
      features: ['Architectural design', 'Panoramic views'],
      contact: '',
      cta: 'Schedule a private tour today',
      brandName: '',
    }
  );

  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleFieldChange = (field: keyof PropertyDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleVoiceApply = (spokenData: Partial<PropertyDetails>) => {
    setFormData((prev) => ({
      ...prev,
      ...spokenData,
      features: [...(prev.features || []), ...(spokenData.features || [])],
    }));
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    const current = formData.features || [];
    setFormData((prev) => ({ ...prev, features: [...current, featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (idx: number) => {
    const current = formData.features || [];
    setFormData((prev) => ({
      ...prev,
      features: current.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = PropertySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || 'global';
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Listing Specifications</h2>
          <p className="text-xs text-zinc-400">Enter property facts. Factual script generation relies exclusively on these entries.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            Dictate Details (Whisper)
          </button>
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Beverly Hills Sample
          </button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-md text-red-300 text-xs space-y-1">
          <p className="font-medium">Please correct the highlighted entries:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-zinc-300">Property Title *</label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g. The Glass Pavilion Estate"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Location *</label>
          <input
            type="text"
            required
            value={formData.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g. Beverly Hills, CA"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Property Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Property Type *</label>
          <input
            type="text"
            required
            value={formData.propertyType || ''}
            onChange={(e) => handleFieldChange('propertyType', e.target.value)}
            placeholder="e.g. Modern Villa, Penthouse"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Asking Price (Optional)</label>
          <input
            type="text"
            value={formData.price || ''}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            placeholder="e.g. $14,500,000 or Price on Request"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Area in Sq Ft (Optional)</label>
          <input
            type="number"
            min="0"
            value={formData.areaSqFt ?? ''}
            onChange={(e) => handleFieldChange('areaSqFt', e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 8200"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Beds</label>
            <input
              type="number"
              min="0"
              value={formData.bedrooms ?? ''}
              onChange={(e) => handleFieldChange('bedrooms', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Baths</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.bathrooms ?? ''}
              onChange={(e) => handleFieldChange('bathrooms', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 4.5"
              className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Brand / Agency */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Brokerage / Brand (Optional)</label>
          <input
            type="text"
            value={formData.brandName || ''}
            onChange={(e) => handleFieldChange('brandName', e.target.value)}
            placeholder="e.g. Vance & Co. Luxury Real Estate"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Key Features List */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-zinc-300">Highlight Features (Min 1)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Type feature (e.g. Heated saltwater pool) and press Enter"
              className="flex-1 px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-md inline-flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.features?.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
              >
                {feat}
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Contact Representation *</label>
          <input
            type="text"
            required
            value={formData.contact || ''}
            onChange={(e) => handleFieldChange('contact', e.target.value)}
            placeholder="e.g. Marcus Vance (310) 555-0192"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Call to action */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Closing Call To Action *</label>
          <input
            type="text"
            required
            value={formData.cta || ''}
            onChange={(e) => handleFieldChange('cta', e.target.value)}
            placeholder="e.g. Schedule a private viewing today"
            className="w-full px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Confirm Details & Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApply={handleVoiceApply}
      />
    </form>
  );
};
