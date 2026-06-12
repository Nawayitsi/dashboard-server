# PRD.md

## PROJECT

HomelabOS

A modern self-hosted infrastructure management platform that acts as a single pane of glass for managing all homelab services from one centralized dashboard.

The platform combines the simplicity of CasaOS with the premium experience of macOS and modern SaaS dashboards.

---

# OBJECTIVE

Build a centralized dashboard that integrates multiple infrastructure services including:

* MikroTik RouterOS
* Nginx Proxy Manager
* Nextcloud
* Synology NAS
* LibreNMS
* SafeLine WAF
* SIEM Platform

The system must provide:

* Monitoring
* Service Management
* Security Visibility
* Storage Visibility
* Network Visibility
* Application Launcher

Everything should be accessible from a single dashboard.

---

# TECH STACK

## Frontend

* React 19
* Vite
* TypeScript
* TailwindCSS v4
* Shadcn UI
* Framer Motion
* TanStack Query
* React Router DOM
* Recharts
* Lucide React
* Zustand

---

## Backend

* Node.js LTS
* Express.js
* TypeScript

Architecture:

* Modular
* Service Based
* Clean Architecture

---

## Database

MySQL 8

ORM:

* Prisma ORM

---

## Cache

Redis

---

## Realtime

Socket.IO

Used for:

* Live Monitoring
* Notifications
* Status Updates
* Metrics Streaming

---

## Authentication

JWT

Features:

* Access Token
* Refresh Token
* RBAC

Roles:

* Admin
* Viewer

---

## Deployment

Docker First

Services:

* Frontend
* Backend
* MySQL
* Redis

Provide:

* Dockerfile
* docker-compose.yml

---

# UI DESIGN

Design Inspiration:

* CasaOS
* macOS Sequoia
* Synology DSM
* Proxmox
* Linear

Style:

* Glassmorphism
* Dark Mode First
* Floating Components
* Smooth Animations

Avoid:

* Bootstrap Look
* Material Design
* AdminLTE
* Generic Dashboard Templates

---

# COLOR SYSTEM

Background:

#0B0D10

Card:

rgba(255,255,255,0.08)

Border:

rgba(255,255,255,0.10)

Primary:

#4F8CFF

Secondary:

#7A5CFF

Success:

#22C55E

Warning:

#F59E0B

Danger:

#EF4444

---

# APPLICATION MODULES

## Dashboard

Global Overview

Widgets:

* Server Uptime
* CPU Usage
* RAM Usage
* Disk Usage
* Network Throughput
* Active Services
* Active Alerts

---

## Applications

Application Launcher

Display:

* App Icon
* Status
* Quick Launch
* Health Indicator

---

## Monitoring

Metrics:

* CPU
* Memory
* Disk
* Network
* Service Health

Charts:

* Realtime
* Historical

---

## Infrastructure

Display:

* Servers
* Network Devices
* Storage Devices

Topology View:

Internet
→ MikroTik
→ Switch
→ Servers
→ Applications

---

## Security

Display:

* SafeLine Events
* SIEM Events
* Threat Counts
* Blocked Requests
* Active Incidents

---

## Storage

Display:

* Synology Status
* Capacity
* RAID Health
* Backup Health

---

## Logs

Centralized Logs

Sources:

* MikroTik
* SafeLine
* SIEM
* Backend

---

## Settings

System Configuration

Features:

* Integrations
* User Management
* API Keys
* Notifications

---

# SERVICE INTEGRATIONS

Create modular integration architecture.

Each integration should contain:

* Connector
* Service
* DTO
* API Client

Folder Example:

backend/src/integrations/

mikrotik/
nextcloud/
synology/
librenms/
safeline/
siem/

Future integrations must be pluggable.

---

# DATABASE TABLES

users

roles

permissions

services

service_status

metrics

alerts

logs

notifications

settings

integrations

audit_logs

---

# API STRUCTURE

/api/auth

/api/users

/api/dashboard

/api/services

/api/metrics

/api/alerts

/api/logs

/api/notifications

/api/settings

/api/integrations

---

# DASHBOARD REQUIREMENTS

Load Time:

< 2 seconds

Realtime Update:

Every 5 seconds

Websocket Push:

Instant

Responsive:

Desktop
Tablet
Mobile

---

# SECURITY REQUIREMENTS

JWT Authentication

Password Hash:

bcrypt

Rate Limiting

Helmet

CORS

Input Validation

Audit Logging

RBAC

---

# FOLDER STRUCTURE

frontend/

src/

components/

pages/

layouts/

hooks/

services/

store/

types/

utils/

backend/

src/

modules/

integrations/

middleware/

services/

database/

socket/

config/

prisma/

---

# DELIVERABLES

Generate:

1. Complete Frontend
2. Complete Backend
3. Prisma Schema
4. Database Migration
5. API Documentation
6. Docker Configuration
7. Environment Files
8. README.md
9. Installation Guide
10. Production Deployment Guide

Code must be production ready.

No mock dashboard.

Create actual architecture for future integrations.
