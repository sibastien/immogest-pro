import React, { useState } from 'react';
import { useLang } from './LangContext';
import { submitInquiry, type InquiryPayload } from './api';
import { Phone, Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface InquiryFormProps {
  propertyId?: string;
  propertyRef?: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ propertyId, propertyRef }) => {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setStatus('loading');
    const payload: InquiryPayload = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      message: form.message || undefined,
      propertyId,
      propertyRef,
    };
    const ok = await submitInquiry(payload);
    setStatus(ok ? 'success' : 'error');
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <p className="text-gray-800 font-semibold text-base">{t('form_success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <User size={15} className="text-gray-400" />
        </div>
        <input
          type="text"
          required
          placeholder={t('form_name')}
          value={form.name}
          onChange={set('name')}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/30 focus:border-[#1E7FC4] bg-gray-50/50 placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Phone size={15} className="text-gray-400" />
        </div>
        <input
          type="tel"
          required
          placeholder={t('form_phone')}
          value={form.phone}
          onChange={set('phone')}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/30 focus:border-[#1E7FC4] bg-gray-50/50 placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Mail size={15} className="text-gray-400" />
        </div>
        <input
          type="email"
          placeholder={t('form_email')}
          value={form.email}
          onChange={set('email')}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/30 focus:border-[#1E7FC4] bg-gray-50/50 placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Message */}
      <div className="relative">
        <div className="absolute top-3.5 left-3.5 pointer-events-none">
          <MessageSquare size={15} className="text-gray-400" />
        </div>
        <textarea
          rows={3}
          placeholder={t('form_message')}
          value={form.message}
          onChange={set('message')}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/30 focus:border-[#1E7FC4] bg-gray-50/50 placeholder:text-gray-400 resize-none transition-all"
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle size={14} />
          {t('form_error')}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-[#1E7FC4] to-[#0D3B6E] hover:from-[#1870B0] hover:to-[#0A2F5A] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === 'loading' ? (
          <>
            <Loader size={16} className="animate-spin" />
            {t('form_submitting')}
          </>
        ) : (
          <>
            <Send size={16} />
            {t('form_submit')}
          </>
        )}
      </button>
    </form>
  );
};
