# Green Future Society

A modern environmental incident reporting and monitoring platform built with Vue 3, designed to track, analyze, and respond to environmental incidents across regions.

## Features

### Authentication
- User registration with email confirmation
- Secure JWT-based login
- Password reset functionality
- Role-based access control (Admin/User)

### Reports Management
- Create environmental incident reports
- View and filter reports by type and search terms
- Edit and update report details
- Credibility scoring system
- Location geocoding with coordinate lookup

### Dashboard & Analytics
- Real-time dashboard statistics
- Crime/incident distribution charts
- Hotspot location mapping
- Credibility score trends
- Recent reports overview

### Weather Integration
- Historical temperature data
- Precipitation analysis
- Location-based weather insights
- Multi-year data visualization

### User Management (Admin)
- View all registered users
- User status management
- Role assignment

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **State Management:** Pinia
- **Routing:** Vue Router 4
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS 4
- **Charts:** Chart.js + vue-chartjs
- **Notifications:** vue-toastification

## Project Structure

```
src/
├── components/
│   └── common/
│       ├── LoadingSpinner.vue
│       ├── NavBar.vue
│       ├── Sidebar.vue
│       └── StatsCard.vue
├── services/
│   ├── api.ts              # Axios instance & interceptors
│   ├── auth.service.ts     # Authentication API calls
│   ├── reports.service.ts  # Reports CRUD operations
│   ├── weather.service.ts  # Weather data API
│   ├── analytics.service.ts # Dashboard analytics
│   └── geocoding.service.ts # Location geocoding
├── stores/
│   ├── auth.store.ts       # Authentication state
│   └── reports.store.ts    # Reports state & filters
├── views/
│   ├── auth/
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   └── ForgotPasswordView.vue
│   ├── admin/
│   │   ├── DashboardView.vue
│   │   ├── AnalyticsView.vue
│   │   ├── WeatherView.vue
│   │   ├── UserManagementView.vue
│   │   └── SettingsView.vue
│   ├── reports/
│   │   ├── ReportsListView.vue
│   │   ├── ReportDetailsView.vue
│   │   └── ReportFormView.vue
│   └── NotFoundView.vue
├── types/
│   └── index.ts            # TypeScript interfaces
├── router/
│   └── index.ts            # Route definitions & guards
├── App.vue
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (Spring Boot)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd green-future-society
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:9090/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

## API Integration

The frontend integrates with the following backend endpoints:

| Feature | Endpoint | Method |
|---------|----------|--------|
| Login | `/api/token` | POST |
| Register | `/api/registration` | POST |
| Confirm Email | `/api/registration/confirm` | GET |
| Reset Password | `/api/registration/reset` | GET |
| Get Reports | `/api/reports` | GET |
| Get Report | `/api/reports/{id}` | GET |
| Create Report | `/api/reports` | POST |
| Update Report | `/api/reports/{id}` | PUT |
| Temperature | `/api/weather/temperature` | GET |
| Precipitation | `/api/weather/precipitation` | GET |

### External APIs

- **Analytics:** External dashboard stats API
- **Geocoding:** Open-Meteo Geocoding API

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080/api` |

## Incident Types

The platform supports tracking of various environmental incidents:

- Illegal Logging
- Forest Fire
- Poaching
- Encroachment
- Pollution
- Deforestation
- Wildlife Trafficking
- Other

## User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access including user management |
| **USER** | Create, view, and edit reports |

## Route Guards

- **requiresAuth:** Protected routes requiring login
- **requiresAdmin:** Admin-only routes
- **requiresGuest:** Auth pages (login/register) - redirects if logged in

## Screenshots

### Dashboard
The main dashboard displays real-time statistics, incident distribution charts, hotspot locations, and recent reports.

### Reports
Browse, filter, and manage environmental incident reports with credibility scoring.

### Weather
View historical temperature and precipitation data for any location.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the Wangari Maathai Hackathon initiative for environmental conservation and monitoring.

---

Built with Vue 3 + TypeScript + Tailwind CSS
