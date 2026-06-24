import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, User, Phone, Home, Clock, CheckCircle2,
  FileText, AlertCircle, Navigation, Calendar,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useClientsStore } from '../../store/clientsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { Badge } from '../../components/ui/Badge';

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'disponible' | 'gray'; Icon: React.FC<{ size?: number; className?: string }> }> = {
  planifie:  { label: 'Planifiée',  variant: 'info',       Icon: Clock },
  confirme:  { label: 'Confirmée',  variant: 'info',       Icon: Clock },
  en_cours:  { label: 'En cours',   variant: 'info',       Icon: Clock },
  effectue:  { label: 'Effectuée',  variant: 'disponible', Icon: CheckCircle2 },
  annule:    { label: 'Annulée',    variant: 'gray',       Icon: AlertCircle },
};

export const VisiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { visits, comptesRendus } = useAgentsStore();
  const { clients }               = useClientsStore();
  const { properties }            = usePropertiesStore();

  const visit = visits.find((v) => v.id === id);

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-6">
        <AlertCircle size={32} className="mb-3 opacity-30" />
        <p className="text-sm text-center">Visite introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-primary text-sm">← Retour</button>
      </div>
    );
  }

  const client   = clients.find((c) => c.id === visit.clientId);
  const property = properties.find((p) => p.id === visit.propertyId);
  const cr       = comptesRendus.find((r) => r.visitId === visit.id);
  const status     = STATUS_MAP[visit.status] ?? STATUS_MAP['planifie'];
  const StatusIcon = status.Icon;

  const dateStr = new Date(visit.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

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
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">Détail visite</h1>
            <p className="text-xs text-gray-400">{visit.id.toUpperCase()}</p>
          </div>
          <Badge variant={status.variant} size="sm" dot />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Date & heure */}
        <div className="bg-primary-light rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-primary capitalize">{dateStr}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={13} className="text-primary/70" />
                <span className="text-sm text-primary/80">{visit.time}</span>
                <span className="text-primary/40 mx-1">·</span>
                <StatusIcon size={13} className="text-primary/70" />
                <span className="text-sm text-primary/80">{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bien */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Home size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bien visité</span>
          </div>
          {property ? (
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{property.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{property.surface} m²</span>
                    {property.rooms && <span>· {property.rooms} pièces</span>}
                    {property.bathrooms && <span>· {property.bathrooms} SDB</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary">
                    {new Intl.NumberFormat('fr-TN').format(property.price)} DT
                    {property.priceType === 'mois' && <span className="text-xs font-normal text-gray-400">/mois</span>}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{property.ref}</div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-4 h-28 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                <Navigation size={20} className="mb-1.5 opacity-40" />
                <span className="text-xs">{property.address}</span>
                <span className="text-xs opacity-60 mt-0.5">{property.location}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-400 text-center">Bien non trouvé</div>
          )}
        </div>

        {/* Client */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</span>
          </div>
          {client ? (
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {client.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{client.phone}</div>
                </div>
                <a
                  href={`tel:${client.phone}`}
                  className="w-9 h-9 bg-success rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Phone size={16} className="text-white" />
                </a>
              </div>
              {client.budget && (
                <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-400">Budget client</div>
                  <div className="text-sm font-semibold text-gray-800 mt-0.5">
                    {new Intl.NumberFormat('fr-TN').format(client.budget.min)} — {new Intl.NumberFormat('fr-TN').format(client.budget.max)} DT
                  </div>
                </div>
              )}
              {client.notes && (
                <div className="mt-3 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
                  {client.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-400 text-center">Client non trouvé</div>
          )}
        </div>

        {/* Compte-rendu */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Compte-rendu</span>
          </div>
          {cr ? (
            <div className="p-4 space-y-3">
              {/* Stars */}
              <div>
                <div className="text-xs text-gray-400 mb-1.5">Note client</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-xl ${s <= cr.clientInterest ? 'text-warning' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
              </div>

              {/* Résultat */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Résultat</div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                  cr.result === 'offre_probable'
                    ? 'bg-success-light text-success'
                    : cr.result === 'a_revoir'
                    ? 'bg-warning-light text-warning'
                    : 'bg-danger-light text-danger'
                }`}>
                  {cr.result === 'offre_probable' ? 'Offre probable'
                    : cr.result === 'a_revoir' ? 'À revoir'
                    : 'Refus'}
                </span>
              </div>

              {/* Notes */}
              {cr.notes && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Notes</div>
                  <p className="text-sm text-gray-700 leading-5">{cr.notes}</p>
                </div>
              )}

              {/* Suivi */}
              {cr.followUp && cr.followUp.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">Suivi prévu</div>
                  <ul className="space-y-1">
                    {cr.followUp.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : visit.status === 'effectue' ? (
            <div className="p-5 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun compte-rendu soumis</p>
              <button
                onClick={() => navigate(`/agent-terrain/compte-rendu/${visit.id}`)}
                className="mt-3 px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Rédiger le C.R.
              </button>
            </div>
          ) : (
            <div className="p-4 text-xs text-gray-400 text-center italic">
              Disponible après la visite
            </div>
          )}
        </div>

        {/* CTA principal */}
        {visit.status === 'planifie' && (
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/agent-terrain/compte-rendu/${visit.id}`)}
              className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
            >
              Soumettre le compte-rendu
            </button>
            <p className="text-center text-xs text-gray-400">La visite sera marquée comme effectuée</p>
          </div>
        )}

        {visit.status === 'effectue' && !cr && (
          <button
            onClick={() => navigate(`/agent-terrain/compte-rendu/${visit.id}`)}
            className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
          >
            Rédiger le compte-rendu
          </button>
        )}
      </div>
    </div>
  );
};
