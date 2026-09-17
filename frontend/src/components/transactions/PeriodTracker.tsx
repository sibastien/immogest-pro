import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  CalendarDays, TrendingUp, TrendingDown, Banknote,
  ArrowUpRight, BarChart2, ChevronLeft, ChevronRight,
  Activity, Target,
} from 'lucide-react';
import type { Transaction } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PeriodMode = 'week' | 'month' | 'quarter' | 'year';

interface PeriodStats {
  label: string;
  amount: number;
  commission: number;
  count: number;
  closed: number;
}

interface Props {
  transactions: Transaction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('fr-TN').format(n);
}

function startOf(mode: PeriodMode, ref: Date): Date {
  const d = new Date(ref);
  if (mode === 'week') {
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
  } else if (mode === 'month') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  } else if (mode === 'quarter') {
    d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function endOf(mode: PeriodMode, start: Date): Date {
  const d = new Date(start);
  if (mode === 'week') d.setDate(d.getDate() + 6);
  else if (mode === 'month') d.setMonth(d.getMonth() + 1, 0);
  else if (mode === 'quarter') d.setMonth(d.getMonth() + 3, 0);
  else d.setFullYear(d.getFullYear() + 1, 0, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function shiftPeriod(mode: PeriodMode, start: Date, delta: number): Date {
  const d = new Date(start);
  if (mode === 'week') d.setDate(d.getDate() + delta * 7);
  else if (mode === 'month') d.setMonth(d.getMonth() + delta);
  else if (mode === 'quarter') d.setMonth(d.getMonth() + delta * 3);
  else d.setFullYear(d.getFullYear() + delta);
  return startOf(mode, d);
}

function periodLabel(mode: PeriodMode, start: Date, end: Date): string {
  if (mode === 'week') {
    const s = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return s + ' – ' + e;
  }
  if (mode === 'month') return start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  if (mode === 'quarter') return 'T' + (Math.floor(start.getMonth() / 3) + 1) + ' ' + start.getFullYear();
  return String(start.getFullYear());
}

function buildBuckets(mode: PeriodMode, start: Date, end: Date, txs: Transaction[]): PeriodStats[] {
  const buckets: PeriodStats[] = [];

  if (mode === 'week') {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      buckets.push({ label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), amount: 0, commission: 0, count: 0, closed: 0 });
    }
    txs.forEach((tx) => {
      const idx = Math.floor((new Date(tx.updatedAt).getTime() - start.getTime()) / 86400000);
      if (idx >= 0 && idx < 7) {
        buckets[idx].amount += tx.amount;
        buckets[idx].commission += tx.commission;
        buckets[idx].count++;
        if (tx.stage === 'cloture') buckets[idx].closed++;
      }
    });
  } else if (mode === 'month') {
    const cur = new Date(start);
    let w = 0;
    while (cur <= end) {
      if (w >= buckets.length) buckets.push({ label: 'Sem. ' + (w + 1), amount: 0, commission: 0, count: 0, closed: 0 });
      cur.setDate(cur.getDate() + 7);
      w++;
    }
    txs.forEach((tx) => {
      const weekIdx = Math.floor((new Date(tx.updatedAt).getTime() - start.getTime()) / (7 * 86400000));
      if (weekIdx >= 0 && weekIdx < buckets.length) {
        buckets[weekIdx].amount += tx.amount;
        buckets[weekIdx].commission += tx.commission;
        buckets[weekIdx].count++;
        if (tx.stage === 'cloture') buckets[weekIdx].closed++;
      }
    });
  } else if (mode === 'quarter') {
    [0, 1, 2].forEach((offset) => {
      const m = new Date(start);
      m.setMonth(m.getMonth() + offset);
      buckets.push({ label: m.toLocaleDateString('fr-FR', { month: 'long' }), amount: 0, commission: 0, count: 0, closed: 0 });
    });
    txs.forEach((tx) => {
      const d = new Date(tx.updatedAt);
      const mo = (d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth();
      if (mo >= 0 && mo < 3) {
        buckets[mo].amount += tx.amount;
        buckets[mo].commission += tx.commission;
        buckets[mo].count++;
        if (tx.stage === 'cloture') buckets[mo].closed++;
      }
    });
  } else {
    Array.from({ length: 12 }, (_, i) =>
      new Date(start.getFullYear(), i, 1).toLocaleDateString('fr-FR', { month: 'short' })
    ).forEach((lbl) => buckets.push({ label: lbl, amount: 0, commission: 0, count: 0, closed: 0 }));
    txs.forEach((tx) => {
      const d = new Date(tx.updatedAt);
      if (d.getFullYear() === start.getFullYear()) {
        const m = d.getMonth();
        buckets[m].amount += tx.amount;
        buckets[m].commission += tx.commission;
        buckets[m].count++;
        if (tx.stage === 'cloture') buckets[m].closed++;
      }
    });
  }
  return buckets;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </span>
          <span className="font-bold text-gray-800">{fmt(p.value)} DT</span>
        </div>
      ))}
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  prospection: '#9CA3AF',
  visite: '#3B82F6',
  offre: '#F59E0B',
  compromis: '#8B5CF6',
  acte: '#185FA5',
  cloture: '#3B6D11',
};

const STAGE_LABELS: Record<string, string> = {
  prospection: 'Prospection',
  visite: 'Visite',
  offre: 'Offre',
  compromis: 'Compromis',
  acte: 'Acte',
  cloture: 'Cloturee',
};

const MODE_LABELS: Record<PeriodMode, string> = {
  week: 'Semaine',
  month: 'Mois',
  quarter: 'Trimestre',
  year: 'Annee',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PeriodTracker: React.FC<Props> = ({ transactions }) => {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [periodStart, setPeriodStart] = useState<Date>(() => startOf('month', new Date()));
  const [chartType, setChartType] = useState<'bar' | 'area'>('area');

  const handleModeChange = (m: PeriodMode) => {
    setMode(m);
    setPeriodStart(startOf(m, new Date()));
  };

  const periodEnd = useMemo(() => endOf(mode, periodStart), [mode, periodStart]);

  const periodTxs = useMemo(
    () => transactions.filter((tx) => {
      const d = new Date(tx.updatedAt);
      return d >= periodStart && d <= periodEnd;
    }),
    [transactions, periodStart, periodEnd]
  );

  const prevStart = useMemo(() => shiftPeriod(mode, periodStart, -1), [mode, periodStart]);
  const prevEnd = useMemo(() => endOf(mode, prevStart), [mode, prevStart]);

  const prevTxs = useMemo(
    () => transactions.filter((tx) => {
      const d = new Date(tx.updatedAt);
      return d >= prevStart && d <= prevEnd;
    }),
    [transactions, prevStart, prevEnd]
  );

  const ca = periodTxs.reduce((s, t) => s + t.amount, 0);
  const comm = periodTxs.reduce((s, t) => s + t.commission, 0);
  const closed = periodTxs.filter((t) => t.stage === 'cloture').length;
  const count = periodTxs.length;

  const prevCa = prevTxs.reduce((s, t) => s + t.amount, 0);
  const prevComm = prevTxs.reduce((s, t) => s + t.commission, 0);
  const prevClosed = prevTxs.filter((t) => t.stage === 'cloture').length;
  const prevCount = prevTxs.length;

  const pctDelta = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  const buckets = useMemo(
    () => buildBuckets(mode, periodStart, periodEnd, periodTxs),
    [mode, periodStart, periodEnd, periodTxs]
  );

  const isCurrentPeriod = periodEnd >= new Date();
  const label = periodLabel(mode, periodStart, periodEnd);

  const stageBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodTxs.forEach((tx) => { map[tx.stage] = (map[tx.stage] || 0) + 1; });
    return Object.entries(map)
      .map(([stage, n]) => ({
        stage,
        label: STAGE_LABELS[stage] ?? stage,
        count: n,
        pct: count > 0 ? Math.round((n / count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [periodTxs, count]);

  const evolLabel = mode === 'week' ? 'journaliere' : mode === 'month' ? 'hebdomadaire' : 'mensuelle';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Activity size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Suivi par periode</h3>
            <p className="text-xs text-gray-400">Moteur d analyse temporelle</p>
          </div>
        </div>

        {/* Mode pills */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(MODE_LABELS) as PeriodMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Chart toggle + nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType(chartType === 'bar' ? 'area' : 'bar')}
            title="Changer type de graphique"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-blue-200 transition-colors"
          >
            <BarChart2 size={14} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPeriodStart(shiftPeriod(mode, periodStart, -1))}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-blue-200 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-700 min-w-[150px] text-center bg-gray-50 rounded-lg border border-gray-200">
              {label}
            </span>
            <button
              onClick={() => setPeriodStart(shiftPeriod(mode, periodStart, 1))}
              disabled={isCurrentPeriod}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-blue-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { icon: <Banknote size={14} className="text-primary" />, lbl: 'CA Periode', value: fmt(ca) + ' DT', curr: ca, prev: prevCa, bg: 'bg-blue-50' },
          { icon: <TrendingUp size={14} className="text-success" />, lbl: 'Commissions', value: fmt(comm) + ' DT', curr: comm, prev: prevComm, bg: 'bg-green-50' },
          { icon: <ArrowUpRight size={14} className="text-purple" />, lbl: 'Cloturees', value: String(closed), curr: closed, prev: prevClosed, bg: 'bg-purple-50' },
          { icon: <Target size={14} className="text-amber-600" />, lbl: 'Dossiers actifs', value: String(count), curr: count, prev: prevCount, bg: 'bg-amber-50' },
        ].map(({ icon, lbl, value, curr, prev, bg }) => {
          const d = pctDelta(curr, prev);
          const up = d >= 0;
          return (
            <div key={lbl} className={'px-5 py-4 ' + bg}>
              <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xs text-gray-500">{lbl}</span>
              </div>
              <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
              {(prev > 0 || curr > 0) ? (
                <div className={'flex items-center gap-1 mt-1 text-xs font-medium ' + (up ? 'text-success' : 'text-danger')}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {up ? '+' : ''}{d}% vs periode prec.
                </div>
              ) : (
                <div className="text-xs text-gray-300 mt-1">Aucune donnee prec.</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Chart ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={13} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600">
              {'Evolution ' + evolLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded bg-primary" />
              CA
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded bg-success" />
              Commission
            </span>
          </div>
        </div>

        {periodTxs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gray-300">
            <BarChart2 size={32} className="mb-2" />
            <p className="text-xs">Aucune transaction sur cette periode</p>
          </div>
        ) : chartType === 'area' ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={buckets} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#185FA5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#185FA5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B6D11" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => Math.round(v / 1000) + 'k'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" name="CA" stroke="#185FA5" strokeWidth={2} fill="url(#gradCA)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="commission" name="Commission" stroke="#3B6D11" strokeWidth={2} fill="url(#gradComm)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={buckets} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => Math.round(v / 1000) + 'k'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#9CA3AF' }} />
              <Bar dataKey="amount" name="CA" fill="#185FA5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" name="Commission" fill="#3B6D11" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Stage Breakdown ── */}
      {stageBreakdown.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-3">Repartition par stade</p>
          <div className="space-y-2">
            {stageBreakdown.map(({ stage, label: slabel, count: n, pct }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{slabel}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: pct + '%', background: STAGE_COLORS[stage] ?? '#9CA3AF' }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-5 text-right">{n}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5">
        <CalendarDays size={11} className="text-gray-300" />
        <span className="text-xs text-gray-400">
          {'Base sur la date de mise a jour · ' + periodTxs.length + ' dossier' + (periodTxs.length !== 1 ? 's' : '') + ' sur la periode selectionnee'}
        </span>
      </div>
    </div>
  );
};
