# Decathlon Bike Assembly Management System - TODO

## Database & Backend Infrastructure
- [x] Design and implement database schema (users, bike_types, orders, invoices, notifications)
- [x] Set up Drizzle ORM migrations
- [x] Create database query helpers in server/db.ts
- [x] Implement tRPC procedures for backend API

## Authentication & Authorization
- [x] Set up role-based access control (manager, mechanic, admin)
- [x] Implement protected procedures for role-specific endpoints
- [ ] Create user profile management system
- [x] Test authentication flow with Manus OAuth

## Branch Manager Dashboard
- [x] Create dashboard layout with sidebar navigation
- [x] Implement bike types management page (add, edit, delete)
- [x] Build new order creation page with bike type selection
- [ ] Integrate barcode scanning for bike identification
- [x] Add order quantity counter
- [x] Implement order submission with unique Order ID generation
- [x] Create orders list page with filtering (pending, in_progress, completed)
- [x] Add order details view
- [x] Build invoices received page with PDF download
- [ ] Implement email sending for orders

## Mechanic Dashboard
- [x] Create mechanic dashboard layout
- [x] Build notifications page with Push Notification display
- [ ] Add order filtering by branch
- [x] Implement order details page with branch manager info
- [ ] Create order execution page with barcode scanning
- [ ] Add automatic bike counter for completed bikes
- [ ] Build invoice creation page with auto-calculated totals
- [ ] Implement invoice PDF generation with professional design
- [x] Add invoice archive/history page
- [ ] Implement invoice search and filtering
- [ ] Add invoice re-sending functionality
- [ ] Create statistics page (monthly total, bike count)

## Barcode Scanning
- [x] Integrate barcode scanning library (ZXing)
- [ ] Support EAN-13 and QR Code formats
- [x] Implement camera access permission handling
- [ ] Add barcode validation and error handling
- [x] Create barcode input UI component

## PDF Generation & Invoices
- [x] Design professional invoice template
- [x] Implement PDF generation for invoices
- [x] Add company logo (d inside circle)
- [x] Include SIRET number and company details
- [ ] Add payment method field
- [x] Implement invoice number auto-generation
- [x] Add invoice date and mechanic name
- [x] Create itemized table with bike types, quantities, and prices
- [x] Calculate totals automatically

## Push Notifications
- [ ] Set up notification system for branch managers
- [ ] Set up notification system for mechanic
- [ ] Implement order submission notifications
- [ ] Implement invoice completion notifications
- [x] Create notification storage in database
- [x] Build notification UI component

## Email Integration
- [ ] Set up email service integration
- [ ] Create email templates for order submission
- [ ] Create email templates for invoice delivery
- [ ] Implement automatic email sending on order creation
- [ ] Implement automatic email sending on invoice completion
- [ ] Add email sending for invoice re-submission

## PWA Features
- [ ] Configure PWA manifest (manifest.json)
- [ ] Implement service worker for offline support
- [ ] Add offline data synchronization
- [ ] Implement app installation prompts
- [ ] Add splash screens for mobile
- [ ] Configure app icons

## UI/UX & Design
- [x] Implement Material Design 3 styling
- [x] Set up Tailwind CSS with Decathlon blue (#00D9FF)
- [x] Create responsive layouts for all screen sizes
- [x] Implement French language support (i18n)
- [x] Add loading states and skeletons
- [x] Create error handling UI
- [x] Add empty states for lists
- [x] Implement form validation

## Testing & Quality Assurance
- [ ] Test authentication flow
- [ ] Test order creation and submission
- [ ] Test barcode scanning functionality
- [ ] Test invoice generation and PDF output
- [ ] Test email delivery
- [ ] Test push notifications
- [ ] Test offline functionality
- [ ] Test responsive design on multiple devices
- [ ] Performance testing and optimization

## Deployment & Documentation
- [ ] Create project checkpoint
- [ ] Document API endpoints
- [ ] Create user guide for branch managers
- [ ] Create user guide for mechanic
- [ ] Set up monitoring and logging
- [ ] Prepare for production deployment


## User Profile Management (NEW)
- [x] Create user profile page with edit functionality
- [ ] Implement profile update mutation in tRPC
- [x] Add form validation for profile fields
- [x] Add profile picture/avatar support
- [ ] Implement password change functionality
- [x] Add profile access control (users can only edit their own profile)


## Barcode Scanner Integration (COMPLETED)
- [x] Integrate BarcodeScanner component into NewOrder page
- [x] Integrate BarcodeScanner component into OrderExecution page
- [x] Add barcode validation and error handling
- [x] Implement barcode duplicate detection
- [x] Add visual feedback for successful scans
- [x] Create barcode history/list display
- [x] Add manual barcode input fallback


## Login Pages Design (COMPLETED)
- [x] Design professional login page layout with Decathlon branding
- [x] Create mechanic login page with role-specific messaging
- [x] Create branch manager login page with role-specific messaging
- [ ] Implement multi-language support (French/Arabic)
- [x] Add OAuth integration for secure authentication
- [x] Create role-based redirect after login
- [x] Add loading states and error handling
- [x] Implement responsive design for mobile and desktop
- [x] Add animations and micro-interactions
- [x] Fix missing useAuth imports in login pages


## Analytics Dashboard (COMPLETED)
- [x] Create analytics data aggregation functions in server/db.ts
- [x] Add analytics tRPC procedures for fetching statistics
- [x] Design analytics dashboard layout with key metrics
- [x] Implement order statistics (total, pending, completed)
- [x] Implement revenue statistics and calculations
- [x] Implement average assembly time tracking
- [x] Create charts and graphs using Recharts or Chart.js
- [ ] Add date range filtering for analytics
- [x] Create role-specific analytics views (manager vs mechanic)
- [ ] Add export functionality for analytics reports


## Bug Fixes
- [x] Fixed missing useAuth imports in MechanicLogin and ManagerLogin pages
- [x] Fixed duplicate import statements

## Push Notifications System (COMPLETED)
- [x] Create Service Worker for handling push notifications
- [x] Implement push subscription management in database
- [x] Add push notification API endpoints in tRPC
- [x] Create notification UI component for displaying push notifications
- [x] Implement notification permission request flow
- [x] Add notification badge counter
- [ ] Integrate push notifications with order status changes
- [ ] Add notification sound and vibration support
- [x] Create notification history/archive
- [ ] Add notification preferences/settings


## Critical Issues to Fix
- [ ] Create proper login pages that are actually accessible (not just redirects)
- [ ] Implement separate user profiles for managers and mechanics with different fields
- [ ] Manager profile should include: branch_name, manager_name, email, phone, address
- [ ] Mechanic profile should include: name, SIRET, email, phone, company_info
- [ ] Fix authentication flow to properly redirect after login
- [ ] Ensure login pages are not redirecting to 404


## Export Functionality (IN PROGRESS)
- [ ] Create export utility functions for PDF and CSV generation
- [ ] Add analytics export endpoints in tRPC (PDF and CSV)
- [ ] Add invoice history export endpoints in tRPC (PDF and CSV)
- [ ] Create date range filtering for exports
- [ ] Implement PDF export with professional formatting and logos
- [ ] Implement CSV export with proper data formatting
- [ ] Add export buttons to Analytics page
- [ ] Add export buttons to Invoices page
- [ ] Test export functionality with various data sets
