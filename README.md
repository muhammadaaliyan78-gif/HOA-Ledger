# AccuLedger — Accounting Voucher & Ledger Management System

A complete, real-time, web-based accounting system: Chart of Accounts → Vouchers (PV/RV/BV/JV) → automatic Ledger posting → Reports → Excel Import/Export. Built with **React + Vite + Tailwind** on the front and **Express + SQLite** on the back, with **Server-Sent Events** pushing every change to all open screens instantly (no refresh needed).

## ✨ Features

- **Head of Account** — 3-level structure (Category → Group → Account), 20 pre-loaded default accounts, auto-suggested codes with gap filling, duplicate-code blocking, tree & table views, search/filters/sort, live balances, soft-delete protection for accounts with transactions, Excel import with preview/error report + blank template, Excel export.
- **Vouchers** — Payment, Receipt, Bill, Journal — all on one shared format. Auto-numbering per type (PV-0001…), balanced Debit/Credit enforcement, amount validation, negative-amount blocking, future-date warning, inline multi-row entry with keyboard support (Enter = new row), quick "+ Add new account" for parties right from the voucher screen, edit/delete with confirm + audit log, filters (type/date range/party/amount range), search, sortable columns, Excel/CSV import & export.
- **Ledger** — auto-posted from every voucher, running balance, opening/closing totals, account-wise selection, date/type/search filters, click a voucher number to open the original voucher, styled Excel download, print/PDF view.
- **Real-time** — SQLite + SSE; every mutation broadcasts to all connected screens within milliseconds.
- **Dashboard** — total debit/credit, cash & bank balances, receivables/payables, monthly Receipts-vs-Payments chart, recent vouchers, per-type voucher summary.
- **Reports** — Trial Balance (with balance check) and Day Book; both printable and Excel-exportable.
- **Users & Roles** — Admin / Accountant / Viewer with server-side enforcement, JWT auth, password change.
- **Extras** — print voucher with company header & signature lines, company settings (name, logo, FY, currency), recycle bin (undo delete / restore / purge), full audit log with Excel export, JSON + SQLite backups, light/dark mode, English/اردو (RTL) toggle, PKR formatting, keyboard shortcuts (Ctrl+S save, Ctrl+N new), toasts, skeletons, empty states.

## 🚀 Quick Start

```bash
npm install
npm run dev        # starts API on :4000 + UI on :5173 (opens automatically)
```

Open **http://localhost:5173** and log in:

| Role       | Email                | Password  |
| ---------- | -------------------- | --------- |
| Admin      | admin@demo.pk        | demo123   |
| Accountant | accountant@demo.pk   | demo123   |
| Viewer     | viewer@demo.pk       | demo123   |

Production mode:

```bash
npm run build
npm start          # serves API + built UI on http://localhost:4000
```

> The database file lives in `data/ledger.db` and is created and seeded automatically on first boot (default chart of accounts, 3 users, company settings, 15 demo vouchers). Delete the `data/` folder to reset to a fresh demo.

## 🗂 Project Structure

```
├── server/               # Express backend (TypeScript, tsx runtime)
│   ├── index.ts          # App entry, SSE endpoint, static SPA serving
│   ├── db.ts             # SQLite schema, migrations, seed, settings, helpers
│   ├── auth.ts           # JWT login, role middleware, password handling
│   ├── realtime.ts       # Server-Sent Events hub (broadcast to all clients)
│   ├── routes.ts         # All REST endpoints
│   └── excel.ts          # ExcelJS exports, templates, import parsing
├── shared/
│   └── types.ts          # Domain types & constants shared by server + client
├── src/                  # React SPA
│   ├── components/       # Layout (sidebar/topbar), UI kit, AccountPicker
│   ├── providers/        # Auth, Theme (dark/light), Toast, i18n (EN/UR)
│   ├── lib/              # API client, realtime subscribe, formatters
│   └── pages/            # Login, Dashboard, Accounts, Vouchers, VoucherForm,
│                         # VoucherView, VoucherPrint, Ledger, Reports,
│                         # ImportExport, Settings, RecycleBin, AuditLog
└── data/                 # ledger.db (created at runtime)
```

## 🗄 Database Schema

| Table            | Purpose                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| `users`          | Login accounts with role (`admin` / `accountant` / `viewer`)                  |
| `settings`       | Single row: company name, address, logo, currency, financial year            |
| `account_groups` | Group level (e.g. Current Assets), unique per category                       |
| `accounts`       | Chart of accounts: unique code, name, category, group, opening balance/side, status, party flag |
| `vouchers`       | Header: auto voucher_no, type (PV/RV/BV/JV), date, party, amount, narration, status (Active/Deleted), audit fields |
| `voucher_lines`  | Lines: account, debit, credit, particulars, ordering                         |
| `ledger_entries` | Auto-posted rows (voucher_id, account, debit, credit, date) — the ledger is never entered manually |
| `audit_logs`     | Who changed what, and when (CREATE/UPDATE/DELETE/RESTORE/IMPORT/…)            |

**Accounting rules baked in:** Assets & Expenses have a Debit normal balance; Liabilities, Capital & Income have a Credit normal balance. Every voucher must balance (Σ Debit = Σ Credit). Balances are computed as `opening (signed) + Σdebits − Σcredits`.

## 🔌 API Overview (all under `/api`, JWT Bearer auth)

```
POST /auth/login            GET  /auth/me              POST /auth/change-password
GET  /accounts              POST /accounts             PUT  /accounts/:id     DELETE /accounts/:id
GET  /accounts/next-code    GET  /groups               POST /groups
GET  /vouchers              GET  /vouchers/:id         POST /vouchers        PUT /vouchers/:id
DELETE /vouchers/:id        POST /vouchers/:id/restore DELETE /vouchers/:id/purge
GET  /ledger                GET  /dashboard
GET  /reports/trial-balance GET  /reports/day-book     GET  /search
POST /import/accounts/preview|confirm                 POST /import/vouchers/preview|confirm
GET  /export/accounts|vouchers|ledger|trial-balance|audit|*-template
GET  /backup                GET  /backup/sqlite
GET  /users                 POST /users                PUT  /users/:id/role
GET  /settings              PUT  /settings             GET  /audit
GET  /events                (Server-Sent Events stream — the realtime layer)
```

## ⌨️ Tips

- In the voucher form press **Enter** in an amount cell to add a new row; **Tab** moves between cells; **Ctrl+S** saves; **Ctrl+N** starts a new voucher.
- While choosing a Party, type a name that doesn't exist and pick **“＋ Add new account”** to create it without leaving the screen.
- Open the app in two browser windows — create a voucher in one and watch the other update instantly.
- Use Settings → users to add your team; Viewers get read-only everywhere (enforced server-side too).
- Backups: Import/Export page (Admin) offers a full JSON dump and the raw SQLite file.
