# 🎓 SU Career Portal

A centralized career management platform designed to connect Strathmore University students and alumni, employer partners, and the Career Development Services (CDS) department. The platform brings the recruitment process into one place, making it easier for employers to advertise opportunities, students to discover and apply for them, and administrators to oversee the entire process from start to finish.

---

## ✨ Features

### 👨‍🎓 For Students
* **Discover Opportunities** – Browse and filter available career opportunities by category, job type, industry, and personal interests.
* **Apply to Opportunities** – Submit applications with the required documents, including CVs, cover letters, transcripts, and any additional employer requirements.
* **Track Applications** – Stay updated on application progress with real-time status updates such as Submitted, Shortlisted, and Rejected.
* **Save Favorites** – Bookmark interesting opportunities and return to them later.
* **Personalized Dashboard** – View opportunities that match selected interests and academic information.
* **Profile Management** – Keep personal, academic, and career details up to date from a single profile page.

### 🏢 For Employers
* **Post Opportunities** – Create detailed career opportunities with rich-text descriptions, responsibilities, qualifications, deadlines, and required application documents.
* **Applicant Tracking System (ATS)** – Review, search, filter, and organize applications using an intuitive recruitment dashboard.
* **Manage Applicants** – View uploaded documents securely and update applicant statuses while triggering real-time notifications to students.
* **Opportunity Management** – Monitor pending, active, and closed opportunities, edit pending listings, and keep track of recruitment deadlines.
* **Analytics & Reports** – Access recruitment insights, monitor application trends, and export analytics as professionally formatted PDF reports.
* **Company Profile** – Maintain company information, branding, logos, and organization details.

### 🛡️ For Career Development Services (CDS)
* **Administrative Dashboard** – Monitor overall platform activity, user statistics, and recruitment performance.
* **Employer Approvals** – Review employer registrations and approve or revoke access to maintain platform integrity.
* **Opportunity Moderation** – Review submitted opportunities before publication by approving, rejecting, or returning them to employers for revision.
* **Platform Analytics** – View system-wide recruitment trends, employer engagement, and generate comprehensive analytics reports.
* **Student Directory** – Search and view registered student and alumni profiles.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** – Builds a fast, responsive, and interactive user interface.
* **React Router DOM v6** – Handles client-side routing and navigation.
* **Vite** – Development server and build tool.
* **CSS Modules & Inline Styles** – Provides modular and component-scoped styling.

### Backend & Database
* **Firebase Authentication** – Secure authentication with Role-Based Access Control (RBAC).
* **Cloud Firestore** – Real-time NoSQL database for users, opportunities, applications, notifications, and analytics.
* **Cloudinary** – Cloud storage for applicant documents and company images.

### Utilities & Libraries
* **TipTap** – Rich-text editor for creating professional job descriptions.
* **DOMPurify** – Sanitizes HTML content before rendering.
* **jsPDF & jsPDF-AutoTable** – Generates downloadable PDF reports.
* **Lucide React** – Modern and consistent icon library.

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18 or later)
* npm or yarn
* Firebase account
* Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/su-career-portal.git
cd SUCareerApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root and add the following:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Configure Firebase & Cloudinary
1. Create a Firebase project.
2. Enable **Email/Password Authentication**.
3. Create a **Cloud Firestore** database.
4. Configure Firestore security rules.
5. Create an unsigned upload preset in Cloudinary for document and image uploads.

### 5. Run the Development Server
```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

### 6. Build for Production
```bash
npm run build
```

---

## 🔄 Core Workflows

### Student Application Workflow
1. A student completes their profile and applies for a published opportunity by uploading the required documents.
2. The employer receives the application instantly through the Applicant Tracking System.
3. The employer reviews the application and updates its status.
4. The student receives a real-time notification whenever the application status changes.

### Opportunity Moderation Workflow
1. An employer creates and submits a new opportunity.
2. The opportunity is placed in the **Pending** moderation queue.
3. A CDS administrator reviews the submission and chooses to approve, reject, or return it for revision.
4. Approved opportunities become visible to students, while expired opportunities are archived automatically once the application deadline passes.

---

## 🎨 User Experience Highlights

* **Strathmore Branding** – Designed using Strathmore University's official colour palette for a familiar user experience.
* **Responsive Design** – Optimized for desktops, laptops, and modern web browsers.
* **Real-Time Updates** – Notifications, applications, and recruitment status changes appear instantly without refreshing the page.
* **Clear Visual Feedback** – Color-coded badges and status indicators help users quickly understand the state of opportunities and applications.
* **Secure Actions** – Sensitive operations require confirmation to reduce accidental changes.

---

## 🧪 Testing & Validation

* **Black Box Testing** – Verified key user workflows, including registration, authentication, job posting, applications, moderation, and applicant tracking.
* **White Box Testing** – Validated Firestore security rules, role-based access control, and document upload functionality.
* **Input Validation** – All forms include validation for required fields, future application deadlines, supported document formats, and user permissions.

---

## 🚀 Future Enhancements

- [ ] Email notifications for important recruitment updates.
- [ ] Intelligent opportunity recommendations based on student interests and academic profiles.
- [ ] Interview scheduling and calendar integration.
- [ ] Employer feedback for unsuccessful applicants.
- [ ] Native mobile application for Android and iOS.

---

## 📄 License

This project was developed as an academic capstone project for **Strathmore University**.

© 2026 Strathmore University. All rights reserved.

---

### ❤️ Developed by the SU Career Portal Team