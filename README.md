# PostuTrack (v0.4.0)

PostuTrack is a modern web and desktop application designed to organize, track, and optimize job and internship applications. It integrates artificial intelligence to dynamically tailor your master resume and cover letter for each specific job posting, visualize detailed metrics across the calendar year, and simulate hiring market trends.

Available in both **French** and **English**.

---

##  Key Features

###  Comprehensive Dashboard & 12-Month Analytics
* **Interactive Dashboard:** Real-time overview of your application pipeline (Applied, Interview, Offer, Rejected, Ghosted).
* **Calendar Year Velocity & Metrics:** Full January-to-January 13-month timeline tracking application velocity, response rates, and interview conversion ratios.
* **Hiring Weather Simulator:** Market seasonality predictions and monthly hiring forecast insights to optimize when to apply.
* **Channel & ATS Breakdown:** Track performance across LinkedIn, Welcome to the Jungle, Indeed, France Travail, Workday, Greenhouse, Lever, and direct emails.

###  Intelligent Resume & Cover Letter Tailoring
* **Multiple Pro Resume Templates:** Modern, Classic, Minimalist, Executive, Tech Clean, and Creative themes with customizable accent colors, density controls, and photo upload support.
* **AI Customization:** Analyze job postings to automatically generate tailored resumes and cover letters.
* **Instant PDF & TeX Export:** One-click client-side PDF compilation with real-time A4 print-ready preview.

###  Dev Studio (0-Token Resume Sandbox)
* **Real-time Live Preview:** Experiment with typography, density, margins, themes, and content without consuming API tokens.
* **1-Year Realistic Dataset Generator:** One-click injector of ~50 realistic job applications across 12 months with realistic delays and statuses to test analytics and charts.
* **Preset Profiles:** Switch between Tech Lead, Product Manager, or Custom Profile data with a single click.

###  Job Scraper & Auto-Fill
* Extract job requirements, company names, and contract types directly from job URLs.
* Support for major job boards and ATS platforms.

###  Privacy & Local-First Storage
* **Local Persistence:** Data is securely saved locally via `localStorage` with full offline availability.
* **Backup & Restore:** Full JSON export and import capabilities to backup, migrate, or restore your application database at any time.

---

##  Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` or `yarn`

### Quick Start (Web Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anirboukantar-del/postutrack-app.git
   cd postutrack-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

##  Tech Stack
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Framer Motion
* **PDF Export:** HTML2Canvas, jsPDF
* **Backend:** Express & Node.js

---

##  Credits & Acknowledgements
* [RenderCV](https://github.com/rendercv/rendercv.git)
* [Jina AI](https://github.com/jina-ai)
* [Reactive Resume](https://github.com/amruthpillai/reactive-resume.git)
* [JobSpy](https://github.com/speedyapply/JobSpy.git)

