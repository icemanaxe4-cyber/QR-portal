# 🎓 SeminarHub — Academic Seminar Portal

A full-stack seminar management portal built with **React + Firebase**. Professors can create seminar pages, generate QR codes, and manage registrations. Students can scan QR codes to find and register for seminars.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth** | Firebase email/password login, role-based (Professor / Admin) |
| **Professor Approval** | New professor accounts require admin approval |
| **Seminar CRUD** | Full create/edit/delete with image uploads |
| **QR Code Generation** | Auto-generated unique URL + downloadable QR per seminar |
| **Public Landing Page** | Rich seminar page accessible by anyone via QR or URL |
| **Registration** | Login required to register; duplicate & seat-cap checks |
| **Registration CSV Export** | Download attendee list as CSV |
| **Admin Panel** | Manage professors, all seminars, all registrations |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
cd seminar-portal
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication → Email/Password**
4. Create a **Firestore Database** (start in test mode, then add rules below)
5. Enable **Storage** (for images)
6. Go to Project Settings → Your Apps → Add a Web App → copy the config

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your Firebase values in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run

```bash
npm run dev
```

Open `http://localhost:5173`

---

## 🔐 Firebase Security Rules

### Firestore Rules
Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own profile; admins can read all
    match /users/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow create: if request.auth != null && request.auth.uid == uid;
      allow update: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow delete: if isAdmin();
    }

    // Seminars: public read, approved professor/admin write
    match /seminars/{seminarId} {
      allow read: if true;
      allow create: if isApprovedProfessor() || isAdmin();
      allow update: if isAdmin() || (isApprovedProfessor() && resource.data.professorUid == request.auth.uid);
      allow delete: if isAdmin() || (isApprovedProfessor() && resource.data.professorUid == request.auth.uid);
    }

    // Registrations: anyone logged in can create; professor of seminar + admin can read
    match /registrations/{regId} {
      allow create: if request.auth != null;
      allow read: if isAdmin() || (request.auth != null && isSeminarOwner(resource.data.seminarId));
      allow delete: if isAdmin();
    }

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isApprovedProfessor() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professor' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    }

    function isSeminarOwner(seminarId) {
      return get(/databases/$(database)/documents/seminars/$(seminarId)).data.professorUid == request.auth.uid;
    }
  }
}
```

### Storage Rules
Go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /seminars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🗂 Project Structure

```
src/
├── firebase.js              # Firebase init
├── main.jsx                 # React entry
├── App.jsx                  # Router + providers
├── index.css                # Tailwind + custom styles
│
├── contexts/
│   └── AuthContext.jsx      # Auth state, login/signup/logout
│
├── services/
│   └── seminarService.js    # All Firestore + Storage operations
│
├── components/
│   ├── Navbar.jsx           # Top navigation bar
│   ├── SeminarCard.jsx      # Card for dashboard grid
│   ├── SeminarForm.jsx      # Full create/edit form
│   └── ProtectedRoute.jsx   # Route guards (auth, approved, admin)
│
└── pages/
    ├── Login.jsx            # Login page
    ├── Signup.jsx           # Signup with role selection
    ├── Dashboard.jsx        # Professor/admin dashboard
    ├── CreateSeminar.jsx    # Create seminar page
    ├── EditSeminar.jsx      # Edit seminar page
    ├── QRCodePage.jsx       # QR code view + download
    ├── SeminarLanding.jsx   # Public seminar page (QR destination)
    ├── Registrations.jsx    # Registrations list + CSV export
    └── AdminPanel.jsx       # Admin management panel
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Guest** | Browse public seminar pages |
| **Student/User** | Login to register for seminars |
| **Professor** | Create/edit/delete own seminars, view own registrations, download QR |
| **Admin** | Everything — approve professors, manage all seminars, view all registrations |

---

## 📦 Deployment

### Frontend — Vercel
```bash
npm run build
# Push to GitHub → Import in Vercel → Add .env variables
```

### Firebase Hosting (alternative)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Custom CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| QR Code | `qrcode` npm library |
| Routing | React Router v6 |
| Toasts | react-hot-toast |
| Icons | Lucide React |

---

## 📋 Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles with role + approval status |
| `seminars` | All seminar data including slug, metadata, seat counts |
| `registrations` | Student registrations linked to seminarId |
