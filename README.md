# Aapka Aarogya Kosh

A secure Progressive Web App (PWA) for users to upload, organize, and track their doctor prescriptions and lab reports. The app extracts medical information using AI and automatically creates reminders for medicines and follow-ups.

## Features

### User Profiles (Family Support)
- Create multiple profiles: Self, Mom, Dad, Child, etc.
- Each profile stores its own prescriptions, lab reports, and reminders
- Profile switcher at top of home screen

### Prescription Management
- Upload prescription via camera or PDF import
- AI extracts:
  - Doctor name, Date, Diagnosis/notes
  - Medicines: name, dosage, frequency, duration
  - Next follow-up date (if mentioned)
- Store original file + extracted structured data
- Display medicines in clean list view

### Lab Report Management
- Upload lab reports (Blood test, CBC, LFT, KFT, Lipid Profile, Thyroid, Vitamin D/B12, etc.)
- AI extracts:
  - Test type, All numeric values
  - High/Low indication based on reference range
- Show each report with:
  - Table of values
  - Mark high/low in red/green
  - Store date of report

### Health Timeline
- Combined timeline of all prescriptions and reports
- Sort by newest first
- Search bar: "Vitamin D", "Thyroid", "Sugar > 140", "Dr Sharma prescription"

### Medicine Reminder System
- From extracted prescription data:
  - Create reminders automatically
  - Example: Omeprazole – 1 capsule – 8 AM – 7 days
- User can edit or delete reminders
- Push notifications: "Time to take your medicine: Omeprazole"
- Show progress tracker: Missed / Completed doses

### Insights & Trends
- When multiple lab reports exist:
  - Show trend line graph
  - Example: Hemoglobin trend for last 12 months
- AI summary: "Your Vitamin D improved from 15 → 28 over 3 months"

### Document Viewer
- Open prescription or report PDF inside the app
- Side-by-side view: original + extracted AI data

### Sharing
- User can export:
  - Single report
  - Entire folder per family member
- Share via WhatsApp, email, or PDF export

### Offline-first + Sync
- App works offline
- Sync data when online

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Database**: Prisma with SQLite (development), PostgreSQL (production)
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4 Vision
- **PWA**: Next PWA with service worker
- **State Management**: Local Storage (ready for cloud sync)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aapka-aarogya-kosh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your OPENAI_API_KEY for AI extraction features
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Create Profiles**: Navigate to Profile tab to add family members
2. **Upload Documents**: Use the Records tab to upload prescriptions and lab reports
3. **View Extracted Data**: AI automatically processes and structures medical information
4. **Set Reminders**: Medicine reminders are created automatically from prescriptions
5. **Track Health**: View insights and trends from lab reports over time

## Configuration

### AI Features
To enable AI extraction, add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Database
- Development: SQLite database (`prisma/dev.db`)
- Production: PostgreSQL (configure `DATABASE_URL` in `.env`)

## Build & Deploy

### Build for production:
```bash
npm run build
npm start
```

### Deploy on Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<repository-url>)

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── profile/        # Profile management
│   ├── records/        # Medical records
│   ├── reminders/      # Medicine reminders
│   ├── insights/       # Health insights
│   └── page.tsx        # Home page
├── components/          # Reusable components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── lib/                # Utilities
│   ├── ai-extraction.ts # AI processing
│   ├── database.ts     # Database client
│   └── file-upload.ts  # File handling
└── types/              # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Privacy & Security

- All medical data is stored locally on device
- Optional cloud sync with encrypted storage
- AI processing done securely with OpenAI
- No data shared with third parties without consent

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with care for better healthcare management**
