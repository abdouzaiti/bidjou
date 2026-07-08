/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingDown, Plus, X, Search, DollarSign, Calendar, Tag, 
  Trash2, ShieldAlert, FileText, ChevronRight, PieChart
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  currency: string;
  t: (key: string) => string;
  onAddExpense: (newExpense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesView({
  expenses,
  currency,
  t,
  onAddExpense,
  onDeleteExpense
}: ExpensesViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(1500);
  const [category, setCategory] = useState<'Equipment' | 'Transport' | 'Water' | 'Competition' | 'Maintenance' | 'Rent' | 'Other'>('Other');
  const [date, setDate] = useState('2026-07-07');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onAddExpense({
      title,
      amount,
      category,
      date,
      description
    });

    setIsFormOpen(false);
    // Reset
    setTitle('');
    setAmount(1500);
    setDescription('');
  };

  // Computations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category summary mapping
  const categories: Record<string, { label: string; color: string; bg: string }> = {
    Equipment: { label: 'Équipement', color: 'text-bento-blue', bg: 'bg-bento-blue/5' },
    Transport: { label: 'Transport', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    Water: { label: 'Eau & Boissons', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    Competition: { label: 'Compétition', color: 'text-amber-600', bg: 'bg-amber-50' },
    Maintenance: { label: 'Maintenance', color: 'text-rose-600', bg: 'bg-rose-50' },
    Rent: { label: 'Loyer Dojo', color: 'text-purple-600', bg: 'bg-purple-50' },
    Other: { label: 'Divers', color: 'text-slate-600', bg: 'bg-slate-50' }
  };

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Filter logic
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Upper bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Suivi des Dépenses</h2>
          <p className="text-xs text-slate-500">
            Enregistrez les frais de fonctionnement de l'association sportive et visualisez l'analyse budgétaire.
          </p>
        </div>

        <button 
          id="btn-open-expense-form"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-bento-blue hover:bg-bento-gold hover:text-bento-blue rounded-xl shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Déclarer une dépense
        </button>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenditure ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                id="search-expenses-input"
                type="text" 
                placeholder="Chercher désignation de dépense..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Category Select Filter */}
            <select 
              id="expenses-cat-filter"
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
            >
              <option value="All">Toutes les catégories</option>
              <option value="Equipment">Équipement</option>
              <option value="Transport">Transport</option>
              <option value="Water">Eau & Boissons</option>
              <option value="Competition">Compétitions</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rent">Loyer</option>
              <option value="Other">Autres dépenses</option>
            </select>

          </div>

          {/* Ledger logs */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredExpenses.map((expense) => {
              const catConfig = categories[expense.category] || categories.Other;
              return (
                <div 
                  key={expense.id} 
                  id={`expense-card-${expense.id}`}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`p-2.5 rounded-xl shrink-0 ${catConfig.bg} ${catConfig.color}`}>
                      <Tag className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">{catConfig.label}</span>
                      <h4 className="font-display font-bold text-slate-800 text-xs truncate">{expense.title}</h4>
                      <p className="text-[10px] text-slate-400 block truncate mt-0.5">{expense.date} • {expense.description || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-600">
                      -{expense.amount.toLocaleString()} {currency}
                    </span>

                    <button 
                      onClick={() => {
                        if (confirm(`Confirmez-vous l'annulation de la dépense : ${expense.title} ?`)) {
                          onDeleteExpense(expense.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Supprimer la dépense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredExpenses.length === 0 && (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                <p className="text-xs text-slate-400 italic">Aucune dépense ne correspond aux critères sélectionnés.</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget breakdown bento */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between h-full min-h-[350px]">
          <div className="space-y-4">
            <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Ventilation du budget</h3>
                <p className="text-[10px] text-slate-400">Total cumulé des dépenses courantes</p>
              </div>
              <TrendingDown className="w-5 h-5 text-rose-500 bg-rose-50 p-1 rounded-md" />
            </div>

            {/* Total metric badge */}
            <div className="bg-rose-50/20 border border-rose-100/30 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Sorties de caisse</span>
              <h2 className="text-2xl font-display font-bold text-rose-600 mt-1">
                -{totalExpenses.toLocaleString()} {currency}
              </h2>
            </div>

            {/* Progress bars list */}
            <div className="space-y-3 pt-2">
              {Object.keys(categories).map(catKey => {
                const catInfo = categories[catKey];
                const amt = categoryTotals[catKey] || 0;
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;

                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${catInfo.color.replace('text-', 'bg-')}`} />
                        {catInfo.label}
                      </span>
                      <span>{amt.toLocaleString()} DZD ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${catInfo.color.replace('text-', 'bg-')}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center text-xs text-slate-400 font-semibold">
            Exercice comptable : <strong>Juillet 2026</strong>
          </div>
        </div>

      </div>

      {/* Creation Modal Form dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="expenses-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-slate-800" id="expenses-modal-title">
                  Enregistrer une sortie d'argent
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
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Libellé de la dépense *</label>
                    <input 
                      id="form-expense-title-input"
                      type="text" 
                      required
                      placeholder="Ex: Facture d'électricité dojo central"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Catégorie budgétaire *</label>
                    <select 
                      id="form-expense-cat-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="Equipment">Équipement (tatamis, kimono...)</option>
                      <option value="Transport">Transport (déplacement athlète...)</option>
                      <option value="Water">Eau & Boisson d'entraînement</option>
                      <option value="Competition">Inscriptions compétition</option>
                      <option value="Maintenance">Maintenance & Bâtiment</option>
                      <option value="Rent">Loyer (Dojo principal / annexe)</option>
                      <option value="Other">Autre sortie de caisse</option>
                    </select>
                  </div>

                  {/* Amount & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Montant (DZD) *</label>
                      <input 
                        id="form-expense-amount-input"
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Date d'opération</label>
                      <input 
                        id="form-expense-date-input"
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Justificatif / Commentaires</label>
                    <textarea 
                      id="form-expense-desc-input"
                      placeholder="Indiquez les détails de l'achat ou le numéro de facture..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                    id="btn-submit-expense-form"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-bento-blue hover:bg-bento-gold hover:text-bento-blue rounded-xl shadow-xs transition-all"
                  >
                    Confirmer le paiement
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
