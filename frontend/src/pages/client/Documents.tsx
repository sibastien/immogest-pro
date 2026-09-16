import React, { useState } from 'react';
import {
  FileText, Download, Eye, Clock, CheckCircle2, AlertCircle, Lock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

type DocStatus = 'disponible' | 'en_attente' | 'signe' | 'expire';

interface ClientDoc {
  id: string;
  title: string;
  type: string;
  status: DocStatus;
  date: string;
  size: string;
  icon: string;
  locked: boolean;
}

const MOCK_DOCS: ClientDoc[] = [];

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; Icon: React.FC<{ size?: number; className?: string }> }> = {
  disponible:  { label: 'Disponible',   color: 'text-success', bg: 'bg-success-light', Icon: CheckCircle2 },
  en_attente:  { label: 'En cours',     color: 'text-warning', bg: 'bg-warning-light', Icon: Clock },
  signe:       { label: 'Signé',        color: 'text-primary', bg: 'bg-primary-light', Icon: CheckCircle2 },
  expire:      { label: 'Expiré',       color: 'text-danger',  bg: 'bg-danger-light',  Icon: AlertCircle },
};

export const ClientDocuments: React.FC = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'tous' | 'signe' | 'attente'>('tous');

  const filtered = MOCK_DOCS.filter((d) =>
    tab === 'tous' ? true
    : tab === 'signe' ? d.status === 'signe'
    : d.status === 'en_attente'
  );

  const signés   = MOCK_DOCS.filter((d) => d.status === 'signe').length;
  const attente  = MOCK_DOCS.filter((d) => d.status === 'en_attente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Mes documents</h2>
        <p className="text-sm text-gray-400">Bonjour {user?.name?.split(' ')[0]} — {MOCK_DOCS.length} documents disponibles</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryTile value={MOCK_DOCS.length} label="Total" color="text-gray-700" bg="bg-gray-100" />
        <SummaryTile value={signés} label="Signés" color="text-primary" bg="bg-primary-light" />
        <SummaryTile value={attente} label="En cours" color="text-warning" bg="bg-warning-light" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-gray-200 pb-0">
        {([
          { id: 'tous', label: `Tous (${MOCK_DOCS.length})` },
          { id: 'signe', label: `Signés (${signés})` },
          { id: 'attente', label: `En cours (${attente})` },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {filtered.map((doc) => {
          const cfg = STATUS_CONFIG[doc.status];
          const StatusIcon = cfg.Icon;
          return (
            <div key={doc.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${doc.locked ? 'opacity-80' : ''}`}>
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100">
                  {doc.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{doc.title}</span>
                    {doc.locked && <Lock size={13} className="text-gray-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">{doc.type}</span>
                    <span>·</span>
                    <span>{new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {doc.size !== '—' && <><span>·</span><span>{doc.size}</span></>}
                  </div>
                  {doc.locked && (
                    <p className="text-xs text-warning mt-1">En cours de finalisation — disponible bientôt</p>
                  )}
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                  {!doc.locked && (
                    <>
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Aperçu">
                        <Eye size={14} className="text-gray-500" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" title="Télécharger">
                        <Download size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <FileText size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun document disponible</p>
            <p className="text-xs mt-1">Vos mandats et compromis apparaîtront ici</p>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 p-4 bg-primary-light rounded-xl border border-primary/20">
        <FileText size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary">Besoin d'un document ?</p>
          <p className="text-xs text-primary/80 mt-0.5">Contactez votre agent pour toute demande de document supplémentaire ou pour signer électroniquement.</p>
        </div>
      </div>
    </div>
  );
};

const SummaryTile: React.FC<{ value: number; label: string; color: string; bg: string }> = ({ value, label, color, bg }) => (
  <div className={`${bg} rounded-xl p-4`}>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
  </div>
);
