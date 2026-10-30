import React, { useState } from 'react';
import { X, Handshake, CheckCircle } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [partnerType, setPartnerType] = useState('Promoteur Immobilier');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#0D1B3E] via-[#0D2D5E] to-[#040D1F] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-xs font-semibold uppercase tracking-wider mb-2">
            <Handshake size={13} />
            Réseau Professionnel
          </div>
          <h3 className="font-luxury-serif text-2xl sm:text-3xl font-bold">
            Devenir Partenaire
          </h3>
          <p className="text-white/70 text-xs sm:text-sm mt-1">
            Rejoignez l'écosystème ImmoGest Pro et touchez la clientèle des Tunisiens du monde et investisseurs.
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 font-luxury-serif">
                Demande de partenariat transmise
              </h4>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Merci {name} ({company || 'votre entité'}). Notre direction des partenariats examinera votre demande et reviendra vers vous sous 48h.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-[#0D1B3E] text-white font-semibold text-sm rounded-xl hover:bg-[#040D1F] transition"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Type d'activité
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 bg-white"
                >
                  <option value="Promoteur Immobilier">🏢 Promoteur Immobilier (Programmes Neufs)</option>
                  <option value="Agence Immobilière">🤝 Agence immobilière / Confrère</option>
                  <option value="Banque / Financement">🏦 Établissement bancaire ou courtier</option>
                  <option value="Notaire / Avocat">⚖️ Professionnel juridique ou notarial</option>
                  <option value="Architecte / Travaux">📐 Architecte / Entreprise de rénovation</option>
                  <option value="Autre">✨ Autre partenaire</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Votre Nom *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Société / Entité</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email professionnel *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@societe.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6... ou +216..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Votre projet de partenariat</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Présentez brièvement vos projets ou votre offre..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#D4A017] to-[#F5C518] hover:from-[#C49010] hover:to-[#E5B510] text-[#0D1B3E] font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-[1.01]"
              >
                Soumettre ma candidature partenaire
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
