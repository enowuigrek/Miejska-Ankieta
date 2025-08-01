import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';
import PageNotFound from './components/PageNotFound';
import SocialMediaPage from './components/SocialMediaPage';
import logoGrey from './assets/images/logo_grey.svg';
import logoWhite from './assets/images/logo_white.svg';
import './App.scss';

function App() {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        // Poprawiona logika: noc to 22:00 - 06:00
        setIsNight(hour < 6 || hour >= 22);
    }, []);

    return (
        <Router>
            <div className={`App ${isNight ? 'night' : 'day'}`}>
                <div className="main-container">
                    <img
                        src={isNight ? logoWhite : logoGrey}
                        alt="Miejska Ankieta Logo"
                        className='app-logo'
                    />
                    <Routes>
                        <Route path='/' element={<Home isNight={isNight} />} />
                        <Route
                            path='/:questionId'
                            element={<Question isNight={isNight} />}
                        />
                        <Route path='/fact' element={<Fact isNight={isNight} />} />
                        <Route
                            path='/social_media'
                            element={<SocialMediaPage isNight={isNight} />}
                        />
                        <Route
                            path='/404'
                            element={<PageNotFound isNight={isNight} />}
                        />
                        <Route path='*' element={<Navigate replace to='/404' />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;