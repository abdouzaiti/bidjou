-- SQL Schema for Bijoux d'Oran Sport Club
-- Tables: members, payments, sessions, coaches, expenses, attendance, settings, activity_logs

-- 1. Members
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    birth_date DATE,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('Active', 'Suspended', 'Inactive')) DEFAULT 'Active',
    monthly_fee INTEGER DEFAULT 3000,
    notes TEXT,
    medical_notes TEXT,
    emergency_info TEXT,
    jeton_id TEXT,
    blood_type TEXT
);

-- 2. Coaches
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    experience TEXT,
    status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active'
);

-- 3. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    coach_id TEXT,
    location TEXT,
    date DATE DEFAULT CURRENT_DATE,
    time TIME,
    description TEXT,
    capacity INTEGER
);

-- 4. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer')),
    reference TEXT,
    notes TEXT,
    receipt_number TEXT UNIQUE
);

-- 5. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    time TIME DEFAULT CURRENT_TIME,
    session_id TEXT,
    coach_id TEXT,
    status TEXT CHECK (status IN ('Present', 'Absent', 'Late'))
);

-- 6. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT CHECK (category IN ('Equipment', 'Transport', 'Water', 'Competition', 'Maintenance', 'Rent', 'Other')),
    date DATE DEFAULT CURRENT_DATE,
    description TEXT
);

-- 7. Settings
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    club_name TEXT DEFAULT 'Bijoux d''Oran Sport Club',
    club_logo TEXT,
    default_monthly_fee INTEGER DEFAULT 3000,
    currency TEXT DEFAULT 'DZD',
    language TEXT DEFAULT 'fr',
    theme TEXT DEFAULT 'light',
    coach_username TEXT DEFAULT 'coach',
    coach_password TEXT DEFAULT 'password',
    coach_name TEXT DEFAULT 'Coach Bidjou',
    coach_photo TEXT,
    require_coach_password BOOLEAN DEFAULT false
);

-- Initialize settings
INSERT INTO settings (id, club_name) 
VALUES (1, 'Bijoux d''Oran Sport Club') 
ON CONFLICT (id) DO NOTHING;

-- 8. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role TEXT,
    user_name TEXT,
    action TEXT,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
