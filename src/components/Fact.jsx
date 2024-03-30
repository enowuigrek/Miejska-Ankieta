import React, { useEffect, useState } from 'react';
import './Fact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FACTS_DATA } from '../data/factsData';
import { Link } from 'react-router-dom';

const Fact = () => {
    const [fact, setFact] = useState('');

    useEffect(() => {
        let storedFact = sessionStorage.getItem('fact');
        if (!storedFact) {
            storedFact =
                FACTS_DATA[Math.floor(Math.random() * FACTS_DATA.length)];
            sessionStorage.setItem('fact', storedFact);
        }
        setFact(storedFact);
    }, []);

    return (
        <div className='fact-container'>
            <h1>Czy wiesz, że...</h1>
            <p className='fact-text'>{fact}</p>
            <button className='next'>
                <Link to='/social_media'>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className='fa-icon icon-next'
                    />
                </Link>
            </button>
        </div>
    );
};

export default Fact;
