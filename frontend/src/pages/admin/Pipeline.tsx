import React, { useState } from 'react';
import { Building2, User, Banknote, ChevronRight, TrendingUp } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import type { Transaction } from '../../types';

type Stage = Transaction['stage'];

const STAGES: { id: Stage; label: string; color: string; headerBg: string }[] = [
  { id: 'prospection', label: 'Prospection', color: 'text-gray-600',   headerBg: 'bg-gray-100' },
  { id: 'visite',      label: 'Visite',      color: 'text-primary',    headerBg: 'bg-primary-light' },
  { id: 'offre',       label: 'Offre',        color: 'text-warning',   headerBg: 'bg-warning-light' },
  { id: 'compromis',   label: 'Compromis',    color: 'text-purple',    headerBg: 'bg-purple-light' },
  { id: 'acte',        label: 'Acte',         color: 'text-success',   headerBg: 'bg-success-light' },
  { id: 'cloture',     label: 'Clôture',      color: 'text-success',   headerBg: 'bg-success-light' },
];

const TYPE_LABEL: Record<string, string> = {
  villa:       'Villa',
  appartement: 'Appartement',
  maison:      'Maison',
  commercial:  'Local commercial',
  terrain:     'Terrain',
};

export const AdminPipeline: React.FC = () => {
  const { transactions, agents, updateTransaction, closeTransaction } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();

  const [dragging, setDragging]   = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState<Stage | null>(null);

  // KPIs (live from the shared store)
  const totalCA     = transactions.reduce((s, t) => s + t.amount, 0);
  const inProgress  = transactions.filter((t) => t.stage !== 'cloture').length;
  const closedThisMonth = transactions.filter((t) => t.stage === 'cloture').length;

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver  = (e: React.DragEvent, stage: Stage) => { e.preventDefault(); setDragOver(stage); };
  const handleDrop      = (stage: Stage) => {
    if (!dragging) { setDragOver(null); return; }
    const tx = transactions.find((t) => t.id === dragging);
    if (tx && tx.stage !== stage) {
      if (stage === 'cloture') {
        // Reaching Clôture marks the bien sold/rented + client clôturé.
        const isRental = tx.transaction === 'location';
        const prop = properties.find((p) => p.id === tx.propertyId);
        if (window.confirm(`Clôturer cette transaction ?\nLe bien « ${prop?.title ?? ''} » sera marqué comme ${isRental ? 'loué' : 'vendu'} et le client comme clôturé.`)) {
          closeTransaction(tx.id);
        }
      } else {
        updateTransaction(tx.id, { stage });
      }
    }
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pipeline de ventes</h2>
          <p className="text-sm text-gray-400">{transactions.length} dossiers actifs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiBlock label="CA total" value={`${new Intl.NumberFormat('fr-TN').format(totalCA)} DT`} sub="en cours + clôturés" color="text-primary" />
        <KpiBlock label="En cours" value={inProgress.toString()} sub="dossiers actifs" color="text-warning" />
        <KpiBlock label="Clôturés" value={closedThisMonth.toString()} sub="transactions signées" color="text-success" />
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-3" style={{ minHeight: 480 }}>
        {STAGES.map((stage) => {
          const stageTxs = transactions.filter((t) => t.stage === stage.id);
          const stageCA  = stageTxs.reduce((s, t) => s + t.amount, 0);
          const isOver   = dragOver === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={() => handleDrop(stage.id)}
              onDragLeave={() => setDragOver(null)}
              className={[
                'flex-shrink-0 w-60 rounded-xl border-2 transition-all flex flex-col',
                isOver ? 'border-primary bg-primary-light/40 scale-[1.01]' : 'border-gray-200 bg-gray-50',
              ].join(' ')}
            >
              {/* Column header */}
              <div className={`${stage.headerBg} rounded-t-xl px-3 py-2.5`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wide ${stage.color}`}>{stage.label}</span>
                  <span className="text-xs font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded-full shadow-sm">{stageTxs.length}</span>
                </div>
                {stageCA > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5">{new Intl.NumberFormat('fr-TN').format(stageCA)} DT</div>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageTxs.map((tx) => {
                  const property = properties.find((p) => p.id === tx.propertyId);
                  const client   = clients.find((c) => c.id === tx.clientId);
                  const agent    = agents.find((a) => a.id === tx.agentId);
                  const isDragging = dragging === tx.id;

                  return (
                    <div
                      key={tx.id}
                      draggable
                      onDragStart={() => handleDragStart(tx.id)}
                      onDragEnd={handleDragEnd}
                      className={[
                        'bg-white rounded-xl border border-gray-200 p-3 cursor-grab active:cursor-grabbing select-none transition-all',
                        isDragging ? 'opacity-40 scale-95 shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5',
                      ].join(' ')}
                    >
                      {/* Ref + type */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400">{tx.ref}</span>
                        <Badge variant={tx.transaction === 'vente' ? 'disponible' : 'info'} size="sm" label={`${tx.transaction === 'location' ? 'Location' : 'Vente'} · ${TYPE_LABEL[tx.type] ?? 'Autre'}`} />
                      </div>

                      {/* Property */}
                      {property && (
                        <div className="flex items-start gap-1.5 mb-2">
                          <Building2 size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-800 leading-4">{property.title}</span>
                        </div>
                      )}

                      {/* Client */}
                      {client && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <User size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{client.name}</span>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Banknote size={12} className="text-success" />
                          <span className="text-xs font-bold text-success">
                            {new Intl.NumberFormat('fr-TN').format(tx.amount)} DT
                          </span>
                        </div>
                        {agent && (
                          <div className="flex items-center gap-1">
                            <Avatar initials={agent.initials} size="xs" />
                          </div>
                        )}
                      </div>

                      {/* Drag hint */}
                      <div className="flex justify-center mt-2">
                        <ChevronRight size={12} className="text-gray-200 rotate-90" />
                      </div>
                    </div>
                  );
                })}

                {stageTxs.length === 0 && (
                  <div className={`text-center py-6 rounded-lg border-2 border-dashed text-xs text-gray-300 ${isOver ? 'border-primary bg-primary-light/30' : 'border-gray-200'}`}>
                    {isOver ? 'Déposer ici' : 'Vide'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">Glissez les cartes entre les colonnes pour mettre à jour le statut</p>
    </div>
  );
};

const KpiBlock: React.FC<{ label: string; value: string; sub: string; color: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp size={14} className="text-gray-400" />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
  </div>
);
