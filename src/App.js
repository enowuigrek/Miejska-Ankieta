import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';
import PageNotFound from './components/PageNotFound';
import SocialMediaPage from './components/SocialMediaPage';
import { ReactComponent as Logo } from './assets/images/logo.svg';
import './App.css';

function App() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 1 || hour > 24);
  }, []);

  return (
    <Router>
      <div className={`App ${isNight ? 'night' : 'day'}`}>
        <Logo className='app-logo' style={{ color: isNight ? '#FFF' : '#000' }} />
        <Routes>
          <Route path='/' element={<Home isNight={isNight} />} />
          <Route path='/:questionId' element={<Question isNight={isNight} />} />
          <Route path='/fact' element={<Fact isNight={isNight} />} />
          <Route path='/social_media' element={<SocialMediaPage isNight={isNight} />} />
          <Route path='/404' element={<PageNotFound isNight={isNight} />} />
          <Route path='*' element={<Navigate replace to="/404" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
