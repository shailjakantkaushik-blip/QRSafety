-- Migration: Create notification_reads table for per-guardian read tracking
CREATE TABLE public.notification_reads (
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  PRIMARY KEY (notification_id, guardian_id)
);
