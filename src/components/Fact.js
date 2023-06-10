import React, { useEffect, useState } from 'react';
import './Fact.css';
import { FACTS_DATA } from '../data/factsData';
import { Link } from 'react-router-dom';

const Fact = () => {
    const [fact, setFact] = useState('');

    useEffect(() => {
        const randomFact =
            FACTS_DATA[Math.floor(Math.random() * FACTS_DATA.length)];
        setFact(randomFact);
    }, []);

    return (
        <div className='fact-container'>
            <p className='fact-text'>{fact}</p>
            <Link to='/instagram'>
                <button className='next'></button>
            </Link>
        </div>
    );
};

export default Fact;
