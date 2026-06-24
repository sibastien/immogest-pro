import React, { useState } from 'react';
import {
  Clock, User, CheckCircle2, Send, Calendar, Building2, Filter,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

const STATUS_BADGE = {
  disponible: 'disponible' as const,
  en_visite:  'info' as const,
  bureau:     'a_relancer' as const,
  hors_ligne: 'gray' as const,
};

export const CoordinatriceDispatch: React.FC = () => {
  const { agents, visits, addVisit } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();

  const [selectedProp,   setSelectedProp]   = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedAgent,  setSelectedAgent]  = useState('');
  const [date,           setDate]           = useState('');
  const [time,           setTime]           = useState('10:00');
  const [success,        setSuccess]        = useState(false);
  const [errors,         setErrors]         = useState<string[]>([]);

  const terrainAgents = agents.filter((a) => a.role === 'agent_terrain');
  const availableProps = properties.filter((p) => p.status === 'disponible');

  // Today's dispatched visits
  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits
    .filter((v) => v.date === today || v.date === '2024-12-23')
    .sort((a, b) => a.time.localeCompare(b.time));

  const validate = () => {
    const e: string[] = [];
    if (!selectedProp)   e.push('Sélectionnez un bien');
    if (!selectedClient) e.push('Sélectionnez un client');
    if (!selectedAgent)  e.push('Sélectionnez un agent');
    if (!date)           e.push('Choisissez une date');
    setErrors(e);
    return e.length === 0;
  };

  const handleDispatch = () => {
    if (!validate()) return;
    addVisit({
      id:         `visit-${Date.now()}`,
      propertyId: selectedProp,
      clientId:   selectedClient,
      agentId:    selectedAgent,
      date,
      time,
      status:     'planifie',
      crSubmitted: false,
    });
    setSelectedProp('');
    setSelectedClient('');
    setSelectedAgent('');
    setDate('');
    setTime('10:00');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Form */}
      <div className="col-span-3 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dispatch visite</h2>
          <p className="text-sm text-gray-400">Assigner une visite à un agent terrain</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-success-light text-success text-sm rounded-xl border border-success/20">
            <CheckCircle2 size={16} /> Visite dispatché avec succès !
          </div>
        )}

        {errors.length > 0 && (
          <div className="px-4 py-3 bg-danger-light rounded-xl border border-danger/20 space-y-1">
            {errors.map((e) => <p key={e} className="text-xs text-danger">{e}</p>)}
          </div>
        )}

        <Card>
          <div className="space-y-4">
            <FormField label="Bien à visiter" Icon={Building2}>
              <select
                value={selectedProp}
                onChange={(e) => { setSelectedProp(e.target.value); setErrors([]); }}
                className={sel()}
              >
                <option value="">— Sélectionner un bien —</option>
                {availableProps.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} · {p.location}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Client" Icon={User}>
              <select
                value={selectedClient}
                onChange={(e) => { setSelectedClient(e.target.value); setErrors([]); }}
                className={sel()}
              >
                <option value="">— Sélectionner un client —</option>
                {clients.filter((c) => c.status === 'actif').map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Agent terrain" Icon={User}>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {terrainAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => { setSelectedAgent(agent.id); setErrors([]); }}
                    className={[
                      'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                      selectedAgent === agent.id ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <Avatar initials={agent.initials} size="sm" status={agent.status} />
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${selectedAgent === agent.id ? 'text-primary' : 'text-gray-800'}`}>
                        {agent.name.split(' ')[0]}
                      </div>
                      <Badge variant={STATUS_BADGE[agent.status]} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" Icon={Calendar}>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => { setDate(e.target.value); setErrors([]); }}
                  className={sel()}
                />
              </FormField>
              <FormField label="Heure" Icon={Clock}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={sel()}
                />
              </FormField>
            </div>

            <button
              onClick={handleDispatch}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple text-white font-medium text-sm rounded-xl hover:bg-purple/90 transition-colors"
            >
              <Send size={16} /> Dispatcher la visite
            </button>
          </div>
        </Card>
      </div>

      {/* Today's visits */}
      <div className="col-span-2 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Visites d'aujourd'hui</h3>
          <span className="ml-auto text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{todayVisits.length}</span>
        </div>

        <div className="space-y-2">
          {todayVisits.map((visit) => {
            const agent    = agents.find((a) => a.id === visit.agentId);
            const property = properties.find((p) => p.id === visit.propertyId);
            return (
              <div key={visit.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-primary">{visit.time}</span>
                  <Badge variant={visit.status === 'effectue' ? 'disponible' : 'info'} size="sm" dot />
                </div>
                <div className="text-xs font-medium text-gray-800 truncate mb-1">{property?.title ?? '—'}</div>
                {agent && (
                  <div className="flex items-center gap-1.5">
                    <Avatar initials={agent.initials} size="xs" />
                    <span className="text-xs text-gray-500">{agent.name.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            );
          })}
          {todayVisits.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Filter size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Aucune visite aujourd'hui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; Icon: React.FC<{ size?: number; className?: string }>; children: React.ReactNode }> = ({ label, Icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
      <Icon size={12} className="text-gray-400" /> {label}
    </label>
    {children}
  </div>
);

function sel() {
  return 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
}
