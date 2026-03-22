sure-showcase/
│
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── student/
│   │   ├── mentor/
│   │   └── admin/
│   │
│   ├── profile/
│   ├── domains/
│   ├── projects/
│   └── layout.tsx
│
├── components/               # Reusable UI Components
│   ├── ui/
│   ├── forms/
│   └── dashboard/
│
├── lib/                      # Utilities & Config
│   ├── supabaseClient.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── services/                 # Business Logic Layer
│   ├── user.service.ts
│   ├── project.service.ts
│   └── domain.service.ts
│
├── types/                    # TypeScript interfaces
│
├── middleware.ts             # Auth protection
│
├── public/
│
├── styles/
│
├── .env.local
├── README.md
└── package.json