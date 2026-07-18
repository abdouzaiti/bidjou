import { supabase } from './supabase';
import { Member, Coach, Session, Payment, Attendance, Expense, AppNotification, ClubSettings, ActivityLog } from '../types';

export const supabaseService = {
  // Members
  async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');
      
      if (error) {
        if (error.code === '42P01') {
          console.warn('La table "members" n\'existe pas encore.');
          return [];
        }
        console.error("Supabase Error (getMembers):", error);
        throw error;
      }
      
      return (data || []).map(m => this.mapMember(m));
    } catch (e) {
      console.error("Critical Failure in getMembers:", e);
      return [];
    }
  },

  mapMember(m: any): Member {
    return {
      id: m.id,
      membershipNumber: m.membership_number,
      name: m.name,
      photoUrl: m.photo_url,
      birthDate: m.birth_date,
      phone: m.phone,
      address: m.address,
      status: m.status,
      monthlyFee: m.monthly_fee,
      medicalNotes: m.medical_notes,
      emergencyInfo: m.emergency_info,
      jetonId: m.jeton_id || '',
      gender: m.gender,
    };
  },

  async addMember(member: Omit<Member, 'id'>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([{
        membership_number: member.membershipNumber,
        name: member.name,
        photo_url: member.photoUrl,
        birth_date: member.birthDate,
        phone: member.phone,
        address: member.address,
        status: member.status,
        monthly_fee: member.monthlyFee,
        medical_notes: member.medicalNotes,
        emergency_info: member.emergencyInfo,
        jeton_id: member.jetonId,
        gender: member.gender
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Erreur Supabase: ${error.message} (Code: ${error.code})`);
    }
    return this.mapMember(data);
  },

  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    const updateData: any = {};
    if (member.membershipNumber) updateData.membership_number = member.membershipNumber;
    if (member.name) updateData.name = member.name;
    if (member.photoUrl !== undefined) updateData.photo_url = member.photoUrl;
    if (member.birthDate) updateData.birth_date = member.birthDate;
    if (member.phone) updateData.phone = member.phone;
    if (member.address) updateData.address = member.address;
    if (member.status) updateData.status = member.status;
    if (member.monthlyFee !== undefined) updateData.monthly_fee = member.monthlyFee;
    if (member.medicalNotes !== undefined) updateData.medical_notes = member.medicalNotes;
    if (member.emergencyInfo !== undefined) updateData.emergency_info = member.emergencyInfo;
    if (member.jetonId !== undefined) updateData.jeton_id = member.jetonId;
    if (member.gender !== undefined) {
      updateData.gender = member.gender;
    }

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
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message.includes('schema cache')) return [];
        throw error;
      }

      return (data || []).map(p => this.mapPayment(p));
    } catch (e) {
      console.error("Failed to load payments:", e);
      return [];
    }
  },

  mapPayment(p: any): Payment {
    return {
      id: p.id,
      memberId: p.member_id,
      amount: p.amount,
      month: p.month,
      year: p.year,
      date: p.date,
      paymentMethod: p.payment_method,
      reference: p.reference || '',
      notes: p.notes || '',
      receiptNumber: p.receipt_number || p.receiptNumber || ''
    };
  },

  async addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const insertData: any = {
      member_id: payment.memberId,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      date: payment.date,
      payment_method: payment.paymentMethod,
    };

    // Only add these if they are likely to exist
    if (payment.receiptNumber) insertData.receipt_number = payment.receiptNumber;
    if (payment.reference !== undefined) insertData.reference = payment.reference;
    if (payment.notes !== undefined) insertData.notes = payment.notes;

    const { data, error } = await supabase
      .from('payments')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return this.mapPayment(data);
  },

  // Sessions
  async getSessions(): Promise<Session[]> {
    try {
      // Try ordering by date first
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        // If 'date' column doesn't exist, try without ordering
        if (error.code === '42703') { 
          console.warn('Column "date" missing in sessions. Falling back to unordered fetch.');
          const { data: data2, error: error2 } = await supabase.from('sessions').select('*');
          if (error2) throw error2;
          return (data2 || []).map(s => this.mapSession(s));
        }
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data || []).map(s => this.mapSession(s));
    } catch (e) {
      console.error("Failed to load sessions:", e);
      return [];
    }
  },

  mapSession(s: any): Session {
    return {
      id: s.id,
      title: s.title || 'Séance sans titre',
      coachId: s.coach_id || s.coachId || '',
      location: s.location || '',
      date: s.date || '',
      time: s.time || s.start_time || '',
      description: s.description || '',
      capacity: s.capacity || 0
    };
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
    return this.mapSession(data);
  },

  async updateSession(id: string, updates: Partial<Omit<Session, 'id'>>): Promise<void> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.coachId !== undefined) updateData.coach_id = updates.coachId;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.capacity !== undefined) updateData.capacity = updates.capacity;

    const { error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*');

      if (error) {
        if (error.code === '42P01' || error.message.includes('schema cache')) {
          console.warn('Coaches table not ready or missing.');
          return [];
        }
        throw error;
      }
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        photoUrl: c.photo_url,
        phone: c.phone,
        email: c.email,
        status: c.status
      }));
    } catch (e) {
      console.error("Failed to load coaches:", e);
      return [];
    }
  },

  async addCoach(coach: Omit<Coach, 'id'>): Promise<Coach> {
    const { data, error } = await supabase
      .from('coaches')
      .insert([{
        name: coach.name,
        photo_url: coach.photoUrl,
        phone: coach.phone,
        email: coach.email,
        status: coach.status
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      photoUrl: data.photo_url,
      phone: data.phone,
      email: data.email,
      status: data.status
    };
  },

  async deleteCoach(id: string): Promise<void> {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateCoach(id: string, updates: Partial<Coach>): Promise<void> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.photoUrl !== undefined) updateData.photo_url = updates.photoUrl;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.email) updateData.email = updates.email;
    if (updates.status) updateData.status = updates.status;

    const { error } = await supabase
      .from('coaches')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message.includes('schema cache')) return [];
        throw error;
      }
      return (data || []).map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
        description: e.description
      }));
    } catch (e) {
      console.error("Failed to load expenses:", e);
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: data.date,
      description: data.description
    };
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
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // Handle case where table is not yet in schema cache or doesn't exist
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('schema cache')) {
          console.warn('Settings table not ready or empty. Using defaults.');
          return null;
        }
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
    } catch (e) {
      console.error("Critical Failure in getSettings:", e);
      return null;
    }
  },

  async updateSettings(settings: Partial<ClubSettings>): Promise<void> {
    const updateData: any = {};
    if (settings.clubName) updateData.club_name = settings.clubName;
    if (settings.clubLogo !== undefined) updateData.club_logo = settings.clubLogo;
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
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message.includes('schema cache')) return [];
        throw error;
      }

      return (data || []).map(a => this.mapAttendance(a));
    } catch (e) {
      console.error("Failed to load attendance:", e);
      return [];
    }
  },

  // Connection Test
  async testConnection(): Promise<boolean> {
    try {
      // Just try to fetch one row from members to see if it works
      const { error } = await supabase.from('members').select('id').limit(1);
      if (error) {
        console.error("Supabase testConnection failed:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Supabase testConnection exception:", e);
      return false;
    }
  },

  mapAttendance(a: any): Attendance {
    return {
      id: a.id,
      memberId: a.member_id,
      date: a.date,
      time: a.time || '',
      sessionId: a.session_id,
      coachId: a.coach_id || '',
      status: a.status
    };
  },

  async recordAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    // Delete any existing attendance record for this member on this date and session
    await supabase
      .from('attendance')
      .delete()
      .eq('member_id', attendance.memberId)
      .eq('date', attendance.date)
      .eq('session_id', attendance.sessionId);

    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        member_id: attendance.memberId,
        date: attendance.date,
        session_id: attendance.sessionId,
        status: attendance.status
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapAttendance(data);
  },

  async clearTodayAttendance(date: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('date', date);

    if (error) throw error;
  }
};
