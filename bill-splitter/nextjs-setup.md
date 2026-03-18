# Next.js Project Setup

> App Router · TypeScript · Lucide Icons · Inter Font · npm

---

## Requirements

- Node.js `v20.9+`
- npm (bundled with Node.js)

---

## 1. Create the Project

```bash
npx create-next-app@latest .
```

When prompted, answer as follows:

```
Would you like to use TypeScript?                → Yes
Which linter would you like to use?              → ESLint
Would you like to use React Compiler?            → No
Would you like to use Tailwind CSS?              → Yes
Would you like your code inside a src/ directory?→ No
Would you like to use App Router? (recommended)  → Yes
Would you like to customize the import alias?    → Yes
What import alias would you like configured?     → @/*
```

---

## 2. Install Lucide Icons

```bash
npm install lucide-react
```

**Usage example:**

```tsx
import { ArrowRight, Star } from 'lucide-react'

export default function Example() {
  return (
    <div>
      <Star size={24} />
      <ArrowRight size={24} />
    </div>
  )
}
```

---

## 3. Set Up Inter Font

Next.js has built-in font optimization via `next/font`. Update your root layout:

**`app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

**`tailwind.config.ts`** — extend the font family:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 4. VS Code TypeScript Plugin (Recommended)

Enable the workspace TypeScript version for better type-checking and auto-complete:

1. Open Command Palette → `Ctrl/⌘ + Shift + P`
2. Search: **TypeScript: Select TypeScript Version**
3. Select: **Use Workspace Version**

---

## 5. Project Structure

```
./
├── app/
│   ├── layout.tsx       ← Root layout (Inter font lives here)
│   ├── page.tsx         ← Home page
│   └── globals.css
├── components/          ← Create this for shared UI
├── public/              ← Static assets
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Recommended `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 6. package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

---

## 7. Run the Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

---

## Quick Reference

| Command           | Description                  |
|-------------------|------------------------------|
| `npm run dev`     | Start development server     |
| `npm run build`   | Build for production         |
| `npm run start`   | Start production server      |
| `npm run lint`    | Run ESLint                   |
| `npm run lint:fix`| Auto-fix lint issues         |
