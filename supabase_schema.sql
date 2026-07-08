-- 1. Create Tables (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    gender TEXT,
    birth_date DATE,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active',
    monthly_fee INTEGER DEFAULT 3000,
    notes TEXT,
    medical_notes TEXT,
    emergency_info TEXT,
    jeton_id TEXT,
    blood_type TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    club_name TEXT DEFAULT 'Bijoux d''Oran',
    club_logo TEXT,
    default_monthly_fee INTEGER DEFAULT 3000,
    currency TEXT DEFAULT 'DZD',
    language TEXT DEFAULT 'fr',
    theme TEXT DEFAULT 'light',
    coach_username TEXT DEFAULT 'coach',
    coach_password TEXT DEFAULT 'password',
    coach_name TEXT DEFAULT 'Coach Bidjou',
    coach_photo TEXT,
    require_coach_password BOOLEAN DEFAULT FALSE,
    CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    time TIME DEFAULT CURRENT_TIME,
    session_id TEXT,
    coach_id TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount INTEGER,
    month TEXT,
    year INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT,
    receipt_number TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    amount INTEGER,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT
);

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

-- 2. Initialize Settings if empty
INSERT INTO settings (id, club_name, coach_username, coach_password)
VALUES (1, 'Bijoux d''Oran', 'coach', 'password')
ON CONFLICT (id) DO NOTHING;

-- 3. ENABLE PERMISSIONS (Crucial step)
-- This allows the application to interact with the tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create "Allow All" policies (Public access for this specific project setup)
-- We drop them first to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow All Access" ON members;
DROP POLICY IF EXISTS "Allow All" ON members;
CREATE POLICY "Allow All Access" ON members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON settings;
DROP POLICY IF EXISTS "Allow All" ON settings;
CREATE POLICY "Allow All Access" ON settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON attendance;
DROP POLICY IF EXISTS "Allow All" ON attendance;
CREATE POLICY "Allow All Access" ON attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON payments;
DROP POLICY IF EXISTS "Allow All" ON payments;
CREATE POLICY "Allow All Access" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON expenses;
DROP POLICY IF EXISTS "Allow All" ON expenses;
CREATE POLICY "Allow All Access" ON expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON sessions;
DROP POLICY IF EXISTS "Allow All" ON sessions;
CREATE POLICY "Allow All Access" ON sessions FOR ALL USING (true) WITH CHECK (true);
