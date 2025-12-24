# DollarPe P2P Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Database Setup**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Platform**
   - Main page: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## Features Overview

### 🤖 Browser Automation
- Real-time monitoring of Binance P2P interface
- Automated detection of orders, messages, and documents
- RDP/VM integration for secure browser access
- **IMPORTANT**: All message sending is manual - no automated replies

### 🔍 KYC & Risk Assessment
- OCR processing for identity documents
- Comprehensive risk scoring algorithm
- Automated approval/rejection recommendations
- Sanctions list screening
- Document authenticity validation

### 💬 Smart Reply System
- AI-powered reply generation
- Context-aware responses
- Operator review workflow
- Manual send approval required

### 📊 Dashboard & Monitoring
- Real-time order tracking
- Risk alerts and notifications
- Operator workload management
- Comprehensive audit trails

## API Endpoints

- `GET /api/orders` - List all orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/risk/assess` - Assess order risk
- `POST /api/kyc/verify` - Verify identity
- `POST /api/documents/process` - Process documents

## Database Schema

The platform uses a comprehensive PostgreSQL schema with:
- P2P order management
- Document processing and OCR
- KYC verification workflows
- Risk assessment tracking
- Audit logging
- Operator management

## Security & Compliance

- All operations are logged for audit purposes
- No automated message sending (manual approval required)
- Comprehensive risk assessment before any approvals
- Document encryption and secure storage
- Role-based access control

## Production Deployment

1. Set up Supabase project
2. Configure environment variables
3. Deploy to Vercel/Netlify
4. Set up RDP/VM infrastructure for browser automation
5. Configure monitoring and alerting

## Support

For technical support or questions about the platform, please refer to the documentation or contact the development team.