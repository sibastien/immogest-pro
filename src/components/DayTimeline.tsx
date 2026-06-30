import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { DayBlock } from '../types';

const START = 9 * 60;   // 09:00
const END = 18 * 60;    // 18:00
const STEP = 15;        // minutes per slot
const SLOT_H = 18;      // px per slot
const SLOTS = (END - START) / STEP; // 36

const COLORS: Record<string, { block: string; dot: string; label: string }> = {
  blue:   { block: 'bg-primary-light border-primary/40 text-primary',   dot: 'bg-primary',  label: 'Bleu' },
  green:  { block: 'bg-success-light border-success/40 text-success',   dot: 'bg-success',  label: 'Vert' },
  orange: { block: 'bg-warning-light border-warning/40 text-warning',   dot: 'bg-warning',  label: 'Orange' },
  purple: { block: 'bg-purple-light border-purple/40 text-purple',      dot: 'bg-purple',   label: 'Violet' },
  red:    { block: 'bg-danger-light border-danger/40 text-danger',      dot: 'bg-danger',   label: 'Rouge' },
};

const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

interface Props {
  blocks: DayBlock[];
  editable: boolean;
  isToday?: boolean;
  onCreate: (b: { start: string; end: string; label: string; color: string }) => void;
  onUpdate: (id: string, patch: { label?: string; color?: string }) => void;
  onDelete: (id: string) => void;
}

type Editing =
  | { mode: 'create'; start: string; end: string; label: string; color: string }
  | { mode: 'edit'; id: string; start: string; end: string; label: string; color: string };

export const DayTimeline: React.FC<Props> = ({ blocks, editable, isToday, onCreate, onUpdate, onDelete }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [now, setNow] = useState(() => new Date().getHours() * 60 + new Date().getMinutes());

  // Refresh the "now" line every minute.
  useEffect(() => {
    if (!isToday) return;
    const t = setInterval(() => setNow(new Date().getHours() * 60 + new Date().getMinutes()), 60000);
    return () => clearInterval(t);
  }, [isToday]);

  const slotFromEvent = (clientY: number) => {
    const rect = gridRef.current!.getBoundingClientRect();
    const y = clientY - rect.top;
    return Math.max(0, Math.min(SLOTS - 1, Math.floor(y / SLOT_H)));
  };

  // Drag selection (mouse + touch via pointer events).
  useEffect(() => {
    if (!drag) return;
    const move = (e: MouseEvent) => setDrag((d) => (d ? { ...d, b: slotFromEvent(e.clientY) } : d));
    const up = () => {
      setDrag((d) => {
        if (d) {
          const s = Math.min(d.a, d.b);
          const e = Math.max(d.a, d.b) + 1; // inclusive end slot
          setEditing({ mode: 'create', start: toHHMM(START + s * STEP), end: toHHMM(START + e * STEP), label: '', color: 'blue' });
        }
        return null;
      });
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag]);

  const handleDown = (e: React.MouseEvent) => {
    if (!editable || editing) return;
    const slot = slotFromEvent(e.clientY);
    setDrag({ a: slot, b: slot });
  };

  const save = () => {
    if (!editing) return;
    if (editing.mode === 'create') onCreate({ start: editing.start, end: editing.end, label: editing.label, color: editing.color });
    else onUpdate(editing.id, { label: editing.label, color: editing.color });
    setEditing(null);
  };

  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START + i * 60);

  return (
    <div className="flex gap-2 select-none">
      {/* Hour labels */}
      <div className="relative flex-shrink-0 w-12" style={{ height: SLOTS * SLOT_H }}>
        {hours.map((m) => (
          <div key={m} className="absolute right-1 text-xs text-gray-400 -translate-y-1/2" style={{ top: ((m - START) / STEP) * SLOT_H }}>
            {toHHMM(m)}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        onMouseDown={handleDown}
        className={`relative flex-1 rounded-lg border border-gray-200 bg-white overflow-hidden ${editable ? 'cursor-crosshair' : ''}`}
        style={{ height: SLOTS * SLOT_H }}
      >
        {/* Hour gridlines */}
        {Array.from({ length: SLOTS }, (_, i) => (
          <div key={i} className={`absolute left-0 right-0 ${i % 4 === 0 ? 'border-t border-gray-200' : 'border-t border-gray-50'}`} style={{ top: i * SLOT_H }} />
        ))}

        {/* Existing blocks */}
        {blocks.map((b) => {
          const top = ((toMin(b.start) - START) / STEP) * SLOT_H;
          const height = Math.max(SLOT_H, ((toMin(b.end) - toMin(b.start)) / STEP) * SLOT_H);
          const c = COLORS[b.color] ?? COLORS.blue;
          return (
            <div
              key={b.id}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => editable && setEditing({ mode: 'edit', id: b.id, start: b.start, end: b.end, label: b.label, color: b.color })}
              className={`absolute left-1 right-1 rounded-md border px-2 py-0.5 overflow-hidden ${c.block} ${editable ? 'cursor-pointer hover:brightness-95' : ''}`}
              style={{ top: top + 1, height: height - 2 }}
            >
              <div className="text-[10px] font-mono opacity-70">{b.start}–{b.end}</div>
              <div className="text-xs font-medium leading-tight truncate">{b.label || '(sans titre)'}</div>
            </div>
          );
        })}

        {/* Drag preview */}
        {drag && (() => {
          const s = Math.min(drag.a, drag.b); const e = Math.max(drag.a, drag.b) + 1;
          return <div className="absolute left-1 right-1 rounded-md border-2 border-dashed border-primary bg-primary-light/50" style={{ top: s * SLOT_H, height: (e - s) * SLOT_H }} />;
        })()}

        {/* Now line */}
        {isToday && now >= START && now <= END && (
          <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: ((now - START) / STEP) * SLOT_H }}>
            <div className="h-px bg-danger relative">
              <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-danger" />
            </div>
          </div>
        )}
      </div>

      {/* Editor popup */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Créneau · {editing.start} – {editing.end}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <label className="block text-xs font-medium text-gray-600 mb-1.5">Activité</label>
            <input
              autoFocus
              type="text"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="Ex: Appels prospects, Visite villa La Marsa…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <label className="block text-xs font-medium text-gray-600 mt-3 mb-1.5">Couleur</label>
            <div className="flex gap-2">
              {Object.entries(COLORS).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setEditing({ ...editing, color: key })}
                  className={`w-7 h-7 rounded-full ${c.dot} ${editing.color === key ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  title={c.label}
                />
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              {editing.mode === 'edit' && (
                <button
                  onClick={() => { onDelete(editing.id); setEditing(null); }}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 border border-danger/30 text-danger rounded-lg text-sm hover:bg-danger-light"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={save} className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
