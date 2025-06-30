-- Add missing enum types

-- Platform role enum for admin access levels
CREATE TYPE platform_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');

-- Task assignment status enum
CREATE TYPE task_assignment_status AS ENUM ('claimed', 'submitted', 'completed', 'rejected', 'cancelled');

-- Cooperation mode enum for tasks
CREATE TYPE cooperation_mode AS ENUM ('solo', 'simultaneous', 'sequential', 'pooled');

-- Add enum columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform_role platform_role DEFAULT 'user';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cooperation_mode cooperation_mode DEFAULT 'solo';