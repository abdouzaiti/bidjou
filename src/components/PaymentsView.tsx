/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, AlertCircle, Search, SlidersHorizontal, 
  Printer, CheckCircle, Plus, X, List, Calendar, CreditCard, RefreshCw
} from 'lucide-react';
import { Member, Payment } from '../types';
import { printPaymentReceipt } from '../utils/pdfGenerator';

interface PaymentsViewProps {
  members: Member[];
  payments: Payment[];
  currency: string;
  t: (key: string) => string;
  onRecordPayment: (newPayment: Omit<Payment, 'id' | 'receiptNumber'>) => void;
  quickOpenForm: boolean;
  setQuickOpenForm: (open: boolean) => void;
}

export default function PaymentsView({
  members,
  payments,
  currency,
  t,
  onRecordPayment,
  quickOpenForm,
  setQuickOpenForm
}: PaymentsViewProps) {
  // UI states
  const [isFormOpen, setIsFormOpen] = useState(quickOpenForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('Juillet');
  const [yearFilter, setYearFilter] = useState<number>(2026);
  const [methodFilter, setMethodFilter] = useState<string>('All');

  // Form states
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState(3000);
  const [month, setMonth] = useState('Juillet');
  const [year, setYear] = useState(2026);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync quickOpenForm from parent
  useEffect(() => {
    if (quickOpenForm) {
      setIsFormOpen(true);
      setQuickOpenForm(false);
    }
  }, [quickOpenForm]);

  // Auto-fill amount when member is selected in form
  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
        setAmount(member.monthlyFee);
      }
    }
  }, [selectedMemberId, members]);

  // Computations
  const activeMembers = members.filter(m => m.status === 'Active');

  // Income computations for currently selected month/year
  const filteredPayments = payments.filter(p => p.month === monthFilter && p.year === yearFilter);
  const monthlyIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Total annual income
  const annualIncome = payments
    .filter(p => p.year === yearFilter)
    .reduce((sum, p) => sum + p.amount, 0);

  // Unpaid calculations for the selected month/year
  const paidMemberIds = new Set(filteredPayments.map(p => p.memberId));
  const unpaidMembers = activeMembers.filter(m => !paidMemberIds.has(m.id));
  const outstandingAmount = unpaidMembers.reduce((sum, m) => sum + m.monthlyFee, 0);

  // Submit recorded payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setIsSubmitting(true);
    try {
      await onRecordPayment({
        memberId: selectedMemberId,
        amount,
        month,
        year,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        reference,
        notes
      });

      setIsFormOpen(false);
      // Reset form fields
      setSelectedMemberId('');
      setReference('');
      setNotes('');
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct checkout trigger from outstanding list
  const [processingId, setProcessingId] = useState<string | null>(null);

  const triggerQuickPay = async (member: Member) => {
    setProcessingId(member.id);
    try {
      // We'll perform the payment directly for the current filter month
      await onRecordPayment({
        memberId: member.id,
        amount: member.monthlyFee,
        month: monthFilter,
        year: yearFilter,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        reference: 'Paiement Rapide',
        notes: `Cotisation de ${monthFilter} ${yearFilter} réglée via le bouton rapide.`
      });
    } catch (error) {
      console.error("Quick pay failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Printable receipt helper
  const handlePrintReceipt = (payment: Payment) => {
    const member = members.find(m => m.id === payment.memberId);
    if (member) {
      printPaymentReceipt(payment, member, currency);
    }
  };

  // List of payments search filtering
  const searchedPayments = payments.filter(p => {
    const member = members.find(m => m.id === p.memberId);
    const memberName = member ? member.name.toLowerCase() : '';
    const matchesSearch = memberName.includes(searchTerm.toLowerCase()) || p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">{t('payments_module_title')}</h2>
          <p className="text-xs text-slate-500">{t('payments_module_description')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="btn-open-payment-form"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-bento-blue bg-bento-gold hover:bg-bento-gold-dark rounded-xl shadow-md transition-all border border-bento-gold/20"
          >
            <Plus className="w-4 h-4" />
            {t('record_payment_action')}
          </button>
        </div>
      </div>

      {/* Financial Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        
        {/* Card 1: Monthly Income */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px] md:min-h-[110px]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus de {monthFilter} {yearFilter}</span>
              <h3 className="text-xl md:text-2xl font-display font-bold text-slate-800">
                {monthlyIncome.toLocaleString()} {currency}
              </h3>
            </div>
            <span className="p-1.5 md:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold text-emerald-600">
            ✓ {filteredPayments.length} cotisations validées
          </span>
        </div>

        {/* Card 2: Annual Revenue */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px] md:min-h-[110px]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-bento-blue rounded-l-2xl" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus Annuels ({yearFilter})</span>
              <h3 className="text-xl md:text-2xl font-display font-bold text-slate-800">
                {annualIncome.toLocaleString()} {currency}
              </h3>
            </div>
            <span className="p-1.5 md:p-2 bg-bento-blue/10 text-bento-blue rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[9px] md:text-[10px] text-slate-400 font-semibold">
            Bilan d'exercice cumulatif
          </span>
        </div>

        {/* Card 3: Outstanding dues */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px] md:min-h-[110px] sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 rounded-l-2xl" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impayés ce Mois ({monthFilter})</span>
              <h3 className="text-xl md:text-2xl font-display font-bold text-rose-600">
                {outstandingAmount.toLocaleString()} {currency}
              </h3>
            </div>
            <span className="p-1.5 md:p-2 bg-rose-50 text-rose-500 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[9px] md:text-[10px] font-semibold text-rose-600">
            ⚠ {unpaidMembers.length} adhérents actifs en attente
          </span>
        </div>

      </div>

      {/* Grid: outstanding list & general historical database */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Paid / Unpaid Status List */}
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-3 gap-2">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Contrôle des cotisations</h3>
              <p className="text-[10px] text-slate-400">Statut des membres actifs pour {monthFilter}</p>
            </div>
            
            {/* Quick Month Filter select */}
            <select 
              id="payments-month-filter"
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full sm:w-auto text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-hidden"
            >
              {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* List display */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {/* Paid members section heading */}
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Non Payés ({unpaidMembers.length})</div>
            {unpaidMembers.map(member => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-2.5 bg-rose-50/10 hover:bg-rose-50/30 border border-rose-100/10 hover:border-rose-100/40 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name} 
                    className="w-7 h-7 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">{member.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{member.monthlyFee} {currency}</span>
                  </div>
                </div>

                <button 
                  id={`btn-quick-pay-${member.id}`}
                  disabled={processingId === member.id}
                  onClick={() => triggerQuickPay(member)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                    processingId === member.id 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'text-white bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {processingId === member.id ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      ...
                    </>
                  ) : (
                    'Régler'
                  )}
                </button>
              </div>
            ))}

            {unpaidMembers.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400 italic">Tous les membres ont réglé leur cotisation !</div>
            )}

            <div className="border-t border-slate-100 my-3" />

            {/* Paid list */}
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payés ({filteredPayments.length})</div>
            {filteredPayments.map(p => {
              const m = members.find(memberObj => memberObj.id === p.memberId);
              if (!m) return null;
              return (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-emerald-50/10 border border-emerald-100/10 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <img 
                      src={m.photoUrl} 
                      alt={m.name} 
                      className="w-7 h-7 rounded-full object-cover animate-scale-in"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`;
                      }}
                    />
                    <div>
                      <span className="font-bold text-slate-700 block">{m.name}</span>
                      <span className="text-[9px] text-emerald-600 block font-mono">✓ Payé ({p.amount} {currency})</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePrintReceipt(p)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700"
                    title="Imprimer Reçu"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Search Log of Payments */}
        <div className="lg:col-span-2 bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">{t('payment_history')}</h3>
              <p className="text-[10px] text-slate-400">Registre d'audit financier des transactions</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  id="search-payments-input"
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-40 md:w-48 pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-gold/30"
                />
              </div>

              <select 
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 cursor-pointer focus:outline-hidden"
              >
                <option value="All">Tous modes</option>
                <option value="Cash">Espèces</option>
                <option value="Card">Carte</option>
                <option value="Bank Transfer">Virement</option>
              </select>
            </div>
          </div>

          {/* Table display */}
          <div className="border border-slate-50 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-left min-w-[500px] sm:min-w-0">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-semibold border-b border-slate-100 uppercase">
                  <th className="p-3">Adhérent</th>
                  <th className="p-3 hidden sm:table-cell">N° Reçu</th>
                  <th className="p-3">Mois payé</th>
                  <th className="p-3 hidden md:table-cell">Mode</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {searchedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 italic">Aucun règlement trouvé</td>
                  </tr>
                ) : (
                  searchedPayments.map((p) => {
                    const m = members.find(memberObj => memberObj.id === p.memberId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 truncate max-w-[100px] sm:max-w-none">{m ? m.name : 'Membre Inconnu'}</span>
                            <span className="text-[9px] text-slate-400 sm:hidden">{p.receiptNumber}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500 hidden sm:table-cell">{p.receiptNumber}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-slate-600 font-medium">{p.month} {p.year}</span>
                            <span className="text-[9px] text-slate-400 md:hidden">{p.paymentMethod === 'Cash' ? 'Espèces' : 'Autre'}</span>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                            p.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-600' : p.paymentMethod === 'Card' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {p.paymentMethod === 'Cash' ? 'Espèces' : p.paymentMethod === 'Card' ? 'Carte CIB' : 'Virement'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-600 font-mono">+{p.amount.toLocaleString()} {currency}</td>
                        <td className="p-3 text-right">
                          <button 
                            id={`btn-print-receipt-${p.id}`}
                            onClick={() => handlePrintReceipt(p)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-800 rounded-lg transition-all"
                            title="Imprimer Reçu"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Payment Recorder dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="payments-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-slate-800" id="payments-modal-title">
                  Enregistrer un règlement de cotisation
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  
                  {/* Member Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Sélectionner l'adhérent *</label>
                    <select 
                      id="form-pay-member-select"
                      required
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="">-- Choisissez un adhérent actif --</option>
                      {activeMembers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.membershipNumber} - {m.monthlyFee} {currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Montant versé ({currency}) *</label>
                    <input 
                      id="form-pay-amount-input"
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Month & Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Mois concerné</label>
                      <select 
                        id="form-pay-month-select"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      >
                        {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Année</label>
                      <select 
                        id="form-pay-year-select"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      >
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                      </select>
                    </div>
                  </div>

                  {/* Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Mode de règlement *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Cash', 'Card', 'Bank Transfer'].map((m) => (
                        <button 
                          key={m}
                          id={`btn-form-pay-method-${m}`}
                          type="button"
                          onClick={() => setPaymentMethod(m as any)}
                          className={`py-2 text-[10px] font-bold border rounded-xl transition-all ${
                            paymentMethod === m 
                              ? 'bg-bento-blue text-white border-bento-blue shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {m === 'Cash' ? 'Espèces' : m === 'Card' ? 'Carte CIB' : 'CCP Virement'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Reference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Référence / Numéro d'opération (Optionnel)</label>
                    <input 
                      id="form-pay-ref-input"
                      type="text" 
                      placeholder="Ex: CIB-2019-902, Virement CCP #..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes internes</label>
                    <textarea 
                      id="form-pay-notes-input"
                      placeholder="Remarques diverses..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden h-16"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100 rounded-b-3xl">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    id="btn-submit-pay-form"
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all border flex items-center gap-2 ${
                      isSubmitting
                        ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'text-bento-blue bg-bento-gold hover:bg-bento-gold-dark border-bento-gold/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      'Enregistrer le reçu'
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
