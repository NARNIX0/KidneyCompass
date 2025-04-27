# Kidney Compass

## Mission
Give UK clinicians and adult patients a one-screen calculator that converts age + sex + ethnicity + serum-creatinine into an MDRD eGFR value and CKD stage, with the option to save or share the result once accounts are enabled.

## Getting Started

### Prerequisites
- Node.js v20 or higher
- npm v9 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/KidneyCompass.git
cd KidneyCompass
npm install
```

### Running the Development Environment

Start the backend server:

```bash
cd backend
npm run dev
```

In a separate terminal, start the frontend server:

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:8080.

## Iteration Plan

| Iteration | Focus | Status |
|-----------|-------|--------|
| 1         | Bootstrap: Project setup, routing, theming, PWA | In Progress |
| 2         | User Input Form: Age, sex, ethnicity, serum-creatinine fields | Planned |
| 3         | eGFR Calculation: Implement MDRD formula, CKD staging | Planned |
| 4         | Data Persistence: Save and load calculations | Planned |
| 5         | Sharing: Export as PDF, email results | Planned |
| 6         | User Accounts: Authentication, saved results | Planned |
| 7         | Optimizations: Performance, accessibility, mobile | Planned |

## Environment Variables

Copy .env.example to .env in both frontend and backend directories and adjust as needed:

```
FRONTEND_URL=http://localhost:5173
BACKEND_PORT=8080
```

## Testing

Run tests for all workspaces:

```bash
npm test --workspaces
```

## License

[MIT](LICENSE)