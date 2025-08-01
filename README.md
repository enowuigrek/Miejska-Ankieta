<div align="center">
  <img src="./src/assets/images/logo_white.svg" alt="Miejska Ankieta Logo" width="200"/>
  <h1>Miejska Ankieta - Urban Survey System</h1>
  <p>Interactive QR-based survey system for city residents of Częstochowa with real-time results sharing</p>

[![Live Website](https://img.shields.io/badge/Live-miejska--ankieta.czest.pl-success?style=for-the-badge)](http://miejska-ankieta.czest.pl)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)
</div>

---

# Miejska Ankieta - Urban Survey System

## 📱 Project Status: **✅ LIVE IN PRODUCTION**

**🚀 Live Website:** [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl)  
**📍 Location:** Częstochowa, Poland  
**📊 Status:** Active QR survey platform with real user engagement

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="./src/assets/images/logo_white.svg" alt="Miejska Ankieta Logo" width="200"/>
        <br/>
        <strong>🏙️ Urban Survey Platform</strong>
        <br/>
        <em>Interactive city questionnaires</em>
      </td>
      <td align="center" width="50%">
        <strong>📊 QR-Based Surveys</strong>
        <br/>
        <em>Scan → Answer → Learn Facts</em>
        <br/><br/>
        <strong>🎯 Sample Questions:</strong>
        <br/>
        • Pizza z ananasem? 🍍
        <br/>
        • Koty czy psy? 🐱🐶
        <br/>
        • Pomidorowa z czym? 🍅
      </td>
    </tr>
  </table>

**🔗 QR Stickers Around City** | **📱 Mobile-First Design** | **🔥 Anonymous Responses** | **📈 Social Media Results**
</div>

---

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** SCSS (Sass)
- **Database:** Firebase Firestore
- **Icons:** FontAwesome
- **Routing:** React Router DOM
- **Language:** JavaScript/JSX
- **Deployment:** Netlify
- **Version Control:** Git

## ✨ Current Features

### 🏗️ **Production System**
- [x] **Live survey platform** - Fully operational at miejska-ankieta.czest.pl
- [x] **QR code deployment** - Physical stickers placed around Częstochowa
- [x] **Anonymous data collection** - Privacy-focused response system
- [x] **Real-time database** - Firebase Firestore backend
- [x] **Social media integration** - Instagram, Facebook, Twitter presence
- [x] **Mobile optimization** - Touch-friendly, smartphone-optimized design

### 🎯 **Survey System**
- [x] **Dynamic question routing** - Each question has unique URL (e.g., `/pizza_ananas`)
- [x] **Multi-choice responses** - Radio button interface with validation
- [x] **Fun facts system** - 29 educational facts displayed after surveys
- [x] **Day/night theme** - Time-based UI switching (22:00-06:00)
- [x] **Error handling** - 404 pages and validation

### 📊 **Content Database**
- **15+ Survey Questions** including:
    - Food preferences (Pizza z ananasem, Pomidorowa)
    - Lifestyle choices (Koty czy psy, Gaming platforms)
    - Local predictions (Częstochowa-specific content)
- **29 Educational Facts** - Science, technology, culture, fun trivia
- **Social media presence** - @miejska_ankieta across all platforms

## 🛠️ Development

### Prerequisites
- Node.js 22+
- npm or yarn
- Firebase project setup

### Quick Start
```bash
# Clone repository
git clone https://github.com/enowuigrek/Miejska-Ankieta.git
cd miejska-ankieta

# Install dependencies
npm install

# Start development server
npm run dev  # Vite dev server on http://localhost:3000

# Build for production
npm run build
```

### Available Scripts
```bash
npm run dev        # Start Vite development server
npm run build      # Create production build
npm run preview    # Preview production build
npm run export     # Export Firebase data to JSON
npm run stats      # Generate response statistics
```

## 🌟 Real-World Impact

### **Community Engagement**
- **Physical presence** in Częstochowa - QR stickers in various city locations
- **Anonymous participation** - No personal data collection, GDPR compliant
- **Results transparency** - Statistics shared via social media
- **Local community building** - Residents engage with city-wide questions

### **Technical Innovation**
- **Physical-digital bridge** - QR codes connect city spaces to digital platform
- **Mobile-first design** - Optimized for smartphone QR scanning
- **Real-time data storage** - Instant response collection and storage
- **Educational component** - Learning through participation

## 📱 User Journey

1. **Discovery** - Find QR sticker around Częstochowa
2. **Scan** - Use phone camera to scan QR code
3. **Navigate** - Redirect to specific question (e.g., `/zwierzeta`)
4. **Answer** - Select from multiple choice options
5. **Submit** - Anonymous response stored in Firebase
6. **Learn** - Display random educational fact
7. **Social** - Encourage following @miejska_ankieta for results

## 🏙️ Social Media Presence

- **Instagram:** [@miejska_ankieta](https://www.instagram.com/miejska_ankieta/)
- **Facebook:** [miejska.ankieta](https://www.facebook.com/miejska.ankieta)
- **Twitter:** [@miejska_ankieta](https://twitter.com/miejska_ankieta)

Results and community engagement shared across all platforms.

## 📊 Project Structure

```
src/
├── components/
│   ├── Home.jsx          # Landing page with social media links
│   ├── Question.jsx      # Survey question interface
│   ├── Fact.jsx          # Educational facts display
│   ├── SocialMediaPage.jsx # Final thank you + social links
│   └── PageNotFound.jsx  # 404 error handling
├── data/
│   ├── questionsData.js  # Survey questions database
│   └── factsData.js      # Educational facts database  
├── assets/images/        # Logo files (white/grey variants)
├── firebase.js          # Firebase configuration
└── App.jsx              # Main router and day/night theme
```

## 🌐 Deployment

**Status:** ✅ **LIVE IN PRODUCTION**

- **Hosting:** Netlify with custom domain
- **URL:** [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl)
- **SSL:** Active security certificate
- **CI/CD:** Automated deployment from GitHub
- **Environment:** Production-ready with environment variables

## 📞 Contact & Links

**Developer:** Łukasz Nowak  
**Location:** Częstochowa, Poland  
**Email:** enowuigrek@gmail.com

### **Project Links**
- **Live Website:** [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl)
- **GitHub:** [github.com/enowuigrek/Miejska-Ankieta](https://github.com/enowuigrek/Miejska-Ankieta)

---

## 🏆 Key Achievements

✅ **Real Community Platform** - Active survey system serving Częstochowa residents  
✅ **Physical QR Deployment** - QR stickers strategically placed around the city  
✅ **Anonymous Data Collection** - Privacy-focused, GDPR-compliant system  
✅ **Educational Value** - 29 facts providing learning opportunities  
✅ **Social Media Integration** - Multi-platform presence building community  
✅ **Mobile-Optimized UX** - Seamless smartphone scanning experience  
✅ **Modern Tech Stack** - React 18 + Vite + Firebase for scalability

---

**Made with ❤️ for urban communities | Częstochowa, Poland 🇵🇱**

*Interactive city engagement through technology*