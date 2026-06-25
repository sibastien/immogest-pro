import React, { useState } from 'react';
import {
  Calendar, Clock, MapPin, Phone, CheckCircle2, XCircle, AlertCircle, User,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';
import { usePropertiesStore } from '../../store/propertiesStore';

type RdvStatus = 'planifie' | 'confirme' | 'effectue' | 'annule';

const STATUS_CONFIG: Record<RdvStatus, { label: string; color: string; bg: string; Icon: React.FC<{ size?: number; className?: string }> }> = {
  planifie: { label: 'Planifié',  color: 'text-warning', bg: 'bg-warning-light', Icon: Clock },
  confirme: { label: 'Confirmé', color: 'text-primary', bg: 'bg-primary-light', Icon: CheckCircle2 },
  effectue: { label: 'Effectué', color: 'text-success', bg: 'bg-success-light', Icon: CheckCircle2 },
  annule:   { label: 'Annulé',   color: 'text-danger',  bg: 'bg-danger-light',  Icon: XCircle },
};

export const ClientRendezVous: React.FC = () => {
  const { user } = useAuthStore();
  const { visits, agents } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const [tab, setTab] = useState<'a_venir' | 'passes'>('a_venir');

  // Use clientId from user to filter visits
  const clientVisits = visits.filter((v) => {
    // In mock data, match by checking all visits (since clientId is on User as optional)
    return v.status !== 'annule';
  }).slice(0, 4);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = clientVisits.filter((v) => v.date >= today);
  const past     = clientVisits.filter((v) => v.date < today);

  const displayed = tab === 'a_venir' ? upcoming : past;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Mes rendez-vous</h2>
        <p className="text-sm text-gray-400">{user?.name?.split(' ')[0]} — {upcoming.length} à venir · {past.length} passés</p>
      </div>

      {/* Next appointment highlight */}
      {upcoming.length > 0 && (() => {
        const next = upcoming[0];
        const prop = properties.find((p) => p.id === next.propertyId);
        const agent = agents.find((a) => a.id === next.agentId);
        return (
          <div className="bg-primary rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="opacity-80" />
              <span className="text-sm font-medium opacity-90">Prochain rendez-vous</span>
            </div>
            <div className="text-base font-bold mb-1">{prop?.title ?? 'Visite'}</div>
            <div className="flex items-center gap-4 text-sm opacity-85">
              <span className="flex items-center gap-1.5"><Calendar size={14} />
                {new Date(next.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <span className="flex items-center gap-1.5"><Clock size={14} />{next.time}</span>
            </div>
            {prop && (
              <div className="flex items-center gap-1.5 mt-2 text-sm opacity-80">
                <MapPin size={14} /> {prop.address}, {prop.location}
              </div>
            )}
            {agent && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {agent.initials}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{agent.name}</div>
                    <div className="text-xs opacity-70">Votre agent</div>
                  </div>
                </div>
                <a href={`tel:${agent.phone}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors">
                  <Phone size={13} /> Appeler
                </a>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-gray-200">
        {([
          { id: 'a_venir', label: `À venir (${upcoming.length})` },
          { id: 'passes',  label: `Passés (${past.length})` },
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

      {/* List */}
      <div className="space-y-3">
        {displayed.map((visit) => {
          const prop  = properties.find((p) => p.id === visit.propertyId);
          const agent = agents.find((a) => a.id === visit.agentId);
          const st    = STATUS_CONFIG[visit.status as RdvStatus] ?? STATUS_CONFIG.planifie;
          const StatusIcon = st.Icon;

          return (
            <div key={visit.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {prop?.title ?? 'Visite immobilière'}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(visit.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={11} />{visit.time}</span>
                    {prop && (
                      <span className="flex items-center gap-1"><MapPin size={11} />{prop.location}</span>
                    )}
                  </div>

                  {prop && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{prop.surface} m²</span>
                      {prop.rooms && <span>· {prop.rooms} pièces</span>}
                      <span className="font-semibold text-gray-700">
                        {new Intl.NumberFormat('fr-TN').format(prop.price)} DT
                      </span>
                    </div>
                  )}
                </div>

                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${st.color} ${st.bg}`}>
                  <StatusIcon size={11} />
                  {st.label}
                </span>
              </div>

              {agent && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {agent.initials}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700">{agent.name}</div>
                      <div className="text-xs text-gray-400">{agent.phone}</div>
                    </div>
                  </div>
                  {visit.status !== 'annule' && visit.status !== 'effectue' && (
                    <div className="flex items-center gap-1.5">
                      <a href={`tel:${agent.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
                        <Phone size={12} /> Contacter
                      </a>
                    </div>
                  )}
                  {visit.status === 'effectue' && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 size={13} /> Visite terminée
                    </div>
                  )}
                </div>
              )}

              {visit.notes && (
                <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <User size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Note de l'agent</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">{visit.notes}</p>
                </div>
              )}
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <AlertCircle size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun rendez-vous {tab === 'a_venir' ? 'à venir' : 'passé'}</p>
            {tab === 'a_venir' && (
              <p className="text-xs mt-1">Contactez votre agent pour planifier une visite</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
