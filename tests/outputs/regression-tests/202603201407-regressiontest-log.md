# Regression Test - 202603201407

**Date**: March 20, 2026 14:07
**Branch**: main
**Test Type**: Comprehensive Regression Testing
**Status**: ✅ **COMPLETED**

## Executive Summary

This regression test validates the entire application functionality. The test session required resolving a **local Supabase setup issue** before functional testing could begin: the wrong Supabase project (`_user`) was running instead of `_uy-kape`, and the `.env` file had an incorrect key format (`sb_publishable_...` instead of the JWT anon key). After resolving these, **all automated tests passed** and full functional testing confirmed the app is working correctly on both desktop and mobile.

### Quick Status Overview

- [x] Unit Tests — **870/870 PASSED**
- [x] Linting Checks — **0 warnings/errors**
- [x] Playwright E2E Tests — **114 passed, 8 skipped (expected)**
- [x] Functional Testing - Desktop (1920x1080) — **PASSED**
- [x] Functional Testing - Mobile (375px width) — **PASSED**

---

## Pre-Test Setup (Issues Resolved)

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | Stopped wrong Supabase `_user` instance (started from wrong directory in admin shell) | ✅ |
| 2 | Started correct `uy-kape` Supabase instance from project dir | ✅ |
| 3 | Applied migration `20250824143027_initial_schema.sql` | ✅ |
| 4 | Seeded database via psql pipe (`supabase/seed.sql`) | ✅ |
| 5 | Fixed `.env`: reverted `VITE_SUPABASE_ANON_KEY` from `sb_publishable_...` to correct JWT anon key | ✅ |

---

## Detailed Test Results

### 1. Unit Tests

**Status**: ✅ **PASSED**
**Command**: `npm run test:local-db -- --run`
**Duration**: 50.89s

- **870/870 tests PASSED** across 55 test files
- Strategy: Local DB (real Supabase instance)

### 2. Linting

**Status**: ✅ **PASSED**
**Command**: `npm run lint`

- 0 errors, 0 warnings (threshold: 5 max warnings)

### 3. Playwright E2E Tests

**Status**: ✅ **PASSED**
**Command**: `npx playwright test --reporter=line`
**Duration**: ~3.1 min

- **114 passed** (previously 95 passed / 19 failed — all failures were due to `.env` key bug)
- **8 skipped** (expected — feature-flagged tests)
- 0 failures

### 4. Functional Testing - Desktop (1920x1080)

**Status**: ✅ **PASSED**

#### Home Page

- ✅ Logo, heading, tagline render correctly
- ✅ Order Here and Barista Administration links present

#### Guest Ordering Workflow

- ✅ Step 1 (Drink Selection): All 19 drinks loaded across 5 tabs (All, Coffee, Special Coffee, Tea, Kids Drinks)
- ✅ Step 2 (Customization): Options render correctly for Caffe Latte (Number of Shots, Milk Type, Temperature)
- ✅ Step 3 (Guest Info): Auto-generated name shown ("Ultra Foam"), character counters present
- ✅ Step 4 (Order Review): Summary shows correct drink, customizations, and name
- ✅ Order submission: Order confirmed with Order ID, Queue #1, 4 min wait, live updates active

#### Admin Module

- ✅ Password authentication works
- ✅ Dashboard shows all three system statuses as Active
- ✅ Order Management: Order from Ultra Foam visible with all details (Caffe Latte, Oatmilk, Cold, Single, Queue #1)
- ✅ Complete order action: Pending count goes from 1→0, Completed count goes from 0→1
- ✅ Menu Management: All 4 categories, 19 drinks, category filter, grid/list toggle present
- ✅ Drinks tab: All drinks with Edit/Delete/Options buttons

### 5. Functional Testing - Mobile (375px width)

**Status**: ✅ **PASSED**

- ✅ Home page renders cleanly on 375x812
- ✅ Order page: Category tabs visible and scrollable, all 19 drinks accessible
- ✅ Single-column drink card layout correct

---

## Issues Found

| # | Module | Issue | Severity | Status |
| - | ------ | ----- | -------- | ------ |
| 1 | Setup | Wrong Supabase instance running (`_user` project instead of `_uy-kape`) — started from admin shell in wrong dir | High | ✅ Fixed (stopped wrong instance, started correct one) |
| 2 | Setup | `.env` had `VITE_SUPABASE_ANON_KEY=sb_publishable_...` (new CLI format) but the old `_uy-kape` container expects JWT format | High | ✅ Fixed (reverted to JWT key) |
| 3 | Setup | DB schema not applied — `supabase_rest` reported "0 Relations" | High | ✅ Fixed (ran `supabase migration up` + seeded via psql) |
