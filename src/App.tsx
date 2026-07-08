/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Users, Clock, CreditCard, Calendar, Award, TrendingDown, 
  BarChart3, Bell, Settings, LogOut, Menu, X, HelpCircle, Shield, ChevronDown
} from 'lucide-react';

// Domain models
import { Member, Payment, Session, Coach, Expense, AppNotification, ClubSettings } from './types';

// Storage & Utilities
import { 
  loadMembers, saveMembers,
  loadPayments, savePayments,
  loadSessions, saveSessions,
  loadCoaches, saveCoaches,
  loadExpenses, saveExpenses,
  loadNotifications, saveNotifications,
  loadSettings, saveSettings,
  resetStoredData
} from './utils/mockData';
import { getTranslation } from './utils/translations';

// Subcomponents
import DashboardView from './components/DashboardView';
import MembersView from './components/MembersView';
import AttendanceView from './components/AttendanceView';
import PaymentsView from './components/PaymentsView';
import SessionsView from './components/SessionsView';
import CoachesView from './components/CoachesView';
import ExpensesView from './components/ExpensesView';
import ReportsView from './components/ReportsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [introActive, setIntroActive] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroActive(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Database States
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<ClubSettings>({
    clubName: "Les Bijoux d'Oran",
    clubLogo: "🥋",
    defaultMonthlyFee: 3000,
    currency: "DZD",
    language: "fr",
    theme: "light"
  });

  // Simulator Roles
  const [activeRole, setActiveRole] = useState<'Admin' | 'Coach' | 'Treasurer'>('Admin');

  // Coach Authentication Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<'Admin' | 'Coach' | 'Treasurer' | null>(null);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Quick action cross-triggers
  const [quickOpenScanner, setQuickOpenScanner] = useState<boolean>(false);
  const [quickOpenPaymentForm, setQuickOpenPaymentForm] = useState<boolean>(false);

  // Initial Seed Loading
  useEffect(() => {
    setMembers(loadMembers());
    setPayments(loadPayments());
    setSessions(loadSessions());
    setCoaches(loadCoaches());
    setExpenses(loadExpenses());
    setNotifications(loadNotifications());
    setSettings(loadSettings());
  }, []);

  // Translation Helper
  const t = (key: string) => getTranslation(key, settings.language);

  // HANDLERS : Members
  const handleAddMember = (newMember: Omit<Member, 'id' | 'membershipNumber'>) => {
    const fresh: Member = {
      ...newMember,
      id: `member-${Date.now()}`,
      membershipNumber: `BJO-2026-${String(members.length + 1).padStart(3, '0')}`
    };
    const updated = [fresh, ...members];
    setMembers(updated);
    saveMembers(updated);

    // Dynamic notification trigger
    triggerNotification('Nouveau Membre', `L'athlète ${fresh.name} a été inscrit avec succès sous le matricule ${fresh.membershipNumber}.`, 'Announcement');
  };

  const handleUpdateMember = (id: string, updatedFields: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updatedFields } as Member : m);
    setMembers(updated);
    saveMembers(updated);
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    saveMembers(updated);
  };

  // HANDLERS : Attendance (Pointage)
  const handleRecordAttendance = (memberId: string, status: 'Present' | 'Late' | 'Absent', sessionId: string) => {
    // Generate new entry
    const todayStr = '2026-07-07';
    const currentTimeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Read previous records from local storage directly or state
    const currentList = [...loadPayments()]; // temporary check, actual is attendance database

    // Since we maintain attendance list in our custom mockData.ts localStorage, let's load/save it
    const storedAttendance = JSON.parse(localStorage.getItem('les_bijoux_oran_attendance') || '[]');
    
    // Exclude if already exists for same member, day, and session
    const filtered = storedAttendance.filter((a: any) => !(a.memberId === memberId && a.date === todayStr && a.sessionId === sessionId));
    
    const newRecord = {
      id: `att-${Date.now()}`,
      memberId,
      date: todayStr,
      time: currentTimeStr,
      status,
      sessionId
    };

    const updated = [newRecord, ...filtered];
    localStorage.setItem('les_bijoux_oran_attendance', JSON.stringify(updated));
    
    // Force trigger re-render of attendance state variables in views
    // Simply trigger an alert or state updater
    // Force sync state by reading again
    setMembers([...loadMembers()]); // triggers state change cascade
  };

  const handleClearTodayAttendance = () => {
    const todayStr = '2026-07-07';
    const storedAttendance = JSON.parse(localStorage.getItem('les_bijoux_oran_attendance') || '[]');
    const filtered = storedAttendance.filter((a: any) => a.date !== todayStr);
    localStorage.setItem('les_bijoux_oran_attendance', JSON.stringify(filtered));
    setMembers([...loadMembers()]); // force sync
  };

  // Get live list of attendances safely
  const getAttendanceList = () => {
    return JSON.parse(localStorage.getItem('les_bijoux_oran_attendance') || '[]');
  };

  // HANDLERS : Payments
  const handleRecordPayment = (newPayment: Omit<Payment, 'id' | 'receiptNumber'>) => {
    const fresh: Payment = {
      ...newPayment,
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = [fresh, ...payments];
    setPayments(updated);
    savePayments(updated);

    // Add alert notification
    const m = members.find(athlete => athlete.id === fresh.memberId);
    triggerNotification('Paiement Enregistré', `Reçu ${fresh.receiptNumber} validé pour ${m ? m.name : 'un membre'} (${fresh.amount} ${settings.currency}).`, 'Reminder');
  };

  // HANDLERS : Sessions (Planning)
  const handleAddSession = (newSession: Omit<Session, 'id'>) => {
    const fresh: Session = {
      ...newSession,
      id: `session-${Date.now()}`
    };
    const updated = [fresh, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    triggerNotification('Nouvelle Séance', `La séance "${fresh.title}" est maintenant planifiée le ${fresh.date}.`, 'Reminder');
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
  };

  // HANDLERS : Coaches
  const handleAddCoach = (newCoach: Omit<Coach, 'id'>) => {
    const fresh: Coach = {
      ...newCoach,
      id: `coach-${Date.now()}`
    };
    const updated = [fresh, ...coaches];
    setCoaches(updated);
    saveCoaches(updated);
    triggerNotification('Entraîneur Inscrit', `Le coach expert ${fresh.name} a été ajouté à l'équipe.`, 'Announcement');
  };

  const handleDeleteCoach = (id: string) => {
    const updated = coaches.filter(c => c.id !== id);
    setCoaches(updated);
    saveCoaches(updated);
  };

  // HANDLERS : Expenses
  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const fresh: Expense = {
      ...newExpense,
      id: `expense-${Date.now()}`
    };
    const updated = [fresh, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    triggerNotification('Sortie de caisse', `Une dépense de ${fresh.amount} ${settings.currency} a été déclarée : ${fresh.title}.`, 'Alert');
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  // HANDLERS : Notifications
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleAddNotification = (newNotif: Omit<AppNotification, 'id' | 'read' | 'date'>) => {
    triggerNotification(newNotif.title, newNotif.message, newNotif.type);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const triggerNotification = (title: string, message: string, type: 'Announcement' | 'Alert' | 'Reminder' | 'Birthday') => {
    const fresh: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      date: new Date().toLocaleDateString('fr-FR')
    };
    const updated = [fresh, ...notifications];
    setNotifications(updated);
    saveNotifications(updated);
  };

  // HANDLERS : Settings
  const handleUpdateSettings = (newSettings: Partial<ClubSettings>) => {
    const updated = {
      ...settings,
      ...newSettings
    };
    setSettings(updated);
    saveSettings(updated);
  };

  // HANDLERS : Role Switch & Password Challenge
  const handleRoleSwitchAttempt = (targetRole: 'Admin' | 'Coach' | 'Treasurer') => {
    if (targetRole === 'Coach' && settings.requireCoachPassword) {
      setPendingRole('Coach');
      setAuthUsername('');
      setAuthPassword('');
      setAuthError('');
      setIsAuthModalOpen(true);
    } else {
      setActiveRole(targetRole);
      triggerNotification(
        'Rôle Modifié',
        `Vous êtes connecté en tant que ${targetRole === 'Admin' ? 'Administrateur' : targetRole === 'Coach' ? 'Entraîneur' : 'Trésorier'}.`,
        'Announcement'
      );
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedUsername = settings.coachUsername || 'coach';
    const expectedPassword = settings.coachPassword || 'password';
    
    if (authUsername === expectedUsername && authPassword === expectedPassword) {
      setActiveRole('Coach');
      setIsAuthModalOpen(false);
      setAuthError('');
      triggerNotification(
        'Connexion Coach',
        `Authentification réussie pour Coach Bidjou. Mode Entraîneur activé.`,
        'Announcement'
      );
    } else {
      setAuthError('Nom d\'utilisateur ou mot de passe incorrect.');
    }
  };

  // Database Reset helper
  const handleResetDatabase = () => {
    resetStoredData();
    // Force reload states from freshly seeded local storage
    setMembers(loadMembers());
    setPayments(loadPayments());
    setSessions(loadSessions());
    setCoaches(loadCoaches());
    setExpenses(loadExpenses());
    setNotifications(loadNotifications());
    setSettings(loadSettings());
    localStorage.removeItem('les_bijoux_oran_attendance'); // Clear scans
    setCurrentView('dashboard');
  };

  // Physical JSON Backup download trigger
  const handleTriggerBackup = () => {
    const databaseSnapshot = {
      backupDate: new Date().toISOString(),
      clubName: settings.clubName,
      members,
      payments,
      sessions,
      coaches,
      expenses,
      notifications,
      attendance: getAttendanceList()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(databaseSnapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_les_bijoux_oran_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Safe checks for unread notifications counter
  const unreadCount = notifications.filter(n => !n.read).length;

  // Render correct panel component based on currentView state
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            members={members}
            payments={payments}
            expenses={expenses}
            attendance={getAttendanceList()}
            sessions={sessions}
            logs={JSON.parse(localStorage.getItem('bjo_logs') || '[]')}
            currency={settings.currency}
            t={t}
            onNavigate={(view) => setCurrentView(view)}
            onAddMemberQuick={() => { setCurrentView('members'); }}
            onRecordPaymentQuick={() => { setQuickOpenPaymentForm(true); setCurrentView('payments'); }}
            onStartScanningQuick={() => { setQuickOpenScanner(true); setCurrentView('attendance'); }}
          />
        );
      case 'members':
        return (
          <MembersView 
            members={members}
            payments={payments}
            attendance={getAttendanceList()}
            currency={settings.currency}
            t={t}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            quickOpenForm={false}
            setQuickOpenForm={() => {}}
          />
        );
      case 'attendance':
        return (
          <AttendanceView 
            members={members}
            attendance={getAttendanceList()}
            sessions={sessions}
            coaches={coaches}
            t={t}
            onRecordAttendance={handleRecordAttendance}
            onClearTodayAttendance={handleClearTodayAttendance}
            quickOpenScanner={quickOpenScanner}
            setQuickOpenScanner={setQuickOpenScanner}
            onUpdateMember={handleUpdateMember}
          />
        );
      case 'payments':
        return (
          <PaymentsView 
            members={members}
            payments={payments}
            currency={settings.currency}
            t={t}
            onRecordPayment={handleRecordPayment}
            quickOpenForm={quickOpenPaymentForm}
            setQuickOpenForm={setQuickOpenPaymentForm}
          />
        );
      case 'sessions':
        return (
          <SessionsView 
            sessions={sessions}
            coaches={coaches}
            members={members}
            attendance={getAttendanceList()}
            t={t}
            onAddSession={handleAddSession}
            onDeleteSession={handleDeleteSession}
          />
        );
      case 'coaches':
        return (
          <CoachesView 
            coaches={coaches}
            sessions={sessions}
            t={t}
            onAddCoach={handleAddCoach}
            onDeleteCoach={handleDeleteCoach}
          />
        );
      case 'expenses':
        return (
          <ExpensesView 
            expenses={expenses}
            currency={settings.currency}
            t={t}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            members={members}
            payments={payments}
            expenses={expenses}
            attendance={getAttendanceList()}
            currency={settings.currency}
            t={t}
          />
        );
      case 'notifications':
        return (
          <NotificationsView 
            notifications={notifications}
            t={t}
            onMarkAsRead={handleMarkAsRead}
            onAddNotification={handleAddNotification}
            onClearAllNotifications={handleClearAllNotifications}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            t={t}
            onUpdateSettings={handleUpdateSettings}
            onResetDatabase={handleResetDatabase}
            onTriggerBackup={handleTriggerBackup}
          />
        );
      default:
        return <div className="text-xs text-slate-400">View not found.</div>;
    }
  };

  // Nav item list configuration helper
  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'members', label: t('members'), icon: Users },
    { id: 'attendance', label: t('attendance'), icon: Clock, indicator: false },
    { id: 'payments', label: t('payments'), icon: CreditCard },
    { id: 'sessions', label: t('sessions'), icon: Calendar },
    { id: 'coaches', label: t('coaches'), icon: Award },
    { id: 'expenses', label: t('expenses'), icon: TrendingDown },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-bento-bg flex flex-col md:flex-row antialiased text-bento-text">
      
      {/* Intro Animation Overlay */}
      <AnimatePresence>
        {introActive && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 bg-neutral-950 z-50 flex flex-col items-center justify-center text-white"
          >
            <div className="relative flex flex-col items-center">
              {/* Big Centered Logo */}
              <div className="w-48 h-48 rounded-3xl flex items-center justify-center overflow-hidden mb-6">
                <motion.img 
                  layoutId="app-logo" 
                  src="/logo.png" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  transition={{ type: 'spring', stiffness: 50, damping: 14 }}
                />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-white font-display font-extrabold tracking-widest text-2xl uppercase">
                  {settings.clubName}
                </span>
                <div className="w-16 h-0.5 bg-bento-gold/80 rounded-full mt-4 animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-neutral-950 text-white px-5 py-4 flex items-center justify-between shadow-md relative z-30 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
            {!introActive && isMobile ? (
              <motion.img 
                layoutId="app-logo" 
                src="/logo.png" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer" 
                transition={{ type: 'spring', stiffness: 50, damping: 14 }}
              />
            ) : (
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            )}
          </div>
          <span className="font-display font-bold tracking-tight text-white text-sm uppercase">{settings.clubName}</span>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={() => setCurrentView('notifications')}
              className="relative p-1.5 bg-white/10 rounded-lg text-bento-gold"
            >
              <Bell className="w-4 h-4 animate-swing" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          )}

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 bg-white/10 rounded-lg text-slate-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar - responsive container drawer */}
      <div className={`
        fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-neutral-950 border-r border-white/5 text-white flex flex-col justify-between p-6 shadow-2xl transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-screen overflow-y-auto
      `}>
        
        <div className="space-y-6">
          {/* Logo brand */}
          <div className="flex flex-col items-center justify-center text-center gap-3 border-b border-white/10 pb-5 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
              {!introActive && !isMobile ? (
                <motion.img 
                  layoutId="app-logo" 
                  src="/logo.png" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  transition={{ type: 'spring', stiffness: 50, damping: 14 }}
                />
              ) : (
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold leading-none tracking-tight text-sm uppercase">{settings.clubName}</span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                     setCurrentView(item.id);
                     setSidebarOpen(false); // close mobile tray
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-bento-gold/15 to-bento-gold/5 text-bento-gold border border-bento-gold/25 shadow-md' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-bento-gold rounded-full shrink-0 animate-pulse absolute -left-0.5" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-bento-gold' : 'text-white/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Coach Profile Block */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="relative">
            <button 
              onClick={() => {
                if (activeRole !== 'Coach') {
                  handleRoleSwitchAttempt('Coach');
                } else {
                  handleRoleSwitchAttempt('Admin');
                }
              }}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-bento-gold/10 to-transparent border border-bento-gold/20 rounded-2xl transition-all text-left hover:from-bento-gold/20 hover:to-transparent cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${activeRole === 'Coach' ? 'bg-bento-gold text-neutral-950 ring-2 ring-bento-gold animate-pulse' : 'bg-bento-gold/20 text-bento-gold'} flex items-center justify-center border border-bento-gold/30 shrink-0`}>
                  <span className="text-xs font-bold">CB</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold leading-none">Coach Bidjou</p>
                  <p className="text-bento-gold text-[9px] font-semibold tracking-wider mt-1.5 uppercase">
                    {activeRole === 'Coach' ? '● Session Coach' : 'Entraîneur Principal'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-bento-gold opacity-60 shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* Main content body panel */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {renderActiveView()}
      </main>

      {/* Mobile background backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#002366]/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Coach Password Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-slate-800 animate-scale-in"
            >
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-bento-gold/20 flex items-center justify-center mb-3 text-bento-gold border border-bento-gold/30">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-bento-blue uppercase tracking-tight">Accès Espace Entraîneur</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Saisissez les identifiants configurés dans les paramètres.</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-center text-xs font-semibold">
                    {authError}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Nom d'utilisateur</label>
                    <input 
                      type="text"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-blue/20 bg-slate-50"
                      placeholder="Ex: coach"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Mot de passe</label>
                    <input 
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-blue/20 bg-slate-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-xl transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-bento-blue hover:bg-bento-gold hover:text-bento-blue text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Se connecter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
