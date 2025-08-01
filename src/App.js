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
import { ReactComponent as Logo } from './assets/images/logo_red.svg';
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
                <Logo
                    className='app-logo'
                    style={{ color: isNight ? '#FFF' : '#000' }}
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
        </Router>
    );
}

export default App;