import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';
import PageNotFound from './components/PageNotFound';
import SocialMediaPage from './components/SocialMediaPage';
import logo from './assets/images/logo.png'; // Zaktualizowana ścieżka do logotypu

function App() {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        setIsNight(hour < 6 || hour > 20);
    }, []);

    return (
        <Router>
            <div className={`App ${isNight ? 'night' : 'day'}`}>
                <img src={logo} alt="Logo Miejska Ankieta" className='app-logo'/>
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
