import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';
import PageNotFound from './components/PageNotFound';
import SocialMediaPage from './components/SocialMediaPage';
import AdminPanel from './components/AdminPanel';
import './App.scss';

const AppContent = ({ isNight }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname === '/admin';

    return (
        <div className={`App ${isNight ? 'night' : 'day'}`}>
            {isAdminRoute ? (
                <div className='admin-content'>
                    <Routes>
                        <Route path='/admin' element={<AdminPanel isNight={isNight} />} />
                    </Routes>
                </div>
            ) : (
                <div className='main-content'>
                    <div className='brand-zone'>
                        <div className='app-brand-header'>
                            <div className='app-brand-line1'>jak</div>
                            <div className='app-brand-line2'>myślisz</div>
                            <div className='app-brand-line3'><span className='app-brand-q'>?</span></div>
                        </div>
                    </div>
                    <div className='question-zone'>
                        <Routes>
                            <Route path='/' element={<Home isNight={isNight} />} />
                            <Route path='/:questionId' element={<Question isNight={isNight} />} />
                            <Route path='/fact' element={<Fact isNight={isNight} />} />
                            <Route path='/social_media' element={<SocialMediaPage isNight={isNight} />} />
                            <Route path='/404' element={<PageNotFound isNight={isNight} />} />
                            <Route path='*' element={<Navigate replace to='/404' />} />
                        </Routes>
                    </div>
                </div>
            )}
        </div>
    );
};

function App() {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        setIsNight(hour < 6 || hour >= 22);
    }, []);

    return (
        <Router>
            <AppContent isNight={isNight} />
        </Router>
    );
}

export default App;
