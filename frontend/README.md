# TMS Frontend - Transportation Management System

A modern, responsive frontend application built with React, TypeScript, Tailwind CSS, and Redux Toolkit for the Transportation Management System.

## 🚀 Features

- **Modern Tech Stack**: React 19, Vite, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit with async thunks
- **UI Components**: Custom design system with shadcn/ui-inspired components
- **Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: WebSocket integration ready
- **Developer Experience**: Hot reload, ESLint, Prettier

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images, icons, and other assets
│   │   ├── images/
│   │   └── icons/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Design system components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TabNavigation.jsx
│   │   │   └── Footer.jsx
│   │   ├── forms/              # Form components
│   │   └── charts/             # Chart components
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication
│   │   ├── dashboard/          # Dashboard
│   │   ├── indent/             # Indent management
│   │   ├── rfq/                # RFQ management
│   │   ├── contract/           # Contract management
│   │   ├── tracking/           # Tracking
│   │   └── epod/               # e-POD
│   ├── hooks/                  # Custom React hooks
│   ├── redux/                  # State management
│   │   ├── slices/             # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── uiSlice.js
│   │   │   ├── indentSlice.js
│   │   │   └── ...
│   │   └── store.js            # Redux store configuration
│   ├── routes/                 # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── utils/                  # Utility functions
│   │   ├── api.js              # Axios configuration
│   │   ├── constants.js        # Application constants
│   │   ├── helpers.js          # Helper functions
│   │   └── validationSchemas.js
│   ├── App.jsx                 # Main App component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── .env.example                # Environment variables template
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🛠 Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animation**: Framer Motion (ready)
- **Development**: ESLint, Prettier

## 🎨 Design System

### Theme Colors

- **Primary**: Orange (#FFA500) - TMS brand color
- **Background**: Light gray (#F5F7FA)
- **Text**: Dark navy (#0D1A33)
- **Cards**: White (#FFFFFF) with subtle shadows
- **Navigation**: Dark navy (#0D1A33) with white active tabs

### Component Library

- **TmsButton**: Multi-variant button component
- **TmsCard**: Consistent card layout
- **TmsInput**: Form input with validation states
- **StatusPill**: Status indicators with theme colors
- **Toast**: Notification system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/tms-dev-2.git
   cd tms-dev-2/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_SOCKET_URL=http://localhost:3000
   VITE_APP_NAME=TMS - Transportation Management System
   VITE_APP_VERSION=1.0.0
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to test the application:

- **Consignor**: consignor@tms.com / password123
- **Transporter**: transporter@tms.com / password123
- **Driver**: driver@tms.com / password123

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🧪 Testing

Testing setup is ready for:

- Unit tests with Jest + React Testing Library
- Integration tests
- E2E tests with Cypress

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 🔐 Security Features

- JWT token-based authentication
- Role-based access control
- Protected routes
- Automatic token refresh
- HTTPS-ready configuration

---

**Built with ❤️ for efficient transportation management**
