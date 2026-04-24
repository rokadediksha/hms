# 🏥 MediCore — Hospital Management System

Full-stack HMS with **Node.js + Express backend**, **HTML/CSS/JS frontend**, **AWS RDS (MySQL)**, and a **Jenkins CI/CD pipeline**.

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   ├── server.js          # Express API
│   ├── db.js              # AWS RDS connection pool
│   ├── package.json
│   ├── server.test.js     # Jest tests
│   └── .env.example       # Environment variable template
├── frontend/
│   ├── index.html         # Main UI
│   ├── style.css          # Dark medical theme
│   └── script.js          # API calls & DOM logic
├── database/
│   └── schema.sql         # RDS table definitions + seed data
├── Jenkinsfile            # CI/CD pipeline
└── README.md
```

---

## ⚙️ Prerequisites

| Tool       | Version  |
|------------|----------|
| Node.js    | >= 18    |
| npm        | >= 8     |
| MySQL      | 8.0 (RDS)|
| Jenkins    | >= 2.400 |

---

## ☁️ AWS RDS Setup

### 1. Create RDS Instance
- Go to **AWS Console → RDS → Create Database**
- Engine: **MySQL 8.0**
- Template: **Free tier** (dev) or **Production**
- DB name: `hospital_db`
- Master username: `admin`
- Enable **Public access** if EC2 is in a different VPC (use security groups to restrict)
- Note down the **Endpoint URL**

### 2. Configure Security Group
Allow **inbound TCP port 3306** from your EC2 instance's security group.

### 3. Run Schema
```bash
mysql -h <your-rds-endpoint> -u admin -p < database/schema.sql
```

---

## 🚀 Local Development

```bash
# 1. Clone the repo
git clone https://github.com/your-username/hospital-management.git
cd hospital-management/backend

# 2. Install dependencies
npm install

# 3. Copy and fill in credentials
cp .env.example .env
# Edit .env with your RDS credentials

# 4. Start the server
npm run dev       # with nodemon (hot reload)
# OR
npm start         # production

# 5. Open frontend
# Open frontend/index.html in your browser
```

---

## 🔌 API Endpoints

### Patients
| Method | Route            | Description       |
|--------|------------------|-------------------|
| GET    | /patients        | List all patients |
| POST   | /patients        | Add a patient     |
| GET    | /patients/:id    | Get one patient   |
| PUT    | /patients/:id    | Update patient    |
| DELETE | /patients/:id    | Delete patient    |

### Doctors
| Method | Route    | Description     |
|--------|----------|-----------------|
| GET    | /doctors | List doctors    |
| POST   | /doctors | Add a doctor    |

### Appointments
| Method | Route          | Description          |
|--------|----------------|----------------------|
| GET    | /appointments  | List appointments    |
| POST   | /appointments  | Book appointment     |

### Misc
| Method | Route   | Description      |
|--------|---------|------------------|
| GET    | /health | Health check     |
| GET    | /stats  | Dashboard counts |

---

## 🔑 Jenkins Setup

### 1. Install Plugins
- Git Plugin
- NodeJS Plugin
- Pipeline Plugin

### 2. Configure NodeJS in Jenkins
Jenkins → Manage Jenkins → Global Tool Configuration → NodeJS → Add NodeJS installation → Name: `nodejs`

### 3. Add RDS Credentials
Jenkins → Manage Jenkins → Credentials → Global → Add Credential (Secret text):

| ID            | Value                                      |
|---------------|--------------------------------------------|
| `RDS_HOST`    | `yourdb.xxxxxxx.us-east-1.rds.amazonaws.com` |
| `RDS_USER`    | `admin`                                    |
| `RDS_PASSWORD`| `your_password`                            |
| `RDS_DB`      | `hospital_db`                              |

### 4. Create Pipeline Job
Jenkins → New Item → Pipeline → Under Pipeline, select "Pipeline script from SCM" → Git → add your repo URL

### 5. Set Up Webhook (auto-trigger on push)
GitHub repo → Settings → Webhooks → Add:
```
Payload URL: http://<jenkins-ip>:8080/github-webhook/
Content-type: application/json
Event: Just the push event
```

---

## 🔄 CI/CD Flow

```
git push → GitHub → Webhook → Jenkins
                                  ↓
                         Clone Repository
                                  ↓
                    Install npm Dependencies
                                  ↓
                      Test RDS Connection
                                  ↓
                           Run Jest Tests
                                  ↓
                       Deploy (nohup node)
                                  ↓
                          Health Check ✅
```

---

## 🌍 Access

| Service  | URL                                        |
|----------|--------------------------------------------|
| Frontend | `http://<server-ip>/frontend/index.html`   |
| API      | `http://<server-ip>:3000`                  |
| Health   | `http://<server-ip>:3000/health`           |

---

## 🔐 Security Notes

- **Never commit `.env`** — it's in `.gitignore`
- RDS credentials are injected by Jenkins at runtime
