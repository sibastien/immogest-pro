import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertCircle, Star, Send,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useClientsStore } from '../../store/clientsStore';
import { usePropertiesStore } from '../../store/propertiesStore';

const RESULTS = [
  { value: 'offre_probable', label: 'Offre probable', emoji: '🟢', description: 'Le client est très intéressé' },
  { value: 'a_revoir',       label: 'À revoir',        emoji: '🟡', description: 'Intérêt mitigé, à recontacter' },
  { value: 'refus',          label: 'Refus',            emoji: '🔴', description: 'Le client décline' },
] as const;

const FOLLOW_UP_OPTIONS = [
  'Envoyer les photos / vidéos',
  'Proposer un second passage',
  'Contacter pour une offre',
  'Planifier une expertise',
  'Préparer un compromis',
  'Rappel dans 1 semaine',
];

type ResultValue = typeof RESULTS[number]['value'];

export const CompteRenduForm: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate    = useNavigate();

  const { visits, submitCR } = useAgentsStore();
  const { clients }          = useClientsStore();
  const { properties }       = usePropertiesStore();

  const visit    = visits.find((v) => v.id === visitId);
  const client   = visit ? clients.find((c) => c.id === visit.clientId)    : undefined;
  const property = visit ? properties.find((p) => p.id === visit.propertyId) : undefined;

  const [clientInterest, setClientInterest] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [result,   setResult]   = useState<ResultValue | ''>('');
  const [notes,    setNotes]    = useState('');
  const [followUp, setFollowUp] = useState<string[]>([]);
  const [errors,   setErrors]   = useState<string[]>([]);
  const [success,  setSuccess]  = useState(false);

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-gray-400">
        <AlertCircle size={32} className="mb-3 opacity-30" />
        <p className="text-sm text-center">Visite introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-primary text-sm">← Retour</button>
      </div>
    );
  }

  const toggleFollowUp = (item: string) => {
    setFollowUp((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const validate = () => {
    const e: string[] = [];
    if (clientInterest === 0) e.push('Donnez une note (1-5 étoiles)');
    if (!result)              e.push('Sélectionnez un résultat');
    if (!notes.trim())        e.push('Rédigez une note sur la visite');
    setErrors(e);
    return e.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    submitCR({
      id:             `cr-${Date.now()}`,
      visitId:        visit.id,
      agentId:        visit.agentId,
      clientInterest: clientInterest as 1 | 2 | 3 | 4 | 5,
      result:         result as ResultValue,
      notes,
      followUp,
      photos:         [],
      submittedAt:    new Date().toISOString(),
      status:         'soumis',
    });
    setSuccess(true);
    setTimeout(() => navigate('/agent-terrain'), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">C.R. soumis !</h2>
        <p className="text-sm text-gray-500">La coordinatrice va examiner votre compte-rendu.</p>
      </div>
    );
  }

  const displayRating = hovered || clientInterest;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Compte-rendu de visite</h1>
            <p className="text-xs text-gray-400 truncate">
              {property?.title ?? visit.propertyId} · {client?.name ?? visit.clientId}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-danger-light border border-danger/20 rounded-xl p-4 space-y-1">
            {errors.map((e) => (
              <p key={e} className="text-xs text-danger flex items-center gap-1.5">
                <AlertCircle size={12} className="flex-shrink-0" /> {e}
              </p>
            ))}
          </div>
        )}

        {/* Notation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 mb-1">Intérêt du client</div>
          <div className="text-xs text-gray-400 mb-4">Sur 5 étoiles — évaluez l'enthousiasme global</div>
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setClientInterest(s)}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={36}
                  className={`transition-colors ${
                    s <= displayRating
                      ? 'text-warning fill-warning'
                      : 'text-gray-200 fill-gray-100'
                  }`}
                />
              </button>
            ))}
          </div>
          {clientInterest > 0 && (
            <div className="text-center text-xs text-gray-500 mt-3">
              {clientInterest === 1 && 'Pas du tout intéressé'}
              {clientInterest === 2 && 'Peu intéressé'}
              {clientInterest === 3 && 'Intérêt modéré'}
              {clientInterest === 4 && 'Très intéressé'}
              {clientInterest === 5 && 'Coup de cœur — offre probable'}
            </div>
          )}
        </div>

        {/* Résultat */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 mb-4">Résultat de la visite</div>
          <div className="space-y-2">
            {RESULTS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setResult(r.value)}
                className={[
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                  result === r.value
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <span className="text-xl flex-shrink-0">{r.emoji}</span>
                <div>
                  <div className={`text-sm font-semibold ${result === r.value ? 'text-primary' : 'text-gray-800'}`}>
                    {r.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.description}</div>
                </div>
                {result === r.value && (
                  <CheckCircle2 size={16} className="text-primary ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <label className="text-sm font-semibold text-gray-900 mb-1 block">
            Notes de visite <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">Décrivez les retours du client, observations sur le bien…</p>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setErrors([]); }}
            placeholder="Ex: Client très intéressé par le séjour lumineux. Hésite sur le prix, à relancer avec contre-offre à -5%. Voisinage calme apprécié…"
            rows={5}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <div className="text-right text-xs text-gray-300 mt-1">{notes.length} car.</div>
        </div>

        {/* Suivi */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 mb-1">Actions de suivi</div>
          <p className="text-xs text-gray-400 mb-3">Cochez les actions à planifier (optionnel)</p>
          <div className="space-y-2">
            {FOLLOW_UP_OPTIONS.map((item) => {
              const checked = followUp.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleFollowUp(item)}
                  className={[
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border transition-colors text-left',
                    checked ? 'border-primary bg-primary-light' : 'border-gray-200 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div className={[
                    'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                    checked ? 'bg-primary border-primary' : 'border-gray-300',
                  ].join(' ')}>
                    {checked && <CheckCircle2 size={12} className="text-white fill-white" />}
                  </div>
                  <span className={`text-sm ${checked ? 'text-primary font-medium' : 'text-gray-700'}`}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton soumettre */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Send size={16} />
          Soumettre le compte-rendu
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          La coordinatrice sera notifiée pour validation
        </p>
      </div>
    </div>
  );
};
