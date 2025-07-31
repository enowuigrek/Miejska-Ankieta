<div align="center">
  <img src="./src/assets/images/logo_red.svg" alt="Miejska Ankieta Logo" width="200"/>
  <h1>Miejska Ankieta - Urban Survey System</h1>
  <p>Interactive QR-based survey system for city residents of Częstochowa with real-time results sharing</p>

[![Live Website](https://img.shields.io/badge/Live-miejska--ankieta.czest.pl-success?style=for-the-badge)](http://miejska-ankieta.czest.pl)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)
</div>

---

# Miejska Ankieta - Urban Survey System

## 📱 Project Preview

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="./src/assets/images/logo_red.svg" alt="Miejska Ankieta Logo" width="200"/>
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

- **Frontend:** React 18 + Create React App
- **Styling:** SCSS (Sass)
- **Database:** Firebase Firestore
- **Icons:** FontAwesome
- **Routing:** React Router DOM
- **Language:** JavaScript/JSX
- **Deployment:** Netlify
- **Version Control:** Git

## ✨ Features

### 🏗️ **Architecture & Code Quality**
- [x] **Component-based architecture** - Modular React components
- [x] **SCSS styling system** - Organized and maintainable styles
- [x] **Firebase integration** - Real-time database operations
- [x] **Responsive design** - Mobile-first approach
- [x] **Anonymous data collection** - Privacy-focused surveys

### 🎯 **Survey System**
- [x] **QR code integration** - Physical stickers around Częstochowa
- [x] **Dynamic question routing** - URL-based question access
- [x] **Anonymous responses** - No personal data collection
- [x] **Real-time data storage** - Firebase Firestore backend
- [x] **Response validation** - Form validation and error handling
- [x] **Fun facts system** - Educational content after responses

### 📱 **User Experience**
- [x] **Mobile-optimized design** - Touch-friendly interfaces
- [x] **Day/night theme switching** - Time-based UI theming
- [x] **Smooth transitions** - Professional UI animations
- [x] **Social media integration** - Instagram, Facebook, Twitter links
- [x] **Fun facts database** - 29 interesting facts about various topics
- [x] **Multi-question support** - Scalable question system

### 🎨 **Content & Design**
- [x] **Custom logo integration** - SVG-based branding
- [x] **FontAwesome icons** - Professional icon library
- [x] **Responsive navigation** - Adaptive menu system
- [x] **Social media links** - Community engagement
- [x] **404 error handling** - User-friendly error pages

## 📁 Project Structure

```
src/
├── components/
│   ├── Fact.jsx             # Fun facts display after survey
│   ├── Home.jsx             # Landing page with instructions
│   ├── Question.jsx         # Survey question interface
│   ├── PageNotFound.jsx     # 404 error page
│   └── SocialMediaPage.jsx  # Final page with social links
├── assets/
│   └── images/
│       ├── logo_red.svg     # Main brand logo
│       └── favicon.ico      # Site favicon
├── data/
│   ├── questionsData.js     # Survey questions database
│   └── factsData.js         # Fun facts database
├── styles/
│   ├── App.scss             # Main application styles
│   ├── Fact.scss            # Fact component styles
│   ├── Home.scss            # Home page styles
│   ├── Question.scss        # Question interface styles
│   ├── PageNotFound.scss    # Error page styles
│   └── SocialMediaPage.scss # Social page styles
├── firebase.js              # Firebase configuration
└── App.js                   # Main application router
```

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project setup
- Firebase Firestore database

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/enowuigrek/Miejska-Ankieta.git
cd miejska-ankieta

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with Firebase configuration

# Start development server
npm start
```

### Available Scripts
```bash
npm start          # Start development server (http://localhost:3000)
npm run build      # Create production build
npm test           # Run test suite
npm run export     # Export data from Firebase
npm run stats      # Generate statistics from responses
```

## 🌟 Key Highlights

### **Urban Engagement Innovation**
- **Physical-digital bridge** - QR stickers connect city spaces to digital surveys
- **Community participation** - Residents engage with city-wide questions
- **Social media amplification** - Results shared across platforms
- **Anonymous participation** - Privacy-focused data collection

### **Sample Survey Questions**
- **Food preferences** - "Pizza z ananasem?" (Pineapple on pizza?)
- **Pet preferences** - "Koty czy psy?" (Cats or dogs?)
- **Gaming platforms** - "Gram na..." (I play on...)
- **Local predictions** - City-specific guessing games
- **Lifestyle choices** - Daily habits and preferences

### **Educational Component**
- **29 curated facts** - Interesting knowledge after each survey
- **Diverse topics** - Science, nature, technology, culture
- **Learning motivation** - Education through engagement

### **Technical Innovation**
- **React Router integration** - Dynamic question URLs
- **Firebase real-time sync** - Instant data storage
- **Mobile-first design** - Optimized for smartphone scanning
- **Social media integration** - Community building features

## 📱 Responsive Design

Optimized for QR code scanning devices:
- **Mobile phones** (320px+) - Primary scanning device
- **Tablets** (768px+) - Alternative access method
- **Desktop** (1024px+) - Admin and analysis interface
- **Touch interfaces** - Finger-friendly interactions

## 🎯 Survey Flow

1. **Discovery** - Find QR sticker around Częstochowa
2. **Scan** - Open camera and scan QR code
3. **Navigate** - Redirect to specific question URL
4. **Answer** - Select from multiple choice options
5. **Submit** - Anonymous response stored in Firebase
6. **Learn** - Display random educational fact
7. **Social** - Encourage following for results

## 🏙️ Community Impact

### **Częstochowa Integration**
- **Physical presence** - QR stickers in various city locations
- **Local questions** - City-specific content and references
- **Community building** - Shared experience among residents
- **Social media presence** - @miejska_ankieta across platforms

### **Engagement Strategy**
- **Curiosity-driven** - Questions spark discussion and debate
- **Results transparency** - Aggregated data shared publicly
- **Continuous content** - New questions and locations regularly
- **Community feedback** - Resident suggestions incorporated

## 🔒 Privacy & Data

### **Anonymous Collection**
- **No personal data** - Only question ID and answer stored
- **Timestamp only** - For analytics, not user tracking
- **GDPR compliant** - Minimal data collection approach
- **Secure storage** - Firebase security rules implementation

### **Data Usage**
- **Aggregate statistics** - Community-level insights only
- **Social media sharing** - Anonymous result summaries
- **No individual tracking** - Responses cannot be linked to users
- **Temporary storage** - Data retention policies implemented

## 🌐 Deployment

**Status:** ✅ **LIVE IN PRODUCTION**

- **Hosting:** Netlify
- **Domain:** [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl)
- **SSL:** Active security certificate
- **CDN:** Global content delivery
- **Status:** Fully operational survey system

Ready for deployment on other platforms:
- **Vercel**
- **Firebase Hosting**
- **GitHub Pages**
- **Any static hosting service**

## 📊 Current Status

### **Production System** ✅ **LIVE**
✅ **Survey website** - [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl) - ACTIVE  
✅ **QR code scanning** - Physical stickers deployed in Częstochowa  
✅ **Data collection** - Anonymous responses stored in Firebase  
✅ **Social media presence** - Community engagement channels  
✅ **Mobile optimization** - Smartphone-friendly interface

### **Technical Foundation**
✅ **React architecture** - Component-based frontend  
✅ **Firebase integration** - Real-time database operational  
✅ **SCSS styling** - Maintainable and organized styles  
✅ **Responsive design** - Multi-device compatibility

### **Content Database**
✅ **Question library** - 15+ diverse survey questions  
✅ **Facts database** - 29 educational facts  
✅ **Multi-category content** - Food, lifestyle, technology, local topics

### **Community Engagement**
📈 **Active surveys** - Real responses from Częstochowa residents  
📈 **Social media growth** - Expanding community presence  
📈 **Physical deployment** - QR stickers in city locations

## 📞 Contact

**Project Creator:** [Łukasz Nowak](https://github.com/enowuigrek)  
**City:** Częstochowa, Poland

- **Developer Email:** enowuigrek@gmail.com
- **Project Email:** theLukaszNowak85@gmail.com
- **Phone:** +48 509 266 079
- **Location:** Częstochowa, Poland

### **Social Media - Miejska Ankieta**
- **Instagram:** [@miejska_ankieta](https://www.instagram.com/miejska_ankieta/)
- **Facebook:** [miejska.ankieta](https://www.facebook.com/miejska.ankieta)
- **Twitter:** [@miejska_ankieta](https://twitter.com/miejska_ankieta)

---

## 🏆 Technical Achievements

✅ **Live Community Platform** - [miejska-ankieta.czest.pl](http://miejska-ankieta.czest.pl)  
✅ **Real Urban Engagement** - Physical QR deployment in Częstochowa  
✅ **Anonymous Data Collection** - Privacy-focused survey system  
✅ **Social Media Integration** - Community building and results sharing  
✅ **Educational Component** - Learning through participation  
✅ **Mobile-First Design** - Optimized for smartphone scanning  
✅ **Firebase Real-time Backend** - Scalable data storage  
🚀 **Scalable and Maintainable** - Ready for expansion to other cities

---

Made with ❤️ for urban communities | React + SCSS + Firebase | Częstochowa, Poland 🇵🇱