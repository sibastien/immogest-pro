import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Maximize2, BedDouble, Bath, Car, Sofa,
  Building2, Layers, Edit2, Trash2, CheckCircle2, Clock,
  Phone, Eye, ArrowLeftRight, Calendar,
} from 'lucide-react';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useAgentsStore } from '../../store/agentsStore';
import { useClientsStore } from '../../store/clientsStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { PropertyForm } from './PropertyForm';
import type { PropertyType, PropertyStatus } from '../../types';

const TYPE_LABELS: Record<PropertyType, string> = {
  vente_residentielle: 'Vente résidentielle',
  location_residentielle: 'Location résidentielle',
  commercial: 'Local commercial',
  terrain: 'Terrain / Foncier',
};

const STATUS_BADGE: Record<PropertyStatus, 'disponible' | 'sous_compromis' | 'loue' | 'vendu'> = {
  disponible: 'disponible',
  sous_compromis: 'sous_compromis',
  loue: 'loue',
  vendu: 'vendu',
};

const VISIT_STATUS_LABELS: Record<string, string> = {
  planifie: 'Planifiée', confirme: 'Confirmée', en_cours: 'En cours',
  effectue: 'Effectuée', annule: 'Annulée',
};

function formatPrice(price: number, priceType: 'vente' | 'mois'): string {
  return `${new Intl.NumberFormat('fr-TN').format(price)} DT${priceType === 'mois' ? '/mois' : ''}`;
}

type TabId = 'visites' | 'transactions' | 'notes';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, updateProperty, deleteProperty } = usePropertiesStore();
  const { agents, visits, transactions } = useAgentsStore();
  const { clients } = useClientsStore();

  const [activeTab, setActiveTab]   = useState<TabId>('visites');
  const [editOpen, setEditOpen]     = useState(false);

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Building2 size={36} className="mb-3 opacity-30" />
        <p>Bien introuvable</p>
        <button onClick={() => navigate('/admin/biens')} className="mt-3 text-primary text-sm hover:underline">
          ← Retour à la liste
        </button>
      </div>
    );
  }

  const agent = agents.find((a) => a.id === property.agentId);
  const propVisits = visits.filter((v) => v.propertyId === property.id);
  const propTransactions = transactions.filter((t) => t.propertyId === property.id);

  const handleStatusChange = (status: PropertyStatus) => {
    updateProperty(property.id, { status });
  };

  const handleDelete = () => {
    if (confirm(`Supprimer le bien "${property.title}" ? Cette action est irréversible.`)) {
      deleteProperty(property.id);
      navigate('/admin/biens');
    }
  };

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: 'visites',      label: 'Visites',      count: propVisits.length },
    { id: 'transactions', label: 'Transactions', count: propTransactions.length },
    { id: 'notes',        label: 'Notes',        count: 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/biens')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-400">{property.ref}</span>
              <Badge variant={STATUS_BADGE[property.status]} dot />
            </div>
            <h2 className="text-base font-semibold text-gray-900 leading-tight">{property.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Changer statut */}
          <select
            value={property.status}
            onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="disponible">Disponible</option>
            <option value="sous_compromis">Sous compromis</option>
            <option value="loue">Loué</option>
            <option value="vendu">Vendu</option>
          </select>

          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={13} /> Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-danger/30 rounded-lg text-xs text-danger hover:bg-danger-light transition-colors"
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left col — photos + details */}
        <div className="col-span-2 space-y-5">
          {/* Photo gallery */}
          {property.photos && property.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 h-56">
              <a
                href={property.photos[0]}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 rounded-xl overflow-hidden bg-gray-100 block"
              >
                <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
              </a>
              <div className="flex flex-col gap-2">
                {property.photos.slice(1, 4).map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="flex-1 rounded-xl overflow-hidden bg-gray-100 block">
                    <img src={url} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
                  </a>
                ))}
                {Array.from({ length: Math.max(0, 3 - (property.photos.length - 1)) }).map((_, i) => (
                  <div key={`ph-${i}`} className="flex-1 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-300">
                <Building2 size={40} className="mx-auto mb-2" />
                <div className="text-sm">Aucune photo</div>
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-6">{property.description}</p>
            </Card>
          )}

          {/* Caractéristiques */}
          <Card>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-3 gap-4">
              <SpecItem icon={Maximize2} label="Surface" value={`${property.surface} m²`} />
              {property.rooms && <SpecItem icon={BedDouble} label="Chambres" value={String(property.rooms)} />}
              {property.bathrooms && <SpecItem icon={Bath} label="Salles de bain" value={String(property.bathrooms)} />}
              {property.floor !== undefined && (
                <SpecItem icon={Layers} label="Étage" value={`${property.floor} / ${property.totalFloors ?? '?'}`} />
              )}
              {property.parking !== undefined && (
                <SpecItem icon={Car} label="Parking" value={property.parking ? 'Oui' : 'Non'} />
              )}
              {property.furnished !== undefined && (
                <SpecItem icon={Sofa} label="Meublé" value={property.furnished ? 'Oui' : 'Non'} />
              )}
            </div>

            {property.features && property.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">Équipements & prestations</div>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map((f) => (
                    <span key={f} className="px-2.5 py-1 bg-primary-light text-primary text-xs rounded-full font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Tabs — Visites / Transactions / Notes */}
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
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      activeTab === tab.id ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'visites' && (
                propVisits.length === 0 ? (
                  <EmptyTab icon={Eye} text="Aucune visite enregistrée pour ce bien" />
                ) : (
                  <div className="space-y-2">
                    {propVisits.map((visit) => {
                      const visitAgent  = agents.find((a) => a.id === visit.agentId);
                      const visitClient = clients.find((c) => c.id === visit.clientId);
                      return (
                        <div key={visit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            visit.status === 'effectue' ? 'bg-success-light' : 'bg-primary-light'
                          }`}>
                            {visit.status === 'effectue'
                              ? <CheckCircle2 size={15} className="text-success" />
                              : <Clock size={15} className="text-primary" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800">
                              {visitClient?.name ?? '—'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(visit.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              {' · '}
                              {visit.time}
                              {visitAgent && ` · ${visitAgent.name}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {visit.crSubmitted && (
                              <span className="text-xs text-success font-medium">C.R. soumis</span>
                            )}
                            <Badge
                              variant={visit.status === 'effectue' ? 'disponible' : visit.status === 'confirme' ? 'compromis' : 'a_relancer'}
                              size="sm"
                              label={VISIT_STATUS_LABELS[visit.status]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {activeTab === 'transactions' && (
                propTransactions.length === 0 ? (
                  <EmptyTab icon={ArrowLeftRight} text="Aucune transaction liée à ce bien" />
                ) : (
                  <div className="space-y-2">
                    {propTransactions.map((tx) => {
                      const txAgent  = agents.find((a) => a.id === tx.agentId);
                      const txClient = clients.find((c) => c.id === tx.clientId);
                      return (
                        <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-warning-light flex items-center justify-center flex-shrink-0">
                            <ArrowLeftRight size={14} className="text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800">
                              {txClient?.name ?? '—'}
                            </div>
                            <div className="text-xs text-gray-400">
                              Réf. {tx.ref} · {txAgent?.name ?? '—'}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-gray-900">
                              {tx.amount.toLocaleString('fr-TN')} DT
                            </div>
                            <div className="text-xs text-success">
                              Comm. {tx.commission.toLocaleString('fr-TN')} DT
                            </div>
                          </div>
                          <Badge
                            variant={tx.stage === 'cloture' ? 'vendu' : tx.stage === 'compromis' ? 'sous_compromis' : 'info'}
                            size="sm"
                            label={tx.stage.charAt(0).toUpperCase() + tx.stage.slice(1)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Ajouter une note interne…"
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

        {/* Right col — prix, agent, actions */}
        <div className="space-y-4">
          {/* Prix */}
          <Card>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(property.price, property.priceType)}
            </div>
            <div className="text-xs text-gray-400 mb-4">
              {TYPE_LABELS[property.type]}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Réf.</span>
                <span className="font-mono text-gray-800 text-xs">{property.ref}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Surface</span>
                <span className="text-gray-800">{property.surface} m²</span>
              </div>
              {property.rooms && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pièces</span>
                  <span className="text-gray-800">{property.rooms} pièces</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ajouté le</span>
                <span className="text-gray-800">
                  {new Date(property.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </Card>

          {/* Localisation */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Localisation</span>
            </div>
            <div className="text-sm text-gray-800 font-medium">{property.location}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-5">{property.address}</div>
            {/* Map placeholder */}
            <div className="mt-3 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
              Carte Google Maps
            </div>
          </Card>

          {/* Agent */}
          {agent && (
            <Card>
              <div className="text-xs font-medium text-gray-500 mb-3">Agent responsable</div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={agent.initials} size="md" status={agent.status} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-400">
                    {agent.role === 'agent_terrain' ? 'Agent terrain' : 'Agent bureau'}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center justify-center gap-1.5 w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone size={13} /> {agent.phone}
              </a>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <div className="text-xs font-medium text-gray-500 mb-3">Actions rapides</div>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
                <Calendar size={13} /> Planifier une visite
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={13} /> Modifier le bien
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye size={13} /> Voir dans le catalogue
              </button>
            </div>
          </Card>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-semibold text-primary">{propVisits.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">Visites</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-semibold text-success">{propTransactions.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">Transactions</div>
            </div>
          </div>
        </div>
      </div>
      {/* Drawer — Modification */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le bien"
        subtitle={property.ref}
        width="xl"
      >
        <PropertyForm
          property={property}
          onSuccess={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Drawer>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SpecItem: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
    <div className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-gray-500" />
    </div>
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  </div>
);

const EmptyTab: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  text: string;
}> = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center py-8 text-gray-400">
    <Icon size={28} className="mb-2 opacity-30" />
    <p className="text-sm">{text}</p>
  </div>
);
