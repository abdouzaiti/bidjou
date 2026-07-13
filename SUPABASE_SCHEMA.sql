-- SUPABASE SQL SCHEMA FOR BENTO DOJO
-- Copy and paste this into the Supabase SQL Editor

-- 1. Create Tables

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number TEXT UNIQUE,
    name TEXT NOT NULL,
    photo_url TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    birth_date DATE,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Inactive')),
    monthly_fee NUMERIC DEFAULT 0,
    notes TEXT,
    medical_notes TEXT,
    emergency_info TEXT,
    jeton_id TEXT,
    blood_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Coaches Table
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    experience TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    location TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('Present', 'Absent', 'Late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer')),
    reference TEXT,
    notes TEXT,
    receipt_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT CHECK (category IN ('Equipment', 'Transport', 'Water', 'Competition', 'Maintenance', 'Rent', 'Other')),
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT CHECK (type IN ('Alert', 'Reminder', 'Announcement', 'Birthday')),
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Settings Table (Single Row)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    club_name TEXT DEFAULT 'Bento Dojo',
    club_logo TEXT,
    default_monthly_fee NUMERIC DEFAULT 3000,
    currency TEXT DEFAULT 'DZD',
    language TEXT DEFAULT 'fr',
    theme TEXT DEFAULT 'light',
    coach_username TEXT DEFAULT 'coach',
    coach_password TEXT DEFAULT 'password',
    coach_name TEXT DEFAULT 'Coach Principal',
    coach_photo TEXT,
    require_coach_password BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role TEXT,
    user_name TEXT,
    action TEXT,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Insert Initial Settings
INSERT INTO settings (id, club_name, default_monthly_fee, currency, language, theme)
VALUES (1, 'Bento Dojo', 3000, 'DZD', 'fr', 'light')
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS) - Optional but recommended
-- For simplicity in this demo, we can start with RLS disabled or with broad policies
-- To enable RLS and add policies:
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access" ON members FOR ALL USING (true);
-- (Repeat for other tables)

-- 4. Schema Migrations (Fix missing columns)
-- Run this if you already have the tables but see errors about missing columns
DO $$ 
BEGIN 
    -- Add gender to members if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='gender') THEN
        ALTER TABLE members ADD COLUMN gender TEXT;
    END IF;

    -- Add missing session columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='description') THEN
        ALTER TABLE sessions ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='time') THEN
        ALTER TABLE sessions ADD COLUMN time TIME;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='location') THEN
        ALTER TABLE sessions ADD COLUMN location TEXT DEFAULT 'Dojo Central';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='capacity') THEN
        ALTER TABLE sessions ADD COLUMN capacity INTEGER DEFAULT 20;
    END IF;

    -- Add missing payment columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='reference') THEN
        ALTER TABLE payments ADD COLUMN reference TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='notes') THEN
        ALTER TABLE payments ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='receipt_number') THEN
        ALTER TABLE payments ADD COLUMN receipt_number TEXT;
    END IF;

    -- Refresh schema cache
    EXECUTE 'NOTIFY pgrst, ''reload schema''';
END $$;
