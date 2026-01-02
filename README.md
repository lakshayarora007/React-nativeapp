# React Native Assignment App

A React Native mobile application built using **Expo** that demonstrates authentication flow, dashboard analytics, and data-driven screens using a public REST API.

Expo EAS Update (Live App)
https://expo.dev/accounts/aroralakshay67/projects/demo-app-pbw7n1pp41rbn07nsx2sr

---

## 🚀 Features

### 🔐 Authentication
- Login screen with username & password
- Input validation for empty fields
- Loading indicator during login
- Error handling for failed login
- Authentication token stored using AsyncStorage
- Demo mode available in case API authentication fails

---

### 📊 Dashboard
- User profile overview
- Tasks summary
  - Total tasks
  - Completed tasks
  - Pending tasks
- Featured products preview (4 items)
- Quick navigation buttons
- Logout functionality

---

### 🧑 Profile Screen
- User avatar and basic details
- Username, phone, age, gender
- Demo account support
- Logout option

---

### ✅ Tasks Screen
- List of user tasks
- Status shown as Completed / Pending
- Data fetched from API
- Clean card-based UI

---

### 🛒 Products Screen
- List of products with:
  - Image
  - Title
  - Brand
  - Price
  - Rating
- Scrollable list with modern UI

---

## 🌐 API Used

All data is fetched from **DummyJSON API**:

- Authentication: `/auth/login`
- User info: `/auth/me`
- Tasks: `/todos/user/{userId}`
- Products: `/products`

> Note: DummyJSON is a demo API and may occasionally reject valid credentials.  
> A demo mode is provided to ensure smooth app experience.

---

## 🛠 Tech Stack

- React Native
- Expo
- Expo Router
- AsyncStorage
- REST APIs
- JavaScript / TypeScript
- Android & iOS compatible

---

## 📱 Run the App Locally

```bash
npm install
npx expo start
