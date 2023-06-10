import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Question from './components/Question';
import Fact from './components/Fact';

function App() {
    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/:questionId' element={<Question />} />
                    <Route path='/fact' element={<Fact />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
