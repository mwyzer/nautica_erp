-- ==============================================================================
-- NAUTICAL ERP AUTOMATION - POSTGRESQL DDL SCHEMA
-- Domain: Maritime Fleet, Voyage Operations, STCW Compliance & AI Clearance
-- ==============================================================================

-- Drop tables if needed in reverse dependency order
DROP TABLE IF EXISTS ai_clearance_audits CASCADE;
DROP TABLE IF EXISTS maintenance_tickets CASCADE;
DROP TABLE IF EXISTS bunker_logs CASCADE;
DROP TABLE IF EXISTS crew_certifications CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS voyages CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;

-- 1. VESSELS (ARMADA KAPAL)
CREATE TABLE vessels (
    id SERIAL PRIMARY KEY,
    imo_number VARCHAR(10) UNIQUE NOT NULL,      -- IMO e.g. 'IMO9812345'
    name VARCHAR(100) NOT NULL,                  -- e.g. 'MV Nusantara Pioneer'
    vessel_type VARCHAR(50) NOT NULL,            -- CONTAINER, BULK_CARRIER, TANKER, TUG_BOAT
    dwt DOUBLE PRECISION NOT NULL,               -- Deadweight tonnage (MT)
    flag_state VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',-- ACTIVE, IN_TRANSIT, MOORED, IN_MAINTENANCE
    current_port VARCHAR(50) NOT NULL DEFAULT 'IDJKT',
    avg_speed_knots DOUBLE PRECISION DEFAULT 14.5,
    fuel_burn_rate_mt_per_day DOUBLE PRECISION DEFAULT 22.0, -- Fuel consumed per 24 hours at cruising speed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_status ON vessels(status);

-- 2. CREW MEMBERS (AWAK KAPAL & SEAFARERS)
CREATE TABLE crew_members (
    id SERIAL PRIMARY KEY,
    seafarer_id VARCHAR(50) UNIQUE NOT NULL,    -- Maritime Book / SID e.g. 'SID-ID-8821'
    full_name VARCHAR(100) NOT NULL,
    rank VARCHAR(50) NOT NULL,                   -- MASTER, CHIEF_ENGINEER, CHIEF_OFFICER, 2ND_ENGINEER, ABLE_SEAMAN
    assigned_vessel_id INT REFERENCES vessels(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ON_BOARD', -- ON_BOARD, ON_SHORE, ON_LEAVE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crew_vessel ON crew_members(assigned_vessel_id);

-- 3. CREW CERTIFICATIONS (STCW COMPLIANCE)
CREATE TABLE crew_certifications (
    id SERIAL PRIMARY KEY,
    crew_id INT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    cert_type VARCHAR(100) NOT NULL,             -- STCW_COC, GMDSS, BST, MEDICAL_FITNESS, RADAR_ARPA
    cert_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cert_crew ON crew_certifications(crew_id);
CREATE INDEX idx_cert_expiry ON crew_certifications(expiry_date);

-- 4. VOYAGES (PELAYARAN & DISPATCH)
CREATE TABLE voyages (
    id SERIAL PRIMARY KEY,
    voyage_number VARCHAR(50) UNIQUE NOT NULL,  -- e.g. 'VOY-2026-JKT-SGSIN-001'
    vessel_id INT NOT NULL REFERENCES vessels(id) ON DELETE RESTRICT,
    origin_port VARCHAR(10) NOT NULL,            -- UN/LOCODE e.g. 'IDJKT' (Tanjung Priok)
    destination_port VARCHAR(10) NOT NULL,       -- UN/LOCODE e.g. 'SGSIN' (Singapore Port)
    distance_nm DOUBLE PRECISION NOT NULL,       -- Nautical Miles (e.g. 525 NM)
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    cargo_type VARCHAR(100) NOT NULL,            -- Containers, Crude Oil, Palm Oil, Coal
    cargo_weight_mt DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED', -- PLANNED, CLEARED, IN_PROGRESS, COMPLETED, CANCELLED
    clearance_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    clearance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voyages_vessel ON voyages(vessel_id);
CREATE INDEX idx_voyages_status ON voyages(status);

-- 5. BUNKER LOGS & NOON REPORTS (PEMANTAUAN BAHAN BAKAR)
CREATE TABLE bunker_logs (
    id SERIAL PRIMARY KEY,
    vessel_id INT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    voyage_id INT REFERENCES voyages(id) ON DELETE SET NULL,
    fuel_type VARCHAR(30) NOT NULL DEFAULT 'VLSFO', -- VLSFO, MGO, LNG
    current_rob_mt DOUBLE PRECISION NOT NULL,       -- Remaining On Board (Metric Tons)
    daily_consumption_mt DOUBLE PRECISION DEFAULT 0.0,
    speed_knots DOUBLE PRECISION DEFAULT 0.0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    anomaly_reason VARCHAR(255)
);

CREATE INDEX idx_bunker_vessel ON bunker_logs(vessel_id);

-- 6. MAINTENANCE TICKETS (PLANNED MAINTENANCE SYSTEM / DEFECT LOG)
CREATE TABLE maintenance_tickets (
    id SERIAL PRIMARY KEY,
    vessel_id INT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    equipment_name VARCHAR(100) NOT NULL,       -- 'Main Engine Turbocharger', 'Emergency Generator', 'ECDIS'
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',    -- OPEN, IN_PROGRESS, RESOLVED
    description TEXT NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    prevents_clearance BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_maint_vessel ON maintenance_tickets(vessel_id);
CREATE INDEX idx_maint_severity ON maintenance_tickets(severity);

-- 7. AI CLEARANCE AUDITS (HASIL AUDIT OTOMATIS OLEH AI AGENT)
CREATE TABLE ai_clearance_audits (
    id SERIAL PRIMARY KEY,
    voyage_id INT NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
    decision VARCHAR(30) NOT NULL,               -- APPROVED, REJECTED, CONDITIONAL
    fuel_sufficiency_score DOUBLE PRECISION NOT NULL, -- e.g. 1.25 (125% of required burn)
    crew_compliance_status VARCHAR(30) NOT NULL, -- COMPLIANT, EXPIRED_CERTS_DETECTED, MISSING_ROLES
    maintenance_risk_status VARCHAR(30) NOT NULL,-- CLEAR, CRITICAL_DEFECT_DETECTED
    ai_summary TEXT NOT NULL,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    audited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_audits_voyage ON ai_clearance_audits(voyage_id);
