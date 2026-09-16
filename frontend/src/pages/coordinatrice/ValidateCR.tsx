import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Clock, Star, ChevronDown, ChevronUp,
  FileText, User, Home, MessageSquare, AlertCircle,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useClientsStore } from '../../store/clientsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import type { CompteRendu } from '../../types';

const RESULT_LABEL: Record<CompteRendu['result'], string> = {
  offre_probable: 'Offre probable',
  a_revoir: 'À revoir',
  refus: 'Refus',
};

const RESULT_VARIANT = {
  offre_probable: 'disponible' as const,
  a_revoir: 'a_relancer' as const,
  refus: 'gray' as const,
};

export const CoordinatriceValidateCR: React.FC = () => {
  const { comptesRendus, agents, visits, validateCR, rejectCR } = useAgentsStore();
  const { clients } = useClientsStore();
  const { properties } = usePropertiesStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tab, setTab] = useState<'soumis' | 'valide' | 'correction'>('soumis');

  const filtered = comptesRendus.filter((cr) =>
    tab === 'soumis' ? cr.status === 'soumis'
    : tab === 'valide' ? cr.status === 'valide'
    : cr.status === 'correction_demandee'
  );

  const counts = {
    soumis: comptesRendus.filter((c) => c.status === 'soumis').length,
    valide: comptesRendus.filter((c) => c.status === 'valide').length,
    correction: comptesRendus.filter((c) => c.status === 'correction_demandee').length,
  };

  const handleValidate = (id: string) => {
    validateCR(id);
    if (expanded === id) setExpanded(null);
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    rejectCR(id, rejectReason);
    setRejectId(null);
    setRejectReason('');
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Validation des C.R.</h2>
        <p className="text-sm text-gray-400">{counts.soumis} compte{counts.soumis !== 1 ? 's' : ''}-rendu en attente</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { id: 'soumis', label: 'En attente', count: counts.soumis },
          { id: 'valide', label: 'Validés', count: counts.valide },
          { id: 'correction', label: 'Correction demandée', count: counts.correction },
        ] as const).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors',
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === id && id === 'soumis' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <FileText size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun compte-rendu dans cet onglet</p>
          </div>
        )}

        {filtered.map((cr) => {
          const visit    = visits.find((v) => v.id === cr.visitId);
          const agent    = agents.find((a) => a.id === cr.agentId);
          const client   = visit ? clients.find((c) => c.id === visit.clientId) : undefined;
          const property = visit ? properties.find((p) => p.id === visit.propertyId) : undefined;
          const isOpen   = expanded === cr.id;

          return (
            <Card key={cr.id} padding="none">
              {/* Header */}
              <div
                className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
                onClick={() => setExpanded(isOpen ? null : cr.id)}
              >
                {/* Stars */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= cr.clientInterest ? 'text-warning fill-warning' : 'text-gray-200'}
                    />
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {property?.title ?? 'Bien inconnu'}
                    </span>
                    <Badge variant={RESULT_VARIANT[cr.result]} size="sm" label={RESULT_LABEL[cr.result]} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {agent && (
                      <span className="flex items-center gap-1">
                        <User size={11} /> {agent.name.split(' ')[0]}
                      </span>
                    )}
                    {client && (
                      <span className="flex items-center gap-1">
                        <User size={11} /> {client.name}
                      </span>
                    )}
                    {visit && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(visit.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                {cr.status === 'soumis' ? (
                  <Badge variant="a_relancer" size="sm" dot />
                ) : cr.status === 'valide' ? (
                  <Badge variant="disponible" size="sm" dot />
                ) : (
                  <Badge variant="gray" size="sm" dot />
                )}

                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                  {/* Agent + property info */}
                  <div className="grid grid-cols-2 gap-3">
                    {agent && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Avatar initials={agent.initials} size="sm" status={agent.status} />
                        <div>
                          <div className="text-xs font-medium text-gray-800">{agent.name}</div>
                          <div className="text-xs text-gray-400">Agent terrain</div>
                        </div>
                      </div>
                    )}
                    {property && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                          <Home size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-800 truncate">{property.title}</div>
                          <div className="text-xs text-gray-400">{property.location}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare size={13} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">Notes de visite</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-5 bg-gray-50 rounded-lg p-3">{cr.notes}</p>
                  </div>

                  {/* Follow-up */}
                  {cr.followUp.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">Actions de suivi prévues</div>
                      <ul className="space-y-1">
                        {cr.followUp.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle2 size={12} className="text-success flex-shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {cr.status === 'soumis' && (
                    rejectId === cr.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Motif de la correction demandée…"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setRejectId(null); setRejectReason(''); }}
                            className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleReject(cr.id)}
                            disabled={!rejectReason.trim()}
                            className="flex-1 py-2 bg-danger text-white rounded-lg text-xs font-medium hover:bg-danger/90 disabled:opacity-50"
                          >
                            Envoyer la correction
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRejectId(cr.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-danger/30 text-danger rounded-lg text-xs hover:bg-danger-light transition-colors"
                        >
                          <XCircle size={13} /> Demander correction
                        </button>
                        <button
                          onClick={() => handleValidate(cr.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-success text-white rounded-lg text-xs font-medium hover:bg-success/90 transition-colors"
                        >
                          <CheckCircle2 size={13} /> Valider le C.R.
                        </button>
                      </div>
                    )
                  )}

                  {cr.status === 'valide' && (
                    <div className="flex items-center gap-2 text-xs text-success bg-success-light px-3 py-2 rounded-lg">
                      <CheckCircle2 size={13} />
                      Validé le {cr.validatedAt ? new Date(cr.validatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '—'}
                    </div>
                  )}

                  {cr.status === 'correction_demandee' && (
                    <div className="flex items-center gap-2 text-xs text-warning bg-warning-light px-3 py-2 rounded-lg">
                      <AlertCircle size={13} />
                      Correction demandée — en attente de réponse de l'agent
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
