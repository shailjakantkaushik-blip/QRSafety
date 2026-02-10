-- Migration: Add read field to notifications table
ALTER TABLE public.notifications
ADD COLUMN read boolean NOT NULL DEFAULT false;
