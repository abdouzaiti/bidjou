/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Coach, Session, Payment, Attendance, Expense, AppNotification, ClubSettings, ActivityLog } from '../types';

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'Coach Bidjou',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
    phone: '0550 12 34 56',
    email: 'bidjou@bijouxoran.com',
    status: 'Active'
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'session-1',
    title: 'Judo Élite - Préparation Physique',
    coachId: 'coach-1',
    location: 'Dojo Central - Oran',
    date: '2026-07-07',
    time: '18:00',
    description: 'Séance intensive axée sur le randori et la technique de projection (Nage-Waza).',
    capacity: 25
  },
  {
    id: 'session-2',
    title: 'Karaté Enfants - Débutants',
    coachId: 'coach-1',
    location: 'Dojo Annexe - Es Senia',
    date: '2026-07-07',
    time: '16:30',
    description: 'Apprentissage des katas de base (Heian Shodan) et de la discipline de combat.',
    capacity: 20
  },
  {
    id: 'session-3',
    title: 'Gymnastique Rythmique & Sol',
    coachId: 'coach-1',
    location: 'Salle Omnisports - Front de Mer',
    date: '2026-07-08',
    time: '15:00',
    description: 'Enchaînement chorégraphique, souplesse et renforcement musculaire du tronc.',
    capacity: 15
  },
  {
    id: 'session-4',
    title: 'Self-Défense Adultes Tous Niveaux',
    coachId: 'coach-1',
    location: 'Dojo Central - Oran',
    date: '2026-07-09',
    time: '19:30',
    description: 'Techniques de dégagement rapide, gestion du stress et clés de bras.',
    capacity: 30
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mbr-1',
    membershipNumber: 'BJO-2026-001',
    name: 'Yacine Brahimi',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
    birthDate: '1998-04-15',
    phone: '0552 41 82 93',
    address: '12 Rue Larbi Ben M\'hidi, Oran',
    status: 'Active',
    monthlyFee: 3500,
    medicalNotes: 'Apte au sport de combat de haute intensité.',
    emergencyInfo: 'Groupe sanguin O+',
    jetonId: 'JETON-YACINE-01'
  },
  {
    id: 'mbr-2',
    membershipNumber: 'BJO-2026-002',
    name: 'Sofia Benali',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop',
    birthDate: '2002-09-22',
    phone: '0663 88 44 22',
    address: 'Résidence El Bahia, Courbet, Oran',
    status: 'Active',
    monthlyFee: 3000,
    medicalNotes: 'Entorse cheville gauche en 2024. Totalement guérie.',
    emergencyInfo: 'Allergie au paracétamol.',
    jetonId: 'JETON-SOFIA-02'
  },
  {
    id: 'mbr-3',
    membershipNumber: 'BJO-2026-003',
    name: 'Amine Gouiri',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop',
    birthDate: '2005-11-02',
    phone: '0770 12 84 75',
    address: 'Cité 500 Logements, Canastel, Oran',
    status: 'Active',
    monthlyFee: 3000,
    medicalNotes: 'Aucune contre-indication.',
    emergencyInfo: 'Aucune',
    jetonId: 'JETON-AMINE-03'
  },
  {
    id: 'mbr-4',
    membershipNumber: 'BJO-2026-004',
    name: 'Selma Mansouri',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop',
    birthDate: '1995-07-30',
    phone: '0555 90 80 70',
    address: 'Seddikia, Oran',
    status: 'Suspended',
    monthlyFee: 3500,
    medicalNotes: 'Apte.',
    emergencyInfo: 'Groupe sanguin A+'
  },
  {
    id: 'mbr-5',
    membershipNumber: 'BJO-2026-005',
    name: 'Rayan Belkacem',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=250&auto=format&fit=crop',
    birthDate: '2009-02-14',
    phone: '0540 66 77 88',
    address: 'Boulanger, Oran',
    status: 'Active',
    monthlyFee: 3000,
    medicalNotes: 'Asthme d\'effort léger (garde sa ventoline avec lui).',
    emergencyInfo: 'Inhalateur de secours dans son sac de sport.',
    jetonId: 'JETON-RAYAN-05'
  },
  {
    id: 'mbr-6',
    membershipNumber: 'BJO-2026-006',
    name: 'Hassiba Morceli',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop',
    birthDate: '2000-01-08',
    phone: '0660 55 99 88',
    address: 'Maraval, Oran',
    status: 'Active',
    monthlyFee: 3500,
    medicalNotes: 'R.A.S.',
    emergencyInfo: 'Groupe sanguin B+',
    jetonId: 'JETON-HASSIBA-06'
  },
  {
    id: 'mbr-7',
    membershipNumber: 'BJO-2026-007',
    name: 'Faycal Bouazza',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=250&auto=format&fit=crop',
    birthDate: '1990-12-12',
    phone: '0772 33 44 55',
    address: 'Front de Mer, Oran',
    status: 'Inactive',
    monthlyFee: 3000,
    medicalNotes: 'R.A.S.',
    emergencyInfo: 'Aucune'
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  // Today's attendance (2026-07-07)
  {
    id: 'att-1',
    memberId: 'mbr-1',
    date: '2026-07-07',
    time: '17:55',
    sessionId: 'session-1',
    coachId: 'coach-1',
    status: 'Present'
  },
  {
    id: 'att-2',
    memberId: 'mbr-2',
    date: '2026-07-07',
    time: '16:25',
    sessionId: 'session-2',
    coachId: 'coach-3',
    status: 'Present'
  },
  {
    id: 'att-3',
    memberId: 'mbr-5',
    date: '2026-07-07',
    time: '18:10',
    sessionId: 'session-1',
    coachId: 'coach-1',
    status: 'Late'
  },
  // Yesterday's attendance (2026-07-06)
  {
    id: 'att-4',
    memberId: 'mbr-1',
    date: '2026-07-06',
    time: '18:02',
    sessionId: 'session-1',
    coachId: 'coach-1',
    status: 'Present'
  },
  {
    id: 'att-5',
    memberId: 'mbr-3',
    date: '2026-07-06',
    time: '16:28',
    sessionId: 'session-2',
    coachId: 'coach-3',
    status: 'Present'
  },
  {
    id: 'att-6',
    memberId: 'mbr-6',
    date: '2026-07-06',
    time: '18:00',
    sessionId: 'session-1',
    coachId: 'coach-1',
    status: 'Present'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  // Payments for Juillet 2026
  {
    id: 'pay-1',
    memberId: 'mbr-1',
    amount: 3500,
    month: 'Juillet',
    year: 2026,
    date: '2026-07-02',
    paymentMethod: 'Cash',
    reference: 'REF-JUL-01',
    notes: 'Cotisation mensuelle réglée en espèces au dojo.',
    receiptNumber: 'REC-2026-0041'
  },
  {
    id: 'pay-2',
    memberId: 'mbr-2',
    amount: 3000,
    month: 'Juillet',
    year: 2026,
    date: '2026-07-05',
    paymentMethod: 'Card',
    reference: 'CIB-9031-102',
    notes: 'Réglé par carte CIB sur terminal de paiement.',
    receiptNumber: 'REC-2026-0042'
  },
  // Payments for Juin 2026
  {
    id: 'pay-3',
    memberId: 'mbr-1',
    amount: 3500,
    month: 'Juin',
    year: 2026,
    date: '2026-06-03',
    paymentMethod: 'Cash',
    reference: 'REF-JUN-01',
    notes: 'Réglé à temps.',
    receiptNumber: 'REC-2026-0035'
  },
  {
    id: 'pay-4',
    memberId: 'mbr-2',
    amount: 3000,
    month: 'Juin',
    year: 2026,
    date: '2026-06-04',
    paymentMethod: 'Bank Transfer',
    reference: 'CCP-TRANS-203',
    notes: 'Virement postal direct.',
    receiptNumber: 'REC-2026-0036'
  },
  {
    id: 'pay-5',
    memberId: 'mbr-3',
    amount: 3000,
    month: 'Juin',
    year: 2026,
    date: '2026-06-10',
    paymentMethod: 'Cash',
    reference: 'REF-JUN-05',
    notes: 'Payé en mains propres.',
    receiptNumber: 'REC-2026-0037'
  },
  {
    id: 'pay-6',
    memberId: 'mbr-5',
    amount: 3000,
    month: 'Juin',
    year: 2026,
    date: '2026-06-12',
    paymentMethod: 'Cash',
    reference: 'REF-JUN-08',
    notes: 'Cotisation reçue par son père.',
    receiptNumber: 'REC-2026-0038'
  },
  {
    id: 'pay-7',
    memberId: 'mbr-6',
    amount: 3500,
    month: 'Juin',
    year: 2026,
    date: '2026-06-05',
    paymentMethod: 'Card',
    reference: 'CIB-1029-923',
    notes: 'Transaction validée.',
    receiptNumber: 'REC-2026-0039'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Achat de 4 Tatamis de Judo standard',
    amount: 45000,
    category: 'Equipment',
    date: '2026-07-02',
    description: 'Nouveaux tatamis haute densité bleus pour l\'annexe d\'Es Senia.'
  },
  {
    id: 'exp-2',
    title: 'Loyer mensuel Dojo Central',
    amount: 80000,
    category: 'Rent',
    date: '2026-07-01',
    description: 'Paiement du loyer du Dojo principal au Front de Mer d\'Oran.'
  },
  {
    id: 'exp-3',
    title: 'Packs d\'eau minérale (10 cartons)',
    amount: 4500,
    category: 'Water',
    date: '2026-07-05',
    description: 'Approvisionnement en eau pour les athlètes de haut niveau.'
  },
  {
    id: 'exp-4',
    title: 'Réparation climatiseur Dojo',
    amount: 15000,
    category: 'Maintenance',
    date: '2026-06-25',
    description: 'Maintenance préventive et recharge de gaz pour la climatisation.'
  },
  {
    id: 'exp-5',
    title: 'Frais de transport Championnat National',
    amount: 60000,
    category: 'Transport',
    date: '2026-06-18',
    description: 'Déplacement de l\'équipe élite de judo d\'Oran à Alger (Aller-Retour).'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Renouvellement en suspens',
    message: 'Le membre Rayan Belkacem n\'a pas encore réglé sa cotisation pour Juillet 2026.',
    type: 'Reminder',
    date: '2026-07-07 09:00',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Championnat Régional d\'Oran',
    message: 'Les inscriptions pour le championnat de Karaté du 18 Juillet sont désormais ouvertes.',
    type: 'Announcement',
    date: '2026-07-06 14:30',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Joyeux Anniversaire !',
    message: 'C\'est l\'anniversaire de Sofia Benali aujourd\'hui ! Souhaitez-lui un bon anniversaire.',
    type: 'Birthday',
    date: '2026-07-07 08:00',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Équipement Reçu',
    message: 'Les nouveaux tatamis de judo pour le dojo d\'Es Senia ont été livrés et installés.',
    type: 'Alert',
    date: '2026-07-03 11:15',
    read: true
  }
];

export const INITIAL_SETTINGS: ClubSettings = {
  clubName: "Les Bijoux d'Oran",
  clubLogo: "🥋",
  defaultMonthlyFee: 3000,
  currency: "DZD",
  language: "fr",
  theme: "light",
  coachUsername: "coach",
  coachPassword: "password",
  coachName: "Coach Bidjou",
  coachPhoto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop",
  requireCoachPassword: false
};

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userRole: 'Admin',
    userName: 'Coach Bidjou',
    action: 'Connexion',
    details: 'Session administrateur démarrée avec succès.',
    timestamp: '2026-07-07 13:02:45'
  },
  {
    id: 'log-2',
    userRole: 'Admin',
    userName: 'Coach Bidjou',
    action: 'Validation Cotisation',
    details: 'Paiement enregistré pour Sofia Benali (REC-2026-0042).',
    timestamp: '2026-07-05 16:30:12'
  },
  {
    id: 'log-3',
    userRole: 'Treasurer',
    userName: 'Treasurer Amel',
    action: 'Dépense Ajoutée',
    details: 'Achat de 4 Tatamis de Judo standard (45 000 DZD).',
    timestamp: '2026-07-02 11:00:15'
  }
];

// LocalStorage Helper functions
export function getStoredData<T>(key: string, initialData: T): T {
  try {
    const item = localStorage.getItem(`bjo_${key}`);
    return item ? JSON.parse(item) : initialData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return initialData;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`bjo_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

export const loadMembers = () => {
  const loaded = getStoredData<Member[]>('members', INITIAL_MEMBERS);
  return loaded.map(m => {
    if (!m.jetonId) {
      const init = INITIAL_MEMBERS.find(im => im.id === m.id);
      if (init && init.jetonId) {
        return { ...m, jetonId: init.jetonId };
      }
    }
    return m;
  });
};
export const saveMembers = (data: Member[]) => setStoredData('members', data);

export const loadCoaches = () => getStoredData<Coach[]>('coaches', INITIAL_COACHES);
export const saveCoaches = (data: Coach[]) => setStoredData('coaches', data);

export const loadSessions = () => getStoredData<Session[]>('sessions', INITIAL_SESSIONS);
export const saveSessions = (data: Session[]) => setStoredData('sessions', data);

export const loadPayments = () => getStoredData<Payment[]>('payments', INITIAL_PAYMENTS);
export const savePayments = (data: Payment[]) => setStoredData('payments', data);

export const loadExpenses = () => getStoredData<Expense[]>('expenses', INITIAL_EXPENSES);
export const saveExpenses = (data: Expense[]) => setStoredData('expenses', data);

export const loadNotifications = () => getStoredData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
export const saveNotifications = (data: AppNotification[]) => setStoredData('notifications', data);

export const loadSettings = () => getStoredData<ClubSettings>('settings', INITIAL_SETTINGS);
export const saveSettings = (data: ClubSettings) => setStoredData('settings', data);

export const loadAttendance = () => getStoredData<Attendance[]>('attendance', INITIAL_ATTENDANCE);
export const saveAttendance = (data: Attendance[]) => setStoredData('attendance', data);

// Clear all data to restore defaults
export function resetStoredData(): void {
  try {
    localStorage.removeItem('bjo_members');
    localStorage.removeItem('bjo_coaches');
    localStorage.removeItem('bjo_sessions');
    localStorage.removeItem('bjo_payments');
    localStorage.removeItem('bjo_attendance');
    localStorage.removeItem('bjo_expenses');
    localStorage.removeItem('bjo_notifications');
    localStorage.removeItem('bjo_settings');
    localStorage.removeItem('bjo_logs');
    window.location.reload();
  } catch (error) {
    console.error('Error resetting database', error);
  }
}
