# Habit Streak - Gamified Habit Tracker

A modern, gamified habit tracking application built with **React**, **Vite**, and **Firebase**. It features a premium "Zinc/Metal" aesthetic, real-time sync, and an engaging streak system with seasonal rewards.

## 🌟 Features

### 1. **Dashboard**
- **Daily Goals**: Track your daily tasks with progress rings.
- **Streak Tracking**: Visual indicators of your current consistency.
- **Badges**: Earn distinctive medals for hitting milestones.

### 2. **Streak System**
- **Dynamic Fire Icons**: The streak flame changes color based on your length (Orange -> Red -> Purple -> Blue -> Gold).
- **Leaderboard**: See your top-performing habits.
- **Visual Rewards**: High-end animations and glow effects.

### 3. **Profile & Rewards**
- **Seasonal Gemstone Badges**: 
    - A unique **Birthstone Gem** for every month you complete perfectly.
    - 12 distinct themes (e.g., Garnet for Jan, Emerald for May) with 3D tilt effects and metallic frames.
- **Secure Data**: Profile photos are encrypted before storage.

### 4. **Tech Stack**
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend/Db**: Firebase Authentication, Firestore
- **Icons**: Lucide React
- **Utils**: Date-fns, Classnames

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Firebase Project with Firestore and Auth enabled.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 💎 Badge System Guide

| Month | Gemstone | Color Theme |
| :--- | :--- | :--- |
| **January** | Garnet | Deep Red |
| **February** | Amethyst | Purple |
| **May** | Emerald | Green |
| **September** | Sapphire | Deep Blue |
| **December** | Tanzanite | Violet/Indigo |

*...and unique gems for every other month!*

---

Built with ❤️ for productivity enthusiasts.
