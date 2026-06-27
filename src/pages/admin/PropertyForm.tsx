import React, { useState, useEffect } from 'react';
import { Plus, X, ImagePlus } from 'lucide-react';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import type { Property, PropertyType, PropertyStatus } from '../../types';

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'vente_residentielle', label: 'Vente résidentielle' },
  { value: 'location_residentielle', label: 'Location résidentielle' },
  { value: 'commercial', label: 'Local commercial' },
  { value: 'terrain', label: 'Terrain / Foncier' },
];

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'sous_compromis', label: 'Sous compromis' },
  { value: 'loue', label: 'Loué' },
  { value: 'vendu', label: 'Vendu' },
];

const COMMON_FEATURES = [
  'Parking', 'Ascenseur', 'Piscine', 'Jardin', 'Terrasse', 'Balcon',
  'Climatisation', 'Meublé', 'Gardien', 'Concierge', 'Cave', 'Buanderie',
  'Vue mer', 'Neuf', 'Viabilisé', 'WiFi',
];

type FormData = Omit<Property, 'id'> & { featureInput: string };

function generateRef(type: PropertyType): string {
  const prefix = { vente_residentielle: 'V', location_residentielle: 'L', commercial: 'C', terrain: 'T' }[type];
  const code = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${code}-${String(Date.now()).slice(-3)}`;
}

interface PropertyFormProps {
  property?: Property;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSuccess,
  onCancel,
}) => {
  const isEdit = !!property;
  const { addProperty, updateProperty } = usePropertiesStore();
  const { agents } = useAgentsStore();
  const { user } = useAuthStore();

  const terrainAgents = agents.filter((a) =>
    ['agent_terrain', 'agent_bureau', 'coordinatrice', 'admin'].includes(a.role)
  );

  const [form, setForm] = useState<FormData>({
    ref:         property?.ref         ?? '',
    title:       property?.title       ?? '',
    type:        property?.type        ?? 'vente_residentielle',
    status:      property?.status      ?? 'disponible',
    price:       property?.price       ?? 0,
    priceType:   property?.priceType   ?? 'vente',
    surface:     property?.surface     ?? 0,
    rooms:       property?.rooms,
    bathrooms:   property?.bathrooms,
    location:    property?.location    ?? '',
    address:     property?.address     ?? '',
    agentId:     property?.agentId     ?? user?.agentId ?? (terrainAgents[0]?.id ?? ''),
    description: property?.description ?? '',
    features:    property?.features    ?? [],
    photos:      property?.photos      ?? [],
    floor:       property?.floor,
    totalFloors: property?.totalFloors,
    parking:     property?.parking     ?? false,
    furnished:   property?.furnished   ?? false,
    createdAt:   property?.createdAt   ?? new Date().toISOString().split('T')[0],
    featureInput: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Sync priceType with type
  useEffect(() => {
    setForm((f) => ({
      ...f,
      priceType: f.type === 'location_residentielle' ? 'mois' : 'vente',
    }));
  }, [form.type]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
  };

  const toggleFeature = (f: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features?.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...(prev.features ?? []), f],
    }));
  };

  const addCustomFeature = () => {
    const val = form.featureInput.trim();
    if (val && !form.features?.includes(val)) {
      setForm((f) => ({ ...f, features: [...(f.features ?? []), val], featureInput: '' }));
    }
  };

  const [uploading, setUploading] = useState(false);

  const handlePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const uploaded = await api.upload<{ url: string }[]>('/uploads', fd);
      setForm((f) => ({ ...f, photos: [...(f.photos ?? []), ...uploaded.map((u) => u.url)] }));
    } catch {
      // surfaced by the disabled state; keep it simple
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) =>
    setForm((f) => ({ ...f, photos: (f.photos ?? []).filter((p) => p !== url) }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim())    e.title    = 'Le titre est obligatoire';
    if (!form.location.trim()) e.location = 'La localisation est obligatoire';
    if (!form.address.trim())  e.address  = 'L\'adresse est obligatoire';
    if (form.price <= 0)       e.price    = 'Le prix doit être supérieur à 0';
    if (form.surface <= 0)     e.surface  = 'La surface doit être supérieure à 0';
    if (!form.agentId)         e.agentId  = 'Sélectionnez un agent';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { featureInput, ...rest } = form;
    const ref = form.ref || generateRef(form.type);

    if (isEdit && property) {
      updateProperty(property.id, { ...rest, ref });
      onSuccess(property.id);
    } else {
      const newId = `prop-${Date.now()}`;
      addProperty({ id: newId, ...rest, ref });
      onSuccess(newId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type & Statut */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Classification</legend>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type de bien" error={errors.type}>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value as PropertyType)}
              className={inputClass()}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Statut" error={errors.status}>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as PropertyStatus)}
              className={inputClass()}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      {/* Titre & Ref */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identification</legend>
        <FormField label="Titre de l'annonce *" error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex: Appartement T3 vue mer — La Marsa"
            className={inputClass(!!errors.title)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Référence (auto si vide)">
            <input
              type="text"
              value={form.ref}
              onChange={(e) => set('ref', e.target.value)}
              placeholder={generateRef(form.type)}
              className={inputClass()}
            />
          </FormField>
          <FormField label="Agent responsable *" error={errors.agentId}>
            <select
              value={form.agentId}
              onChange={(e) => set('agentId', e.target.value)}
              className={inputClass(!!errors.agentId)}
            >
              <option value="">— Choisir —</option>
              {terrainAgents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      {/* Prix & Surface */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Caractéristiques</legend>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Prix (DT) *" error={errors.price}>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              placeholder="0"
              min={0}
              className={inputClass(!!errors.price)}
            />
          </FormField>
          <FormField label="Tarif">
            <select
              value={form.priceType}
              onChange={(e) => set('priceType', e.target.value as 'vente' | 'mois')}
              className={inputClass()}
            >
              <option value="vente">À la vente</option>
              <option value="mois">Par mois</option>
            </select>
          </FormField>
          <FormField label="Surface (m²) *" error={errors.surface}>
            <input
              type="number"
              value={form.surface || ''}
              onChange={(e) => set('surface', Number(e.target.value))}
              placeholder="0"
              min={0}
              className={inputClass(!!errors.surface)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <FormField label="Chambres">
            <input
              type="number"
              value={form.rooms ?? ''}
              onChange={(e) => set('rooms', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="—"
              min={0}
              className={inputClass()}
            />
          </FormField>
          <FormField label="Salles de bain">
            <input
              type="number"
              value={form.bathrooms ?? ''}
              onChange={(e) => set('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="—"
              min={0}
              className={inputClass()}
            />
          </FormField>
          <FormField label="Étage">
            <input
              type="number"
              value={form.floor ?? ''}
              onChange={(e) => set('floor', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="—"
              min={0}
              className={inputClass()}
            />
          </FormField>
          <FormField label="Nbre étages">
            <input
              type="number"
              value={form.totalFloors ?? ''}
              onChange={(e) => set('totalFloors', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="—"
              min={0}
              className={inputClass()}
            />
          </FormField>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.parking ?? false}
              onChange={(e) => set('parking', e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Parking</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.furnished ?? false}
              onChange={(e) => set('furnished', e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Meublé</span>
          </label>
        </div>
      </fieldset>

      {/* Localisation */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Localisation</legend>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Quartier / Ville *" error={errors.location}>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Ex: La Marsa, Sousse, Centre-ville…"
              className={inputClass(!!errors.location)}
            />
          </FormField>
          <FormField label="Adresse complète *" error={errors.address}>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rue, numéro, cité…"
              className={inputClass(!!errors.address)}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Description */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</legend>
        <FormField label="Description de l'annonce">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Décrivez le bien en détail…"
            rows={4}
            className={`${inputClass()} resize-none`}
          />
        </FormField>
      </fieldset>

      {/* Équipements */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Équipements & prestations</legend>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_FEATURES.map((f) => {
            const selected = form.features?.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  selected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50',
                ].join(' ')}
              >
                {f}
              </button>
            );
          })}
        </div>
        {/* Custom feature */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={form.featureInput}
            onChange={(e) => set('featureInput', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature(); } }}
            placeholder="Autre équipement…"
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
          >
            <Plus size={14} />
          </button>
        </div>
        {form.features && form.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {form.features.map((f) => (
              <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">
                {f}
                <button type="button" onClick={() => toggleFeature(f)} className="hover:text-danger">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>

      {/* Photos */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photos</legend>
        <div className="flex flex-wrap gap-2">
          {(form.photos ?? []).map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-danger"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <ImagePlus size={20} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">{uploading ? 'Envoi…' : 'Ajouter'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handlePhotos(e.target.files); e.target.value = ''; }}
            />
          </label>
        </div>
        <p className="text-xs text-gray-400">JPEG/PNG · plusieurs photos possibles · 20 Mo max chacune.</p>
      </fieldset>

      {/* Footer buttons (outside form so caller places them in Drawer footer) */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isEdit ? 'Enregistrer les modifications' : 'Ajouter le bien'}
        </button>
      </div>
    </form>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function inputClass(hasError = false): string {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-danger focus:ring-danger/30 focus:border-danger'
      : 'border-gray-200 focus:ring-primary/30 focus:border-primary',
  ].join(' ');
}

const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
);
