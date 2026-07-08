/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Admin' | 'Coach' | 'Treasurer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoUrl?: string;
}

export interface Member {
  id: string;
  membershipNumber: string;
  name: string;
  photoUrl: string;
  gender: 'Male' | 'Female';
  birthDate: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  joinDate: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  monthlyFee: number;
  notes: string;
  medicalNotes: string;
  emergencyInfo: string;
  jetonId?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  sessionId: string;
  coachId: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  month: string; // e.g. "Janvier", "Février", etc. or month name
  year: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer';
  reference: string;
  notes: string;
  receiptNumber: string;
}

export interface Session {
  id: string;
  title: string;
  coachId: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  capacity: number;
}

export interface Coach {
  id: string;
  name: string;
  photoUrl: string;
  phone: string;
  email: string;
  specialty: string;
  experience: string;
  status: 'Active' | 'Inactive';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Equipment' | 'Transport' | 'Water' | 'Competition' | 'Maintenance' | 'Rent' | 'Other';
  date: string; // YYYY-MM-DD
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'Alert' | 'Reminder' | 'Announcement' | 'Birthday';
  date: string; // YYYY-MM-DD HH:MM
  read: boolean;
}

export interface ClubSettings {
  clubName: string;
  clubLogo: string;
  defaultMonthlyFee: number;
  currency: string; // e.g., "DZD"
  language: 'fr' | 'ar' | 'en';
  theme: 'light' | 'dark';
}

export interface ActivityLog {
  id: string;
  userRole: Role;
  userName: string;
  action: string;
  details: string;
  timestamp: string; // YYYY-MM-DD HH:MM:SS
}
