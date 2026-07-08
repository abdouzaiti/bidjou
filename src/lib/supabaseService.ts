import { supabase } from './supabase';
import { Member, Coach, Session, Payment, Attendance, Expense, AppNotification, ClubSettings, ActivityLog } from '../types';

export const supabaseService = {
  // Members
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Map DB snake_case to camelCase
    return (data || []).map(m => ({
      id: m.id,
      membershipNumber: m.membership_number,
      name: m.name,
      photoUrl: m.photo_url,
      gender: m.gender,
      birthDate: m.birth_date,
      phone: m.phone,
      emergencyContactName: m.emergency_contact_name,
      emergencyContactPhone: m.emergency_contact_phone,
      address: m.address,
      joinDate: m.join_date,
      status: m.status,
      monthlyFee: m.monthly_fee,
      notes: m.notes,
      medicalNotes: m.medical_notes,
      emergencyInfo: m.emergency_info,
      jetonId: m.jeton_id,
      bloodType: m.blood_type
    }));
  },

  async addMember(member: Omit<Member, 'id'>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([{
        membership_number: member.membershipNumber,
        name: member.name,
        photo_url: member.photoUrl,
        gender: member.gender,
        birth_date: member.birthDate,
        phone: member.phone,
        emergency_contact_name: member.emergencyContactName,
        emergency_contact_phone: member.emergencyContactPhone,
        address: member.address,
        join_date: member.joinDate,
        status: member.status,
        monthly_fee: member.monthlyFee,
        notes: member.notes,
        medical_notes: member.medicalNotes,
        emergency_info: member.emergencyInfo,
        jeton_id: member.jetonId,
        blood_type: member.bloodType
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    const updateData: any = {};
    if (member.membershipNumber) updateData.membership_number = member.membershipNumber;
    if (member.name) updateData.name = member.name;
    if (member.photoUrl) updateData.photo_url = member.photoUrl;
    if (member.gender) updateData.gender = member.gender;
    if (member.birthDate) updateData.birth_date = member.birthDate;
    if (member.phone) updateData.phone = member.phone;
    if (member.emergencyContactName) updateData.emergency_contact_name = member.emergencyContactName;
    if (member.emergencyContactPhone) updateData.emergency_contact_phone = member.emergencyContactPhone;
    if (member.address) updateData.address = member.address;
    if (member.joinDate) updateData.join_date = member.joinDate;
    if (member.status) updateData.status = member.status;
    if (member.monthlyFee !== undefined) updateData.monthly_fee = member.monthlyFee;
    if (member.notes) updateData.notes = member.notes;
    if (member.medicalNotes) updateData.medical_notes = member.medicalNotes;
    if (member.emergencyInfo) updateData.emergency_info = member.emergencyInfo;
    if (member.jetonId) updateData.jeton_id = member.jetonId;
    if (member.bloodType) updateData.blood_type = member.bloodType;

    const { error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      memberId: p.member_id,
      amount: p.amount,
      month: p.month,
      year: p.year,
      date: p.date,
      paymentMethod: p.payment_method,
      reference: p.reference,
      notes: p.notes,
      receiptNumber: p.receipt_number
    }));
  },

  async addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        member_id: payment.memberId,
        amount: payment.amount,
        month: payment.month,
        year: payment.year,
        date: payment.date,
        payment_method: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes,
        receipt_number: payment.receiptNumber
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      title: s.title,
      coachId: s.coach_id,
      location: s.location,
      date: s.date,
      time: s.time,
      description: s.description,
      capacity: s.capacity
    }));
  },

  async addSession(session: Omit<Session, 'id'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        title: session.title,
        coach_id: session.coachId,
        location: session.location,
        date: session.date,
        time: session.time,
        description: session.description,
        capacity: session.capacity
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Coaches
  async getCoaches(): Promise<Coach[]> {
    const { data, error } = await supabase
      .from('coaches')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async addCoach(coach: Omit<Coach, 'id'>): Promise<Coach> {
    const { data, error } = await supabase
      .from('coaches')
      .insert([coach])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCoach(id: string): Promise<void> {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<ClubSettings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return {
      clubName: data.club_name,
      clubLogo: data.club_logo,
      defaultMonthlyFee: data.default_monthly_fee,
      currency: data.currency,
      language: data.language,
      theme: data.theme,
      coachUsername: data.coach_username,
      coachPassword: data.coach_password,
      coachName: data.coach_name,
      coachPhoto: data.coach_photo,
      requireCoachPassword: data.require_coach_password
    };
  },

  async updateSettings(settings: Partial<ClubSettings>): Promise<void> {
    const updateData: any = {};
    if (settings.clubName) updateData.club_name = settings.clubName;
    if (settings.clubLogo) updateData.club_logo = settings.clubLogo;
    if (settings.defaultMonthlyFee !== undefined) updateData.default_monthly_fee = settings.defaultMonthlyFee;
    if (settings.currency) updateData.currency = settings.currency;
    if (settings.language) updateData.language = settings.language;
    if (settings.theme) updateData.theme = settings.theme;
    if (settings.coachUsername) updateData.coach_username = settings.coachUsername;
    if (settings.coachPassword) updateData.coach_password = settings.coachPassword;
    if (settings.coachName) updateData.coach_name = settings.coachName;
    if (settings.coachPhoto !== undefined) updateData.coach_photo = settings.coachPhoto;
    if (settings.requireCoachPassword !== undefined) updateData.require_coach_password = settings.requireCoachPassword;

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...updateData });

    if (error) throw error;
  },

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(a => ({
      id: a.id,
      memberId: a.member_id,
      date: a.date,
      time: a.time,
      sessionId: a.session_id,
      coachId: a.coach_id,
      status: a.status
    }));
  },

  async recordAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        member_id: attendance.memberId,
        date: attendance.date,
        time: attendance.time,
        session_id: attendance.sessionId,
        coach_id: attendance.coachId,
        status: attendance.status
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearTodayAttendance(date: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('date', date);

    if (error) throw error;
  }
};
