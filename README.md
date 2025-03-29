# Dental CPMS (Clinical Practice Management System)

A modern and user-friendly dental clinic practice management system.

## 🛠 Technology Stack

### Frontend
- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shadcn/ui
- **State Management:** React Context

### Backend
- **API:** Next.js API Routes
- **Database ORM:** Prisma
- **Authentication:** NextAuth.js (inferred from middleware.ts)

## 📁 Project Structure

```
DentalCPMS/
├── src/
│   ├── app/           # Next.js 13 app router pages
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── shared/        # Shared resources
│   └── middleware.ts  # Authentication middleware
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── types/           # TypeScript type definitions
├── context/         # React context providers
└── lib/            # Core utility functions
```

## 🔑 Key Features

1. Modern web technologies-based interface
2. Type safety with TypeScript
3. Database integration with Prisma
4. Security and authorization system
5. Modular and reusable component architecture

## 🚀 Installation

1. Clone the project
```bash
git clone [repository-url]
```

1. Install dependencies
```bash
npm install
# or
yarn install
```

1. Start the development server
```bash
npm run dev
# or
yarn dev
```

1. Open in browser
```
http://localhost:3000
```

## 🔧 Environment Variables

The .env file required to run the project should contain the following variables:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- [Other required environment variables]

## 📚 Documentation

For detailed documentation, please review the following sections:

1. [Database Structure](./docs/database.md)
2. [API Endpoints](./docs/api.md)
3. [Component Architecture](./docs/components.md)
4. [Authentication](./docs/auth.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under [LICENSE].
