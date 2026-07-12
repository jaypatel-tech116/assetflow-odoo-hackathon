# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a robust Enterprise Asset & Resource Management ERP system built for tracking hardware, managing departmental allocations, scheduling bookings, and handling physical equipment audits.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Allowed Navigation |
|---|---|---|---|
| **Admin** | `admin@assetflow.com` | `Admin@12345` | Full access, including **Organization Setup** (Department & Category CRUD, User role promotion) |
| **Asset Manager** | `manager@assetflow.com` | `Manager@12345` | Asset Registry, Allocations, Maintenance workflow, Auditing cycles |
| **Department Head** | `head@assetflow.com` | `Head@12345` | Scoped department allocations & transfers, booking calendar |
| **Employee** | `employee@assetflow.com` | `Employee@12345` | Raise maintenance request, book shared resources, view own dashboard |

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure your local MySQL instance is running. Configure credentials in `server/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Jay1126
DB_NAME=register_login
```

### 2. Install Dependencies & Build
Install packages for the backend and frontend:
```bash
# In the repository root
cd server && npm install
cd ../client && npm install
```

### 3. Initialize & Seed Database
Recreate database tables and seed test data:
```bash
cd server
npm run seed
```

### 4. Run the Servers
Start the Express server:
```bash
cd server
npm run dev
```

Start the Vite React client:
```bash
cd client
npm run dev
```

Open `http://localhost:5173` to test the application.
