import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { DayTimeline } from '../../components/DayTimeline';
import { useDayPlanStore } from '../../store/dayPlanStore';
import { useAuthStore } from '../../store/authStore';
import type { DayBlock } from '../../types';
import { todayISO } from '../../lib/today';

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function dayLabel(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const MaJournee: React.FC = () => {
  const { user } = useAuthStore();
  const { blocks, load, addBlock, updateBlock, removeBlock } = useDayPlanStore();
  const [date, setDate] = useState(todayISO());

  useEffect(() => { load(date); }, [date, load]);

  const onCreate = (b: { start: string; end: string; label: string; color: string }) => {
    const block: DayBlock = {
      id: `blk-${Date.now()}`,
      agentId: user?.agentId ?? user?.id ?? '',
      date,
      ...b,
    };
    addBlock(block);
  };

  return (
    <div className="p-4 md:p-0 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-primary" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">Ma journée</h2>
            <p className="text-sm text-gray-400 capitalize">{dayLabel(date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setDate((d) => addDays(d, -1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <button onClick={() => setDate(todayISO())} className="px-2 h-8 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            Aujourd'hui
          </button>
          <button onClick={() => setDate((d) => addDays(d, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        🖱️ Glissez sur la grille (9h–18h) pour ajouter ce que vous faites. Cliquez un bloc pour le modifier.
      </p>

      <DayTimeline
        blocks={blocks}
        editable
        isToday={date === todayISO()}
        onCreate={onCreate}
        onUpdate={(id, patch) => updateBlock(id, patch)}
        onDelete={(id) => removeBlock(id)}
      />
    </div>
  );
};
