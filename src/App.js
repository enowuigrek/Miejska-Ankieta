import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';
import InstagramPage from './components/InstagramPage';
import PageNotFound from './components/PageNotFound';

function App() {
    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/:questionId' element={<Question />} />
                    <Route path='/fact' element={<Fact />} />
                    <Route path='/instagram' element={<InstagramPage />} />
                    <Route path='/404' element={<PageNotFound />} />
                    <Route path='*' element={<Navigate replace to="/404" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
