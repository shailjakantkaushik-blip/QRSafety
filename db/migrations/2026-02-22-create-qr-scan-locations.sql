-- Migration: Create qr_scan_locations table to store QR scan events with location
create table qr_scan_locations (
  id uuid primary key default gen_random_uuid(),
  individual_id uuid references individuals(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  accuracy double precision,
  city text,
  region text,
  country text,
  created_at timestamptz not null default now()
);
