# PostuTrack UI Overhaul — Unslop, Prompt-Kit, Beautiful UI & Ionicons

A complete visual and interactive refinement of PostuTrack that eliminates generic AI-generated "slop" patterns, adopts the exact **Geist & Geist Mono** typography and AI prompt primitives from **prompt-kit.com**, integrates **Beautiful UI** agent reasoning traces, tool-call status rows, and structured data records, and replaces all application icons with **Ionicons**—while preserving PostuTrack's signature blue/indigo brand palette and crisp zinc neutral surfaces.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and aesthetic choices were confirmed during Phase 1 and govern this overhaul:

- **Confirmed Scope — Full Application Overhaul**: Every view, workspace tab (Dashboard, Applications Pipeline, Hiring Weather, AI Resume & Cover Letter Studio, CV Library, Dev Studio, Profile, Onboarding, Credits, and Settings), and modal dialog will be upgraded.
- **Confirmed Aesthetic & Unslop Direction — Original Blue/Indigo Palette with Crisp Zinc Neutrals & 1px Hairline Borders**: We retain the core blue (`#2563eb`) and indigo (`#4f46e5`) brand accents against high-craft zinc light/dark surfaces (`#ffffff` / `#fafafa` in light mode; `#09090b` / `#121215` in dark mode) with 1px hairline borders (`border-zinc-200 dark:border-zinc-800`), single-elevation depth, and zero nested card clutter.
- **Confirmed Iconography — Full Ionicons Migration**: All interface icons across navigation, toolbars, status indicators, AI prompt controls, and modals will transition from Lucide to **Ionicons** (`ionicons.designerpack` outline/sharp/filled variants via a unified icon adapter).

---

## 1. Overview & Core Concept

- **What It Does**: Transforms PostuTrack into a refined, high-density AI-native career workspace where tracking job applications, analyzing market seasonality, and tailoring resumes or cover letters feels crafted by a human design team rather than a generic template generator.
- **Target Audience / Persona**: Job seekers, software engineers, and career switchers who manage multi-channel job pipelines and rely on multi-provider LLMs (Gemini, Groq, OpenAI, Claude, local Ollama) to tailor ATS-ready resumes and cover letters.
- **Key Value**:
  - **Unslop Visual Clarity**: Removes visual bloat (multi-layered drop shadows, decorative pulsing dots, nested card boxes, pill-badge sandwiches, and shouty all-caps headers) in favor of crisp hierarchy, whitespace separation, and `tabular-nums` data precision.
  - **Prompt-Kit Ergonomics**: Upgrades the AI Tailor Studio and Job Scraper inputs into composable **Prompt-Kit** composer surfaces with integrated model selectors, tone/mode action bars, attachment/URL pills, and clean streaming output containers.
  - **Beautiful UI Agent Transparency**: Replaces opaque loading spinners during URL scraping and AI resume/letter generation with **Beautiful UI** live thinking traces, step-by-step tool-call execution chips, keyword diff/injection records, and interactive human-in-the-loop review controls.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Workspace Navigation & Pipeline Management**:
   - Users navigate via a streamlined 260px left sidebar with single-line Ionicons navigation items, subtle active surface states, and a clean 3-zone top bar containing the current view breadcrumb, token/status telemetry, and primary action CTA.
   - In the **Applications Pipeline**, users filter via a segmented toolbar, inspect high-density data rows (`38px–44px` height) with tabular date/delay numerals, and open clean single-elevation modals to log or import applications.
2. **AI Resume & Cover Letter Studio (Prompt-Kit + Beautiful UI Flow)**:
   - Users enter a job URL or paste a job description inside a **Prompt-Kit PromptInput** container featuring an embedded bottom action bar (mode toggle for CV vs. Cover Letter, provider/model selector, tone selector, and custom instruction drawer).
   - When extraction or generation begins, a **Beautiful UI Agent Reasoning & Tool-Call Trace** panel displays real-time steps (e.g., *Fetching job offer metadata*, *Analyzing ATS keyword alignment*, *Synthesizing tailored achievements*, *Formatting A4 layout*).
   - Once complete, users inspect a **Beautiful UI Structured Record & Keyword Alignment Card** showing the match score (`tabular-nums`), injected ATS keywords, and a side-by-side or full-width A4 preview with instant inline editing and 1-click PDF export.
3. **Analytics, Hiring Weather & Settings**:
   - **Dashboard & 12-Month Analytics** present clean KPI strips separated by 1px hairline dividers, high-contrast charts, and channel conversion tables without nested card wrappers.
   - **Settings & AI Provider Configuration** organize API keys, local Ollama bridge diagnostics, and Master Prompts into clean tabbed panels with interactive connection probers.

### Visual Identity & Theme

- **Aesthetic Direction**: Restraint-first, high-craft AI workspace combining **prompt-kit.com** (Vercel/Geist precision) with **beautifului.dev** (transparent agentic surfaces) and **heydamir/unslop** (anti-cliché discipline).
- **Color Palette & Mood (Original Brand Colors Preserved)**:
  - **60% Dominant Neutral Canvas**: Crisp white (`#ffffff`) and subtle cool alabaster (`#f8fafc` / `#f4f4f5`) in light mode; deep carbon zinc (`#09090b`) in dark mode.
  - **30% Structural Surfaces & Hairlines**: Subdued zinc containers (`#f4f4f5` light / `#121215` dark) bounded by 1px solid hairline borders (`#e4e4e7` light / `#27272a` dark) with zero competing drop shadows.
  - **10% Brand & Semantic Accents**: Signature PostuTrack Royal Blue (`#2563eb`) and Indigo (`#4f46e5`) reserved for primary CTAs, active prompt controls, and key data series; semantic emerald (`#16a34a`), amber (`#d97706`), and rose (`#e11d48`) paired with explicit text/icon labels for application statuses.
- **Typography & Hierarchy (Prompt-Kit Exact Font Pairing)**:
  - **Primary UI & Display Face**: **`Geist`** (`--font-geist-sans`), loaded via Google Fonts in `index.html` and mapped to Tailwind's default sans stack, delivering the exact typographic voice of `prompt-kit.com`.
  - **Monospace & Telemetry Face**: **`Geist Mono`** (`--font-geist-mono`), applied to all numeric KPIs, match scores, token counters, dates, latency badges, and prompt templates with `font-variant-numeric: tabular-nums`.
  - **Type Scale Discipline**: Refined section titles (`18px–24px`, `font-semibold`, `tracking-tight`, `text-wrap: balance`), crisp body copy (`14px–15px`, `leading-relaxed`), and quiet unboxed metadata (`12px`, separated by `·`).
- **Component Styling & Layout**:
  - **Unslop Cleanup Rules**: Eradicate nested card-in-card boxes, thick colored left borders (`border-l-4`), decorative pulsing dots, and candy-colored pill sandwiches. Use clean 6px–8px border radii and hairline dividers.
  - **Ionicons System**: Every icon uses the authentic Ionicons SVG geometry (`outline` for resting navigation and toolbars, `sharp`/`filled` for active states and primary affordances).

### Interactive Feedback & Motion

- **Micro-Interactions**: Fast, compositor-only transitions (`150ms cubic-bezier(0.16, 1, 0.3, 1)`) on button presses, segmented tab switches, and table row hovers.
- **Agent Reasoning & Task Steps**: Smooth collapsible thinking trace and step-by-step tool status rows during job scraping and AI generation, plus non-intrusive toast notifications for exports and clipboard actions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Ionicons Adapter Component**
  - *Chosen Approach*: Build a dedicated, zero-latency Ionicons SVG system (`Ionicons` component library mapped from `ionicons.designerpack` paths) that supports all icons used across PostuTrack with consistent `size`, `className`, and stroke/fill props.
  - *Why*: Guarantees 100% authentic Ionicons vector rendering across every view and modal without breaking existing component props or introducing external CDN flicker.
  - *Alternatives Considered*: Loading external Ionicons web components (`<ion-icon>`) via CDN, which causes hydration lag, shadow-DOM styling issues in PDF/print views, and offline failures.
- **Decision 2: Composable Prompt-Kit & Beautiful UI Primitives**
  - *Chosen Approach*: Create dedicated reusable UI primitives modeled directly on `ibelick/prompt-kit` (`PromptInput`, `PromptInputTextarea`, `PromptInputActions`, `PromptInputAction`, `PromptSuggestion`) and `beautifului.dev` (`AgentThinkingTrace`, `ToolCallRow`, `StructuredRecordCard`, `SegmentedFilterBar`, `DataGridSurface`).
  - *Why*: Elevates the AI Resume/Cover Letter generator, Job Scraper, and Analytics views into cohesive, modular AI-native interfaces while keeping all existing business logic, multi-provider API integrations, and A4 PDF printing 100% intact.
  - *Alternatives Considered*: Only restyling CSS classes in `index.css`, which would miss the structural ergonomics of Prompt-Kit composers and Beautiful UI agent feedback components.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        PostuTrack App Shell (Geist UI)                       │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │ Sidebar Navigation   │  │ 3-Zone Top Bar (Breadcrumb · Telemetry · CTA)│  │
│  │ (Ionicons + 1px Line)│  └──────────────────────┬───────────────────────┘  │
│  └──────────┬───────────┘                         │                          │
│             │              ┌──────────────────────▼───────────────────────┐  │
│             ├─────────────►│           Active Workspace Viewport          │  │
│             │              └──────┬───────────────┬───────────────┬───────┘  │
│             │                     │               │               │          │
│  ┌──────────▼───────────┐  ┌──────▼───────┐ ┌─────▼──────┐ ┌──────▼───────┐  │
│  │ Beautiful UI Data    │  │ Prompt-Kit   │ │ Beautiful  │ │ A4 Print &   │  │
│  │ Surfaces & KPI Grids │  │ AI Composer  │ │ UI Agent   │ │ Resume Lab   │  │
│  │ • Pipeline Table     │  │ • Job URL    │ │ Traces     │ │ • 6 Pro      │  │
│  │ • 12-Mo Analytics    │  │   Extractor  │ │ • Thinking │ │   Templates  │  │
│  │ • Hiring Weather     │  │ • Mode/Model │ │   Steps    │ │ • Paragraph  │  │
│  │ • Segmented Filters  │  │   Toolbar    │ │ • ATS Diff │ │   Formatter  │  │
│  └──────────────────────┘  └──────┬───────┘ └─────▲──────┘ └──────▲───────┘  │
│                                   │               │               │          │
│                            ┌──────▼───────────────┴───────────────┴───────┐  │
│                            │ Multi-Provider AI & Scraper Engine           │  │
│                            │ (Gemini · Groq · OpenAI · Claude · Ollama)   │  │
│                            └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Preserved Application State**: All `localStorage` keys (`postutrack_apps`, `postutrack_profile`, `postutrack_cv_library`, provider API keys, theme, language, and master prompts) remain 100% compatible with zero data loss.
- **Enhanced UI & Agent Trace State**:
  - Real-time step progression state for the Beautiful UI `AgentThinkingTrace` and `ToolCallRow` indicators during URL extraction and AI generation (tracking active phase, elapsed duration in `tabular-nums`, and provider model used).
  - Prompt-Kit composer state managing textarea auto-resize, quick prompt suggestions, mode/tone pills, and keyboard shortcuts (`Cmd/Ctrl + Enter` to generate).

### Interactive Component & State Mapping

- **Prompt-Kit Composer (`PromptInput` & `PromptInputActions`)**:
  - Binds directly to `companyName`, `roleName`, `jobOfferUrl`, `jobDescription`, `generationMode` (`cv` | `letter`), `letterTone`, `selectedAiModel`, and `customPromptInstructions`.
  - Triggers `extractOfferFromUrl` on URL paste/button click and `handleGenerateAI` on submit or `Cmd/Ctrl + Enter`.
- **Beautiful UI Agent Trace & Records (`AgentThinkingTrace`, `StructuredRecordCard`)**:
  - Reflects live states (`isExtractingUrl`, `isGenerating`, `aiResult.matchScore`, `aiResult.injectedKeywords`, `aiResult.analysisSummary`) with expandable reasoning details and instant copy/reformat actions.
- **Unslop Data Grids & Modals**:
  - Connects search, status/contract segmented filters, column sorting, CSV/JSON import-export, and inline application editing to crisp single-elevation tables and dialogs using Ionicons affordances.
