import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Edit2, Trash2, MapPin, Banknote,
  Calendar, Eye, MessageSquare, User, Clock, CheckCircle2,
  Star,
} from 'lucide-react';
import { useClientsStore } from '../../store/clientsStore';
import { PropertyMatches } from '../../components/PropertyMatches';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import { ClientForm } from './ClientForm';
import type { Client, Visit } from '../../types';

const TYPE_LABELS: Record<Client['type'], string> = {
  acheteur: 'Acheteur',
  locataire: 'Locataire',
  proprietaire: 'Propriétaire',
};

const SOURCE_LABELS: Record<Client['source'], string> = {
  appel: 'Appel entrant', web: 'Site web', email: 'Email',
  passage: 'Passage agence', recommandation: 'Recommandation',
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', mubawab: 'Mubawab',
};

const STATUS_BADGE: Record<Client['status'], 'actif' | 'a_relancer' | 'compromis' | 'cloture'> = {
  actif: 'actif', a_relancer: 'a_relancer', compromis: 'compromis', cloture: 'cloture',
};

// Mock interaction history
const buildHistory = (client: Client, visits: Visit[]) => {
  const clientVisits = visits.filter((v) => v.clientId === client.id);
  const events = [
    {
      id: 'ev-0',
      type: 'creation' as const,
      date: client.createdAt,
      time: '09:15',
      text: 'Fiche client créée',
      icon: User,
      color: 'text-gray-500 bg-gray-100',
    },
    ...clientVisits.map((v) => ({
      id: v.id,
      type: 'visite' as const,
      date: v.date,
      time: v.time,
      text: `Visite ${v.status === 'effectue' ? 'effectuée' : 'planifiée'}${v.crSubmitted ? ' · C.R. soumis' : ''}`,
      icon: v.status === 'effectue' ? CheckCircle2 : Calendar,
      color: v.status === 'effectue' ? 'text-success bg-success-light' : 'text-primary bg-primary-light',
    })),
    {
      id: 'ev-lc',
      type: 'appel' as const,
      date: client.lastContact,
      time: '14:30',
      text: 'Dernier contact téléphonique',
      icon: Phone,
      color: 'text-warning bg-warning-light',
    },
  ];
  return events.sort((a, b) => b.date.localeCompare(a.date));
};

type TabId = 'historique' | 'biens' | 'notes';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useClientsStore();
  const { agents, visits } = useAgentsStore();
  const { properties } = usePropertiesStore();

  const [activeTab, setActiveTab] = useState<TabId>('historique');
  const [editOpen, setEditOpen]   = useState(false);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <User size={36} className="mb-3 opacity-30" />
        <p>Client introuvable</p>
        <button onClick={() => navigate('/admin/clients')} className="mt-3 text-primary text-sm hover:underline">
          ← Retour à la liste
        </button>
      </div>
    );
  }

  const agent = agents.find((a) => a.id === client.agentId);
  const history = buildHistory(client, visits);
  const clientVisits = visits.filter((v) => v.clientId === client.id);

  // Matching properties based on client preferences
  const matchingProps = properties.filter((p) => {
    if (!client.propertyPreferences) return false;
    const prefs = client.propertyPreferences;
    if (prefs.type && !prefs.type.includes(p.type)) return false;
    if (prefs.locations && !prefs.locations.some((l) => p.location.includes(l))) return false;
    if (prefs.minSurface && p.surface < prefs.minSurface) return false;
    if (client.budget && p.price > client.budget.max * 1.1) return false;
    return p.status === 'disponible';
  }).slice(0, 4);

  const handleStatusChange = (status: Client['status']) => {
    updateClient(client.id, { status });
  };

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: 'historique', label: 'Historique', count: history.length },
    { id: 'biens', label: 'Biens correspondants', count: matchingProps.length },
    { id: 'notes', label: 'Notes' },
  ];

  const initials = client.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/clients')}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <Avatar initials={initials} size="md" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">{client.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{TYPE_LABELS[client.type]}</span>
                  <span className="text-gray-200">·</span>
                  <Badge variant={STATUS_BADGE[client.status]} size="sm" dot />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value as Client['status'])}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="actif">Actif</option>
              <option value="a_relancer">À relancer</option>
              <option value="compromis">Compromis</option>
              <option value="cloture">Clôturé</option>
            </select>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={13} /> Modifier
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-danger/30 rounded-lg text-xs text-danger hover:bg-danger-light transition-colors">
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left — tabs */}
          <div className="col-span-2 space-y-5">
            {/* Quick contact bar */}
            <div className="flex items-center gap-3">
              <PhoneReveal
                phone={client.phone}
                name={client.name}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone size={15} /> {client.phone}
              </PhoneReveal>
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail size={15} /> {client.email}
                </a>
              )}
              <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={12} />
                Dernier contact : {new Date(client.lastContact).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Tabs */}
            <Card padding="none">
              <div className="flex border-b border-gray-200 px-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors -mb-px',
                      activeTab === tab.id
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700',
                    ].join(' ')}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        activeTab === tab.id ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Historique */}
                {activeTab === 'historique' && (
                  <div className="relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                    <div className="space-y-5">
                      {history.map((ev) => {
                        const Icon = ev.icon;
                        return (
                          <div key={ev.id} className="flex items-start gap-4 relative">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${ev.color}`}>
                              <Icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="text-sm text-gray-800">{ev.text}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {new Date(ev.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long', day: 'numeric', month: 'long',
                                })}
                                {ev.time && ` · ${ev.time}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Biens correspondants */}
                {activeTab === 'biens' && <PropertyMatches client={client} />}

                {/* Notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {client.notes && (
                      <div className="p-4 bg-warning-light rounded-lg border border-warning/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <MessageSquare size={13} className="text-warning" />
                          <span className="text-xs font-medium text-warning">Note existante</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-5">{client.notes}</p>
                      </div>
                    )}
                    <textarea
                      placeholder="Ajouter une note sur ce client…"
                      rows={4}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                    <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                      Enregistrer la note
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Infos principales */}
            <Card>
              <div className="text-xs font-medium text-gray-500 mb-3">Informations</div>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Source" value={SOURCE_LABELS[client.source]} />
                <InfoRow
                  label="Créé le"
                  value={new Date(client.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                />
                <InfoRow label="Type" value={TYPE_LABELS[client.type]} />
                <InfoRow
                  label="Visites"
                  value={`${clientVisits.length} visite${clientVisits.length !== 1 ? 's' : ''}`}
                />
              </div>
            </Card>

            {/* Budget & Recherche */}
            {(client.budget || client.search) && (
              <Card>
                <div className="text-xs font-medium text-gray-500 mb-3">Recherche</div>
                {client.budget && (
                  <div className="flex items-center gap-2 mb-3">
                    <Banknote size={14} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Budget</div>
                      <div className="text-sm font-medium text-gray-800">
                        {new Intl.NumberFormat('fr-TN').format(client.budget.min)} —{' '}
                        {new Intl.NumberFormat('fr-TN').format(client.budget.max)} DT
                      </div>
                    </div>
                  </div>
                )}
                {client.search && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-5">{client.search}</p>
                  </div>
                )}
                {client.propertyPreferences?.locations && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {client.propertyPreferences.locations.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Satisfaction meter */}
            <Card>
              <div className="text-xs font-medium text-gray-500 mb-3">Niveau d'intérêt estimé</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={s <= 3 ? 'text-warning fill-warning' : 'text-gray-200'}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">3/5</span>
              </div>
              <p className="text-xs text-gray-400">Basé sur les comptes-rendus de visites</p>
            </Card>

            {/* Agent */}
            {agent && (
              <Card>
                <div className="text-xs font-medium text-gray-500 mb-3">Agent référent</div>
                <div className="flex items-center gap-3">
                  <Avatar initials={agent.initials} size="sm" status={agent.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.phone}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <div className="text-xs font-medium text-gray-500 mb-3">Actions rapides</div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
                  <Calendar size={13} /> Planifier un RDV
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye size={13} /> Proposer un bien
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare size={13} /> Envoyer un message
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Drawer modification */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le client"
        subtitle={client.name}
        width="lg"
      >
        <ClientForm
          client={client}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Drawer>
    </>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-gray-400 text-xs">{label}</span>
    <span className="text-gray-800 text-xs font-medium">{value}</span>
  </div>
);
