import React, { useState } from 'react';
import {
  FileText, Upload, Download, Eye, Search,
  CheckCircle2, Clock, AlertCircle, X, Plus, FolderOpen,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';

type DocType    = 'mandat_vente' | 'mandat_location' | 'compromis' | 'acte' | 'bail' | 'autre';
type DocStatus  = 'brouillon' | 'en_attente_signature' | 'signe' | 'expire';

interface Document {
  id: string;
  type: DocType;
  title: string;
  propertyId?: string;
  clientId?: string;
  status: DocStatus;
  createdAt: string;
  expiresAt?: string;
  signedAt?: string;
  size: string;
}

const DOC_TYPE_CONFIG: Record<DocType, { label: string; color: string; icon: string }> = {
  mandat_vente:       { label: 'Mandat de vente',      color: 'text-primary',  icon: '📋' },
  mandat_location:    { label: 'Mandat de location',   color: 'text-purple',   icon: '🏠' },
  compromis:          { label: 'Compromis de vente',   color: 'text-warning',  icon: '🤝' },
  acte:               { label: 'Acte notarié',         color: 'text-success',  icon: '⚖️' },
  bail:               { label: 'Contrat de bail',      color: 'text-purple',   icon: '📄' },
  autre:              { label: 'Autre document',        color: 'text-gray-500', icon: '📁' },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; variant: 'gray' | 'a_relancer' | 'disponible' | 'urgent' }> = {
  brouillon:            { label: 'Brouillon',         variant: 'gray' },
  en_attente_signature: { label: 'À signer',          variant: 'a_relancer' },
  signe:                { label: 'Signé',             variant: 'disponible' },
  expire:               { label: 'Expiré',            variant: 'urgent' },
};

const MOCK_DOCS: Document[] = [];

export const AdminDocuments: React.FC = () => {
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();

  const [docs]          = useState<Document[]>(MOCK_DOCS);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter]   = useState<DocType | ''>('');
  const [statusFilter, setStatusFilter] = useState<DocStatus | ''>('');
  const [drawerOpen, setDrawerOpen]   = useState(false);

  const filtered = docs.filter((d) => {
    if (typeFilter && d.type !== typeFilter)     return false;
    if (statusFilter && d.status !== statusFilter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total:    docs.length,
    signe:    docs.filter((d) => d.status === 'signe').length,
    attente:  docs.filter((d) => d.status === 'en_attente_signature').length,
    expire:   docs.filter((d) => d.status === 'expire').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Documents & Mandats</h2>
          <p className="text-sm text-gray-400">{docs.length} documents · {counts.attente} en attente de signature</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Nouveau document
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Total" value={counts.total} Icon={FolderOpen} color="text-gray-600" bg="bg-gray-100" />
        <SummaryCard label="Signés" value={counts.signe} Icon={CheckCircle2} color="text-success" bg="bg-success-light" />
        <SummaryCard label="À signer" value={counts.attente} Icon={Clock} color="text-warning" bg="bg-warning-light" />
        <SummaryCard label="Expirés" value={counts.expire} Icon={AlertCircle} color="text-danger" bg="bg-danger-light" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DocType | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous types</option>
          {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DocStatus | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(search || typeFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }} className="flex items-center gap-1 text-xs text-danger hover:underline">
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.map((doc) => {
          const typeCfg   = DOC_TYPE_CONFIG[doc.type];
          const statusCfg = STATUS_CONFIG[doc.status];
          const property  = doc.propertyId ? properties.find((p) => p.id === doc.propertyId) : undefined;
          const client    = doc.clientId ? clients.find((c) => c.id === doc.clientId) : undefined;
          const isExpiringSoon = doc.expiresAt && doc.status !== 'expire' && doc.status !== 'signe' &&
            new Date(doc.expiresAt).getTime() - Date.now() < 30 * 86400000;

          return (
            <Card key={doc.id} padding="none">
              <div className="flex items-center gap-4 px-4 py-3">
                {/* Icon */}
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {typeCfg.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{doc.title}</span>
                    {isExpiringSoon && <Badge variant="urgent" size="sm" label="Expire bientôt" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className={`font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
                    {property && <span>· {property.title.split(' ').slice(0, 3).join(' ')}</span>}
                    {client   && <span>· {client.name}</span>}
                    <span>· {doc.size}</span>
                    {doc.signedAt && <span>· Signé le {new Date(doc.signedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>}
                    {doc.expiresAt && <span>· Expire {new Date(doc.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={statusCfg.variant} size="sm" label={statusCfg.label} />
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-primary">
                    <Eye size={14} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-primary">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <FileText size={36} className="mb-3 opacity-30" />
            <p className="text-sm">{docs.length === 0 ? 'Aucun document pour le moment' : 'Aucun document ne correspond'}</p>
            {docs.length === 0 && <p className="text-xs mt-1">Cliquez sur « Nouveau document » pour en ajouter un</p>}
          </div>
        )}
      </div>

      {/* Upload placeholder drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center" onClick={() => setDrawerOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Ajouter un document</h3>
            <p className="text-sm text-gray-400 mb-5">Importez un fichier PDF ou Word</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors">
              <Upload size={24} className="text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">Glissez un fichier ici</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX — max 10 Mo</p>
              <button className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                Parcourir…
              </button>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="mt-4 w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; Icon: React.FC<{ size?: number; className?: string }>; color: string; bg: string }> = ({ label, value, Icon, color, bg }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${bg}`}>
      <Icon size={16} className={color} />
    </div>
    <div className="text-lg font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);
