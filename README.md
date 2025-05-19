# Citizen Engagement System – MVP

## 🔍 Overview

Currently, complaints are often handled via fragmented channels, leading to delayed responses, inefficiency, and poor citizen satisfaction.

This project is a **Minimum Viable Product (MVP)** of a **Citizen Engagement System** that empowers citizens to easily submit complaints or feedback on public services. The system categorizes and routes complaints to the appropriate government agencies and allows tracking and institutional responses — all through a simple and intuitive interface.

---

## Key Features

- **Citizen Complaint Submission**  
  Users can submit feedback or complaints via a responsive web interface.

- **Complaint Categorization and Routing**  
  Submissions are categorized and forwarded to the relevant department based on issue type.

- **Real-Time Status Tracking**  
  Citizens can monitor the progress of their complaints using unique tracking codes.

- **Admin and Department Dashboards**  
  Admins and department staff can view, update, and manage complaints.

- **Automated Email Notifications**  
  Users receive automated email notifications when a complaint is submitted or updated.

- **Login and Registration**  
  Secure user registration and authentication system.

- **Responsive Design**  
  Fully optimized for desktops, tablets, and mobile devices.

---

## User Roles

1. **Citizens**
   - Submit and track complaints.
   - Receive email notifications on progress.
   - Receive direct notifications on progress.

2. **Admin**
   - View all complaints.
   - Assign or route complaints to departments.
   - Assign user to department

3. **Department Users**
   - View assigned complaints.
   - Update status and resolve issues.
   - Add announcement to the users

---

## Pages in the System

- Home Page (Pre-login)
- Login Page
- Register Page
- Citizen Dashboard
- Admin Dashboard
- Department Dashboard
- Complaint Grid
- Complaint Tracking Page
- Enquiry Page
- Form Table
- Sample Page

> All pages follow a unified design based on the homepage and logo color codes. Dashboards include modern professional sidebars. Logo watermark appears on key pages.

---

## Technologies Used

- **Frontend**: React.js, MUI (Material-UI)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Email**: Nodemailer + Gmail SMTP (with App Passwords)
- **Other Tools**: Axios, ESLint

---

## Installation Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/citizen-engagement-system.git
cd citizen-engagement-system
```

```bash
npm i
```

```bash
npm start
```

**for server**


```bash
MONGO_URI_SRV=
MONGO_URI_ALT=
EMAIL_USER=
EMAIL_PASS=
JWT_SECRET=your-secret-key

```
