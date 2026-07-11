// Generates a fully-filled, printable "Bon de visite" (BEE IMMOBILIER) and opens
// the browser print dialog. Every variable field is entered in the CRM before
// printing — only the physical signatures stay blank.

export interface BonDeVisiteData {
  clientName: string;
  cin: string;
  delivreeLe: string;   // ISO date or free text
  delivreeA: string;
  visitDate: string;    // ISO date
  propertyRef: string;
  bien: string;         // free description typed by the agent
  faitA: string;
  signDate: string;     // ISO date
}

const AGENCY = {
  name: 'BEE IMMOBILIER',
  address: 'Avenue Abu Dhabi, Hammamet – Nabeul',
  mf: 'MF : 1701756/Y',
  phone: '+216 53 762 500',
  email: 'Bee.immobilier23@gmail.com',
  site: 'www.beeimmobilier.com',
};

function fmtDate(v: string): string {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A labelled line: the (already filled) value sits on the line.
function field(label: string, value = ''): string {
  return `<div class="field"><span class="lbl">${label} :</span><span class="val">${esc(value)}</span></div>`;
}

export function printBonDeVisite(data: BonDeVisiteData): void {
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Bon de visite — ${AGENCY.name}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 0; padding: 32px 40px; font-size: 13px; line-height: 1.5; }
  .head { text-align: center; }
  .head h1 { font-size: 18px; letter-spacing: .5px; margin: 0; }
  .head .sub { color: #555; font-size: 12px; margin-top: 2px; }
  .rule { height: 3px; background: #e0a800; margin: 10px 0 18px; border: 0; }
  .title { text-align: center; font-size: 22px; font-weight: bold; letter-spacing: 1px; margin: 6px 0 22px; }
  .section-title { font-weight: bold; font-size: 13px; margin: 18px 0 8px; padding-bottom: 3px; border-bottom: 2px solid #e0a800; display: inline-block; }
  .field { margin: 9px 0; display: flex; align-items: flex-end; gap: 8px; }
  .field .lbl { white-space: nowrap; }
  .field .val { flex: 1; border-bottom: 1px dotted #444; min-height: 16px; padding: 0 4px 2px; font-weight: 600; }
  p.decl { margin: 8px 0; text-align: justify; }
  ol { margin: 8px 0 8px 18px; padding: 0; }
  ol li { margin: 8px 0; text-align: justify; }
  .sign { display: flex; justify-content: space-between; margin-top: 30px; gap: 40px; }
  .sign .box { flex: 1; }
  .sign .box .line { border-bottom: 1px dotted #444; height: 40px; margin-bottom: 6px; }
  .mention { font-style: italic; font-size: 11px; color: #666; margin-top: 6px; }
  .foot { margin-top: 28px; text-align: center; font-size: 11px; color: #444; }
  .foot .rule { margin-bottom: 8px; }
  @media print { body { padding: 12mm; } @page { margin: 0; } }
</style></head>
<body>
  <div class="head">
    <h1>${AGENCY.name}</h1>
    <div class="sub">${AGENCY.address}</div>
    <div class="sub">${AGENCY.mf}</div>
  </div>
  <hr class="rule">

  <div class="title">BON DE VISITE</div>

  <div class="section-title">1. IDENTIFICATION DU VISITEUR</div>
  ${field('Nom et prénom', data.clientName)}
  ${field('Carte d’identité N°', data.cin)}
  <div class="field"><span class="lbl">Délivrée le :</span><span class="val">${esc(fmtDate(data.delivreeLe) || data.delivreeLe)}</span><span class="lbl">à :</span><span class="val">${esc(data.delivreeA)}</span></div>

  <div class="section-title">2. BIEN IMMOBILIER VISITÉ</div>
  ${field('Date de la visite', fmtDate(data.visitDate))}
  ${field('Référence du bien', data.propertyRef)}
  ${field('Bien', data.bien)}

  <div class="section-title">3. DÉCLARATION</div>
  <p class="decl">Je soussigné(e), identifié(e) ci-dessus, reconnais avoir effectué la visite du bien immobilier mentionné ci-dessus.</p>
  <p class="decl">J’atteste que Monsieur Achref Bassoumi m’a informé(e) que le bien susmentionné fait l’objet d’un mandat auprès du bureau de services immobiliers qu’il représente.</p>

  <div class="section-title">4. ENGAGEMENTS DU VISITEUR</div>
  <ol>
    <li>Je m’interdis toute possibilité de négocier, directement ou indirectement, l’acquisition de ce bien sans avoir recours aux services de ladite agence. Cette interdiction est valable pour une durée de deux (2) ans à compter de la date de signature du présent bon de visite.</li>
    <li>Je m’engage à payer les frais d’agence de 2 % en cas d’achat de ce bien immobilier.</li>
    <li>Je m’engage à ne communiquer à aucun tiers toute information jugée confidentielle au sujet du logement objet du présent bon de visite, portée à ma connaissance par l’agent immobilier et/ou par le propriétaire du bien au cours de la visite.</li>
  </ol>

  <div class="field" style="max-width:60%"><span class="lbl">Fait à :</span><span class="val">${esc(data.faitA)}</span><span class="lbl">Date :</span><span class="val">${esc(fmtDate(data.signDate))}</span></div>

  <div class="sign">
    <div class="box"><div class="line"></div>Signature du visiteur<div class="mention">(précédée de la mention « Lu et approuvé »)</div></div>
    <div class="box"><div class="line"></div>Signature de l’agence</div>
  </div>

  <div class="foot">
    <hr class="rule">
    ${AGENCY.phone} &nbsp;·&nbsp; ${AGENCY.email} &nbsp;·&nbsp; ${AGENCY.site}
  </div>
</body></html>`;

  const w = window.open('', '_blank', 'width=820,height=1040');
  if (!w) {
    alert('Autorisez les fenêtres pop-up pour imprimer le bon de visite.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onload = () => { w.print(); };
  setTimeout(() => { try { w.print(); } catch { /* onload handled it */ } }, 400);
}
