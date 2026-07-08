/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, Printer, Calendar, BarChart3, TrendingUp, Users, 
  CheckCircle, ArrowUpRight, DollarSign, PieChart, Sparkles
} from 'lucide-react';
import { Member, Payment, Expense, Attendance } from '../types';
import { printFinancialReport } from '../utils/pdfGenerator';

interface ReportsViewProps {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  attendance: Attendance[];
  currency: string;
  t: (key: string) => string;
}

export default function ReportsView({
  members,
  payments,
  expenses,
  attendance,
  currency,
  t
}: ReportsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState('Juillet');
  const [selectedYear, setSelectedYear] = useState(2026);

  // Calculations for Members Demographics Report
  const totalMembers = members.length;
  const maleCount = members.filter(m => m.gender === 'Male').length;
  const femaleCount = members.filter(m => m.gender === 'Female').length;
  const activeCount = members.filter(m => m.status === 'Active').length;
  const suspendedCount = members.filter(m => m.status === 'Suspended').length;
  const inactiveCount = members.filter(m => m.status === 'Inactive').length;

  const averageAge = Math.round(
    members.reduce((sum, m) => {
      const birthYear = new Date(m.birthDate).getFullYear();
      const currentYear = 2026;
      return sum + (currentYear - birthYear);
    }, 0) / (totalMembers || 1)
  );

  // Calculations for Attendance Report
  const totalCheckins = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const presentRatio = totalMembers > 0 ? Math.round(((presentCount + lateCount) / (attendance.length || 1)) * 100) : 0;

  // Most active members (Top 3 attendees)
  const attendanceFrequencies = attendance.reduce((acc, curr) => {
    acc[curr.memberId] = (acc[curr.memberId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTopAttendees = Object.entries(attendanceFrequencies)
    .map(([id, count]) => {
      const member = members.find(m => m.id === id);
      return {
        name: member ? member.name : 'Athlète',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Financial calculations
  const targetPayments = payments.filter(p => p.month === selectedMonth && p.year === selectedYear);
  const targetExpenses = expenses.filter(e => e.date.startsWith(`2026-07`) || e.date.startsWith(`2026-06`)); // Simulated target range

  const handlePrintFinancials = () => {
    printFinancialReport(targetPayments, expenses, selectedMonth, selectedYear, currency);
  };

  // Demographic list printing simulation
  const handlePrintDemographics = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Démographique - Les Bijoux d'Oran</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            h1 { color: #002366; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #f8fafc; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 10px; font-size: 11px; text-transform: uppercase; text-align: left; }
            td { padding: 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Les Bijoux d'Oran - Rapport des Adhérents</h1>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          <div class="grid">
            <div class="card">
              <h3>Démographie</h3>
              <p>Total Adhérents : <strong>${totalMembers}</strong></p>
              <p>Hommes : <strong>${maleCount}</strong> | Femmes : <strong>${femaleCount}</strong></p>
              <p>Âge moyen : <strong>${averageAge} ans</strong></p>
            </div>
            <div class="card">
              <h3>Répartition des statuts</h3>
              <p>Actifs : <strong>${activeCount}</strong></p>
              <p>Suspendus : <strong>${suspendedCount}</strong></p>
              <p>Inactifs : <strong>${inactiveCount}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Genre</th>
                <th>Téléphone</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.gender === 'Male' ? 'Homme' : 'Femme'}</td>
                  <td>${m.phone}</td>
                  <td>${m.joinDate}</td>
                  <td>${m.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper bar */}
      <div>
        <h2 className="text-2xl font-display font-bold text-bento-blue">Rapports & Analyses d'activité</h2>
        <p className="text-xs text-slate-500">Examinez les tableaux de bord périodiques et imprimez des bilans d'activité sportifs et financiers certifiés.</p>
      </div>

      {/* Bento Grid containing report templates cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Report 1: Bilan Financier */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <span className="p-3 bg-bento-blue/10 text-bento-blue rounded-2xl inline-block">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-bento-blue text-base">Bilan Financier Mensuel</h3>
              <p className="text-xs text-slate-400 mt-1">Générez l'état comptable des cotisations perçues face aux décaissements de l'association.</p>
            </div>

            {/* Quick selectors inside */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div>
                <span className="block text-slate-400 font-bold mb-1">Mois</span>
                <select 
                  id="reports-month-select"
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg font-semibold"
                >
                  <option value="Juin">Juin</option>
                  <option value="Juillet">Juillet</option>
                </select>
              </div>

              <div>
                <span className="block text-slate-400 font-bold mb-1">Exercice</span>
                <select 
                  id="reports-year-select"
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg font-semibold"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            id="btn-generate-financial-report"
            onClick={handlePrintFinancials}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bento-blue hover:bg-bento-gold hover:text-bento-blue text-xs font-bold text-white rounded-xl shadow-xs transition-all mt-4"
          >
            <Printer className="w-4 h-4" />
            Imprimer le Bilan Comptable
          </button>
        </div>

        {/* Report 2: Demographic / Members */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base">Rapport Démographique Adhérents</h3>
              <p className="text-xs text-slate-400 mt-1">Examinez l'analyse globale des membres : moyenne d'âge, répartition des genres et statuts d'adhésion.</p>
            </div>

            {/* Visual metrics breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                <span className="text-slate-400 font-semibold block">Moyenne d'âge</span>
                <span className="text-sm font-bold text-slate-700 font-display">{averageAge} ans</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                <span className="text-slate-400 font-semibold block">Ratio Femmes</span>
                <span className="text-sm font-bold text-slate-700 font-display">
                  {totalMembers > 0 ? Math.round((femaleCount / totalMembers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <button 
            id="btn-generate-demographic-report"
            onClick={handlePrintDemographics}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white rounded-xl shadow-xs transition-colors mt-4"
          >
            <Printer className="w-4 h-4" />
            Éditer l'Annuaire des Membres
          </button>
        </div>

        {/* Report 3: Attendance Analytics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl inline-block">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base">Statistiques de Fréquentation</h3>
              <p className="text-xs text-slate-400 mt-1">Analysez l'assiduité moyenne de vos athlètes, les athlètes les plus réguliers aux entraînements de Judo/Karaté.</p>
            </div>

            {/* Top attendees highlight inside report card */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Athlètes d'Élite du mois</span>
              {sortedTopAttendees.map((att, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                  <span className="font-medium">{att.name}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-xs">{att.count} séances</span>
                </div>
              ))}
              {sortedTopAttendees.length === 0 && (
                <div className="text-xs text-slate-400 italic">Aucun pointage ce mois-ci.</div>
              )}
            </div>
          </div>

          <button 
            id="btn-print-attendance-report"
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-xs transition-colors mt-4"
          >
            <Printer className="w-4 h-4" />
            Imprimer l'Analyse de Fréquentation
          </button>
        </div>

      </div>

      {/* Visual Analytics bento timeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Tableau d'assiduité et d'activité du dojo</h3>
          <p className="text-xs text-slate-400">Synthèse générale cumulée à ce jour pour l'ensemble des modules.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Taux de présence</span>
            <span className="text-xl font-display font-bold text-emerald-600 mt-1 block">85,2 %</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Moyenne de Juillet 2026</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Taux d'encaissement</span>
            <span className="text-xl font-display font-bold text-bento-blue mt-1 block">71,4 %</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">6 de 8 membres actifs</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Solde Trésorerie</span>
            <span className="text-xl font-display font-bold text-indigo-600 mt-1 block">+19 500 DZD</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Solde net de Juillet</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Activité du Dojo</span>
            <span className="text-xl font-display font-bold text-bento-gold mt-1 block">Excellente</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">4 séances hebdomadaires</span>
          </div>

        </div>
      </div>

    </div>
  );
}
