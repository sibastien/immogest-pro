import React, { useState } from 'react';
import { X, Calculator, Building, CheckCircle, ShieldCheck } from 'lucide-react';

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancingModal: React.FC<FinancingModalProps> = ({ isOpen, onClose }) => {
  const [propertyPrice, setPropertyPrice] = useState<number>(350000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [durationYears, setDurationYears] = useState<number>(15);
  const [currency, setCurrency] = useState<'TND' | 'EUR'>('TND');

  // Contact form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('France');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Rate estimation (indicative)
  const interestRate = currency === 'TND' ? 0.0875 : 0.042; // 8.75% TND or 4.2% devises
  const downPaymentAmount = Math.round(propertyPrice * (downPaymentPercent / 100));
  const loanAmount = propertyPrice - downPaymentAmount;

  // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = interestRate / 12;
  const numPayments = durationYears * 12;
  const monthlyPayment = loanAmount > 0
    ? Math.round(
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      )
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const partnerBanks = [
    'BIAT',
    'Attijari Bank',
    'Amen Bank',
    'BH Bank',
    'Banque Zitouna',
    'UBCI',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D1B3E] via-[#0D2D5E] to-[#040D1F] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-xs font-semibold uppercase tracking-wider mb-2">
            <Calculator size={13} />
            Simulateur Crédit Immobilier
          </div>
          <h3 className="font-luxury-serif text-2xl sm:text-3xl font-bold">
            Financer votre projet en Tunisie
          </h3>
          <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-lg">
            Offres spécialement négociées pour les Tunisiens résidents à l'étranger (TRE) et locaux.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 font-luxury-serif">
                Demande de financement enregistrée !
              </h4>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Merci {name}. Notre expert en financement bancaire va étudier votre dossier avec nos banques partenaires et vous contactera sous 24h.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-[#0D1B3E] text-white font-semibold text-sm rounded-xl hover:bg-[#040D1F] transition"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Currency & Banks */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Building size={14} className="text-[#D4A017]" />
                  Banques partenaires :
                  <span className="font-semibold text-gray-800">
                    {partnerBanks.slice(0, 4).join(', ')}...
                  </span>
                </div>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setCurrency('TND')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      currency === 'TND' ? 'bg-[#0D1B3E] text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    TND (DT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('EUR')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      currency === 'EUR' ? 'bg-[#0D1B3E] text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    EUR (€)
                  </button>
                </div>
              </div>

              {/* Slider Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Prix d'acquisition du bien</span>
                    <span className="font-bold text-[#0D1B3E] text-base">
                      {propertyPrice.toLocaleString()} {currency === 'TND' ? 'DT' : '€'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1500000}
                    step={10000}
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full accent-[#D4A017]"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>50 000</span>
                    <span>1 500 000 {currency === 'TND' ? 'DT' : '€'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Apport personnel ({downPaymentPercent}%)</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {downPaymentAmount.toLocaleString()} {currency === 'TND' ? 'DT' : '€'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-[#D4A017]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Durée du prêt</span>
                    <span className="font-bold text-gray-800 text-sm">{durationYears} ans ({durationYears * 12} mois)</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    step={1}
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full accent-[#D4A017]"
                  />
                </div>
              </div>

              {/* Calculation Result Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-amber-800">
                    Mensualité estimée
                  </div>
                  <div className="text-3xl font-extrabold text-[#0D1B3E] font-luxury-serif mt-0.5">
                    {monthlyPayment.toLocaleString()} <span className="text-lg font-sans">{currency === 'TND' ? 'DT' : '€'} / mois</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Montant emprunté : {loanAmount.toLocaleString()} {currency === 'TND' ? 'DT' : '€'} (taux indicatif {(interestRate * 100).toFixed(1)}%)
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-900 bg-white/80 px-3 py-2 rounded-xl border border-amber-200">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Dossier bancaire 100% accompagné à distance</span>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Transmettre ma simulation à nos banques partenaires
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nom complet *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Téléphone / WhatsApp *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Adresse Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 bg-white"
                  >
                    <option value="France">🇫🇷 France</option>
                    <option value="Allemagne">🇩🇪 Allemagne</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Italie">🇮🇹 Italie</option>
                    <option value="Suisse">🇨🇭 Suisse</option>
                    <option value="Émirats">🇦🇪 Émirats Arabes Unis</option>
                    <option value="Tunisie">🇹🇳 Tunisie (Résident)</option>
                    <option value="Autre">🌍 Autre pays</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-[#D4A017] to-[#F5C518] hover:from-[#C49010] hover:to-[#E5B510] text-[#0D1B3E] font-bold text-sm rounded-xl shadow-lg shadow-[#D4A017]/20 transition-transform hover:scale-[1.01]"
                >
                  Envoyer mon dossier de financement gratuitement
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
