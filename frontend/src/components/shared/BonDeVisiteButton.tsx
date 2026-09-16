import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { printBonDeVisite } from '../../lib/bonDeVisite';

interface Props {
  clientName?: string;
  visitDate?: string;   // ISO
  propertyRef?: string;
  className?: string;
  children?: React.ReactNode; // custom button content
}

// Button that opens a form to complete the "Bon de visite" fields, then prints.
export const BonDeVisiteButton: React.FC<Props> = ({ clientName, visitDate, propertyRef, className, children }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientName: clientName ?? '',
    cin: '',
    delivreeLe: '',
    delivreeA: '',
    visitDate: visitDate ?? '',
    propertyRef: propertyRef ?? '',
    bien: '',
    faitA: '',
    signDate: new Date().toISOString().slice(0, 10),
  });

  const openForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Refresh the auto fields from the latest props each time it opens.
    setForm((f) => ({
      ...f,
      clientName: clientName ?? f.clientName,
      visitDate: visitDate ?? f.visitDate,
      propertyRef: propertyRef ?? f.propertyRef,
    }));
    setOpen(true);
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePrint = () => {
    printBonDeVisite(form);
    setOpen(false);
  };

  const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <>
      <button onClick={openForm} className={className} title="Imprimer le bon de visite">
        {children ?? (<><Printer size={13} /> Bon de visite</>)}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Bon de visite"
        subtitle="Complétez les champs avant l'impression"
        width="md"
      >
        <div className="space-y-4">
          <Field label="Nom et prénom du visiteur">
            <input className={input} value={form.clientName} onChange={(e) => set('clientName', e.target.value)} />
          </Field>
          <Field label="Carte d'identité N°">
            <input className={input} value={form.cin} onChange={(e) => set('cin', e.target.value)} placeholder="N° CIN" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Délivrée le">
              <input type="date" className={input} value={form.delivreeLe} onChange={(e) => set('delivreeLe', e.target.value)} />
            </Field>
            <Field label="Délivrée à">
              <input className={input} value={form.delivreeA} onChange={(e) => set('delivreeA', e.target.value)} placeholder="Lieu de délivrance" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date de la visite">
              <input type="date" className={input} value={form.visitDate} onChange={(e) => set('visitDate', e.target.value)} />
            </Field>
            <Field label="Référence du bien">
              <input className={input} value={form.propertyRef} onChange={(e) => set('propertyRef', e.target.value)} />
            </Field>
          </div>
          <Field label="Bien">
            <textarea className={`${input} resize-none`} rows={2} value={form.bien} onChange={(e) => set('bien', e.target.value)} placeholder="Désignation / description du bien…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fait à">
              <input className={input} value={form.faitA} onChange={(e) => set('faitA', e.target.value)} placeholder="Ville" />
            </Field>
            <Field label="Date">
              <input type="date" className={input} value={form.signDate} onChange={(e) => set('signDate', e.target.value)} />
            </Field>
          </div>

          <p className="text-xs text-gray-400">Les signatures se font à la main sur le document imprimé.</p>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
              <Printer size={15} /> Imprimer
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {children}
  </div>
);
