/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, UserCheck, Clock, DollarSign, TrendingUp, TrendingDown, 
  Calendar, AlertCircle, Plus, Search, FileText, CheckSquare, Settings, ArrowRight
} from 'lucide-react';
import { Member, Payment, Expense, Attendance, Session, ActivityLog } from '../types';

interface DashboardViewProps {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  attendance: Attendance[];
  sessions: Session[];
  logs: ActivityLog[];
  currency: string;
  t: (key: string) => string;
  onNavigate: (tab: string) => void;
  onAddMemberQuick: () => void;
  onRecordPaymentQuick: () => void;
  onStartScanningQuick: () => void;
}

export default function DashboardView({
  members,
  payments,
  expenses,
  attendance,
  sessions,
  logs,
  currency,
  t,
  onNavigate,
  onAddMemberQuick,
  onRecordPaymentQuick,
  onStartScanningQuick
}: DashboardViewProps) {
  // Live Clock for Oran, Algeria (Africa/Algiers)
  const [currentAlgeriaTime, setCurrentAlgeriaTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlgeriaTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatAlgeriaTime = (date: Date) => {
    const formatted = new Intl.DateTimeFormat('fr-DZ', {
      timeZone: 'Africa/Algiers',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Calculations
  const totalMembersCount = members.length;
  const activeMembers = members.filter(m => m.status === 'Active');
  const activeMembersCount = activeMembers.length;

  const todayStr = '2026-07-07'; // Match system clock of dataset
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentTodayCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const absentTodayCount = Math.max(0, activeMembersCount - presentTodayCount);

  // Income calculations
  const monthlyIncome = payments
    .filter(p => p.month === 'Juillet' && p.year === 2026)
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyExpenses = expenses
    .filter(e => e.date.startsWith('2026-07'))
    .reduce((sum, e) => sum + e.amount, 0);

  // Pending payments (Active members who have NOT paid for Juillet 2026)
  const paidMemberIdsThisMonth = new Set(
    payments.filter(p => p.month === 'Juillet' && p.year === 2026).map(p => p.memberId)
  );
  const pendingMembers = activeMembers.filter(m => !paidMemberIdsThisMonth.has(m.id));
  const pendingPaymentsCount = pendingMembers.length;
  const pendingAmount = pendingMembers.reduce((sum, m) => sum + m.monthlyFee, 0);

  const activeSessionsCount = sessions.length;

  // Custom Chart Data - Monthly Revenue & Expenses
  // Let's create an elegant data representation for May, June, July 2026
  const chartData = [
    { month: 'Mai', income: 15000, expenses: 22000, members: 4 },
    { month: 'Juin', income: 19500, expenses: 75000, members: 6 },
    { month: 'Juillet', income: monthlyIncome, expenses: monthlyExpenses, members: totalMembersCount }
  ];

  // SVG Chart Dimensions & Computations
  const chartWidth = 500;
  const chartHeight = 180;
  const padding = 25;
  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expenses))) * 1.15 || 100000;

  const getX = (index: number) => padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
  const getY = (val: number) => chartHeight - padding - (val * (chartHeight - padding * 2)) / maxVal;

  const incomePointsStr = chartData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const expensePointsStr = chartData.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ');

  return (
    <div className="space-y-6 animate-fade-in text-bento-text">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 bg-neutral-950 text-white rounded-3xl shadow-xl relative overflow-hidden border border-bento-gold/30">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-bento-gold/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
            Les Bijoux d'Oran Manager
          </h2>
          <p className="text-slate-300 text-sm max-w-xl font-medium">
            Bienvenue dans votre centre de commande premium. Suivez l'évolution des athlètes, contrôlez les finances et enregistrez le pointage de vos membres en toute simplicité.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 bg-neutral-950 text-white px-4 py-2.5 rounded-2xl border border-bento-gold/40 text-xs font-mono shadow-md">
          <Clock className="w-4 h-4 text-bento-gold animate-pulse" />
          <span className="font-semibold text-bento-gold">{formatAlgeriaTime(currentAlgeriaTime)}</span>
        </div>
      </div>

      {/* Stats Bento Grid KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* KPI 1: Active Members */}
        <div 
          id="kpi-members"
          onClick={() => onNavigate('members')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32"
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('total_members')}</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-bento-blue">{totalMembersCount}</span>
            <span className="text-xs text-green-500 font-bold bg-green-50 px-2.5 py-1 rounded-md">+{activeMembersCount} actifs</span>
          </div>
        </div>

        {/* KPI 4: Pending / Outstanding Payments */}
        <div 
          id="kpi-pending"
          onClick={() => onNavigate('payments')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32"
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('outstanding_balance')}</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-rose-600">
              {pendingAmount.toLocaleString()} <span className="text-xs font-semibold text-rose-400">{currency}</span>
            </span>
            <span className="text-xs text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-md">{pendingPaymentsCount} retards</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Featured Analytics Graph */}
        <div className="lg:col-span-8 bg-neutral-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-bento-gold/25">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-bento-gold/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-display font-bold text-white text-lg">Aperçu Financier</h3>
                <p className="text-xs text-white/50 font-medium">Comparaison mensuelle des revenus encaissés et des dépenses opérationnelles</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/15">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-bento-gold rounded-full" />
                  <span className="text-white/80">Revenus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-white/40 rounded-full" />
                  <span className="text-white/80">Dépenses</span>
                </div>
              </div>
            </div>

            {/* Custom Responsive SVG Chart styled elegantly for dark mode */}
            <div className="relative w-full h-[180px] mt-2">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding + ratio * (chartHeight - padding * 2);
                  return (
                    <g key={i}>
                      <line 
                        x1={padding} 
                        y1={y} 
                        x2={chartWidth - padding} 
                        y2={y} 
                        stroke="rgba(255, 255, 255, 0.08)" 
                        strokeWidth="1" 
                      />
                      <text 
                        x={padding - 5} 
                        y={y + 4} 
                        fill="rgba(255, 255, 255, 0.4)" 
                        fontSize="9" 
                        textAnchor="end" 
                        fontFamily="monospace"
                      >
                        {Math.round((maxVal * (1 - ratio)) / 1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {chartData.map((d, i) => (
                  <text 
                    key={i} 
                    x={getX(i)} 
                    y={chartHeight - 5} 
                    fill="rgba(255, 255, 255, 0.5)" 
                    fontSize="11" 
                    fontWeight="500" 
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                ))}

                {/* Area Gradients */}
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Areas */}
                <path 
                  d={`M ${getX(0)},${chartHeight - padding} L ${incomePointsStr} L ${getX(chartData.length - 1)},${chartHeight - padding} Z`} 
                  fill="url(#incomeGrad)" 
                />
                <path 
                  d={`M ${getX(0)},${chartHeight - padding} L ${expensePointsStr} L ${getX(chartData.length - 1)},${chartHeight - padding} Z`} 
                  fill="url(#expenseGrad)" 
                />

                {/* Line Path - Expenses */}
                <polyline 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.4)" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                  points={expensePointsStr} 
                />

                {/* Line Path - Income */}
                <polyline 
                  fill="none" 
                  stroke="#D4AF37" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  points={incomePointsStr} 
                />

                {/* Data Points */}
                {chartData.map((d, i) => (
                  <g key={i}>
                    {/* Income Point */}
                    <circle cx={getX(i)} cy={getY(d.income)} r="4.5" fill="#002366" stroke="#D4AF37" strokeWidth="2.5" />
                    {/* Expense Point */}
                    <circle cx={getX(i)} cy={getY(d.expenses)} r="3.5" fill="#002366" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-2xl border border-white/10 mt-6 relative z-10 gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-xs text-white/40 font-medium block">Croissance</span>
                <span className="text-base font-bold text-white font-display">+{chartData[2].members - chartData[0].members} membres</span>
              </div>
              <div className="border-r border-white/10" />
              <div>
                <span className="text-xs text-white/40 font-medium block">Bilan de Juillet</span>
                <span className="text-base font-bold text-bento-gold font-display">
                  {(monthlyIncome - monthlyExpenses).toLocaleString()} {currency}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('reports')} 
              className="text-xs text-bento-gold font-bold hover:underline flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" /> Voir les rapports
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Raccourcis</span>
              <h3 className="font-display font-bold text-bento-blue text-lg">{t('quick_actions')}</h3>
              <p className="text-xs text-gray-400">Actions d'administration instantanées</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button 
                id="btn-add-member"
                onClick={onAddMemberQuick}
                className="w-full flex items-center justify-between p-4 bg-gray-50 text-bento-blue hover:bg-bento-blue/5 border border-gray-200/50 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-bento-blue" />
                  {t('add_member')}
                </span>
                <Plus className="w-4 h-4" />
              </button>

              <button 
                id="btn-record-payment"
                onClick={onRecordPaymentQuick}
                className="w-full flex items-center justify-between p-4 bg-gray-50 text-bento-blue hover:bg-bento-blue/5 border border-gray-200/50 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-bento-blue" />
                  {t('record_payment')}
                </span>
                <Plus className="w-4 h-4" />
              </button>

              {/* Special Bento Highlight Quick Action */}
              <button 
                id="btn-scan-qr"
                onClick={onStartScanningQuick}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-bento-gold to-bento-gold-dark text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                <span className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-white" />
                  {t('start_attendance')}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button 
                id="btn-create-session"
                onClick={() => onNavigate('sessions')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 text-bento-blue hover:bg-bento-blue/5 border border-gray-200/50 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-bento-blue" />
                  {t('create_session')}
                </span>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Rôle : <strong>Admin</strong></span>
            <span>Séances : <strong>{activeSessionsCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Grid: Recent Activity & Outstanding Balance list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Logs Timeline */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Audit Trail</span>
                <h3 className="font-display font-bold text-bento-blue text-lg">{t('recent_activity')}</h3>
                <p className="text-xs text-gray-400">Flux d'audit et modifications en temps réel</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg text-green-600 flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                Live
              </span>
            </div>

            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 items-start p-3 hover:bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
                  <div className={`p-2.5 rounded-xl text-xs font-bold shrink-0 ${
                    log.userRole === 'Admin' ? 'bg-bento-blue/5 text-bento-blue' :
                    log.userRole === 'Treasurer' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {log.userRole[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-bento-blue">{log.userName}</span>
                      <span className="text-[9px] font-mono text-gray-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{log.action}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 block truncate">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Presence Progress Widget */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center min-h-[300px]">
          <div className="w-full">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Taux de présence</span>
            <h3 className="font-display font-bold text-bento-blue text-sm">Aujourd'hui</h3>
          </div>
          
          {(() => {
            const percentage = Math.round((presentTodayCount / (activeMembersCount || 1)) * 100);
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            return (
              <div className="flex flex-col items-center justify-center my-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      stroke="#f3f4f6" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      stroke="#002366" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={offset} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black text-bento-blue">{percentage}%</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-wider">{presentTodayCount} / {activeMembersCount} Athlètes</p>
              </div>
            );
          })()}

          <button 
            onClick={() => onNavigate('attendance')}
            className="w-full py-2 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200/50"
          >
            Faire l'appel
          </button>
        </div>

        {/* Outstanding Balances List */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Cotisations</span>
                <h3 className="font-display font-bold text-bento-blue text-lg">Retards Paiements</h3>
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                {pendingPaymentsCount}
              </span>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {pendingMembers.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-medium">
                  🎉 Tous les adhérents actifs ont payé !
                </div>
              ) : (
                pendingMembers.slice(0, 4).map((member) => (
                  <div 
                    key={member.id} 
                    onClick={() => onNavigate('payments')}
                    className="cursor-pointer flex items-center justify-between p-3 bg-rose-50/30 hover:bg-rose-50/70 border border-rose-100/30 hover:border-rose-100 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.photoUrl} 
                        alt={member.name} 
                        className="w-8 h-8 rounded-full object-cover border border-rose-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-gray-700 block truncate">{member.name}</span>
                        <span className="text-[9px] text-gray-400 block">{member.membershipNumber}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 shrink-0">
                      -{member.monthlyFee} {currency}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <button 
              onClick={() => onNavigate('payments')} 
              className="w-full text-center text-xs font-bold text-bento-blue hover:text-bento-gold transition-colors"
            >
              Gérer la trésorerie →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
