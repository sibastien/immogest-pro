// Live "today" helpers — used across dashboards so date filters and labels
// always reflect the real current day (no hardcoded demo dates).

/** Today's date as an ISO day string, e.g. "2026-06-24". */
export const todayISO = (): string => new Date().toISOString().slice(0, 10);

/** Today formatted in French, e.g. "Mardi 24 juin 2026" (capitalised). */
export const todayLabelFr = (): string => {
  const s = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
