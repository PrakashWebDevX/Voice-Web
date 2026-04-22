# VoiceForge — Folder Structure

voiceforge/
├── frontend/                          # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Main generator UI
│   │   ├── history/
│   │   │   └── page.tsx               # Generation history
│   │   └── pricing/
│   │       └── page.tsx               # Stripe pricing
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Badge.tsx
│   │   ├── VoiceInput.tsx             # Web Speech API
│   │   ├── CodeEditor.tsx             # Syntax highlighted output
│   │   ├── GenerateForm.tsx           # Prompt + template selector
│   │   ├── StreamingOutput.tsx        # SSE typing effect
│   │   ├── HistoryCard.tsx
│   │   ├── Navbar.tsx
│   │   └── PricingCard.tsx
│   ├── lib/
│   │   ├── firebase.ts                # Firebase config
│   │   ├── api.ts                     # API client
│   │   ├── useAuth.ts                 # Auth hook
│   │   └── useStreaming.ts            # SSE hook
│   ├── public/
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                           # Express API
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── routes/
│   │   │   ├── generate.ts            # /api/generate (SSE streaming)
│   │   │   ├── history.ts             # /api/history CRUD
│   │   │   ├── auth.ts                # /api/auth verify
│   │   │   └── payments.ts            # /api/payments Stripe
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts      # Firebase token verify
│   │   │   ├── rateLimiter.ts         # express-rate-limit
│   │   │   └── validateInput.ts       # zod validation
│   │   ├── models/
│   │   │   ├── User.ts                # MongoDB user schema
│   │   │   └── Generation.ts         # Generation history schema
│   │   ├── services/
│   │   │   ├── claudeService.ts       # Anthropic streaming
│   │   │   ├── stripeService.ts       # Stripe subscription
│   │   │   └── mongoService.ts        # DB connection
│   │   └── utils/
│   │       ├── zipBuilder.ts          # JSZip download
│   │       └── prompts.ts             # System prompts
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
