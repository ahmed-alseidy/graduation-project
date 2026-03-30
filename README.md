# Graduation Project

A modern, full-stack web application featuring workspace-based project management, interactive visual blueprints, and AI-powered assistance.

## 🚀 Features

- **Workspace & Project Management:** Organize work into dedicated workspaces and projects.
- **Interactive Blueprints:** Create and edit node-based diagrams and workflows using React Flow.
- **AI Integration:** Leverage Google's Generative AI (Gemini) for intelligent diagram generation and assistance.
- **Secure Authentication:** Robust user authentication and session management using Better Auth.

## 🛠️ Tech Stack

This project is structured as a monorepo using [Turborepo](https://turbo.build/) and `pnpm`.

### Frontend (`apps/web`)
- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Tailwind CSS v4 & Shadcn UI (Radix UI)
- **Diagrams:** React Flow (`@xyflow/react`)
- **State Management:** Jotai
- **Data Fetching:** TanStack React Query
- **Forms & Validation:** React Hook Form + Zod

### Backend (`apps/api`)
- **Framework:** NestJS 11
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better Auth (`@thallesp/nestjs-better-auth`)
- **AI Integration:** Google Generative AI (`@google/generative-ai`)

## 📂 Project Structure

```text
.
├── apps/
│   ├── api/            # NestJS backend application
│   └── web/            # Next.js frontend application
├── packages/           # Shared packages across the monorepo
├── project-docs/       # Project planning and documentation (PDFs)
└── package.json        # Root package.json (Turborepo setup)
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18
- [pnpm](https://pnpm.io/) (Package Manager)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd graduation-project
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in `apps/api` (and `apps/web` if necessary) based on the required configurations (Database URL, Better Auth secrets, Google Gemini API Key).

4. Run database migrations:
   ```bash
   cd apps/api
   pnpm db:push
   ```

### Running the Application

To start both the frontend and backend development servers simultaneously from the root directory:

```bash
pnpm dev
```

- **Frontend:** Typically runs on `http://localhost:3000`
- **Backend:** Typically runs on `http://localhost:3001` (or your configured NestJS port)

## 📄 Documentation

Extensive project planning documents can be found in the `project-docs/` directory, including:
- Project Description
- User Stories & Flows
- Features by Roles
- Roadmap & Tickets
