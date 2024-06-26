import React, { useEffect, useState } from 'react';
import './Fact.scss';
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
            <Link to='/social_media'>
                <button>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className='fa-icon icon-next'
                    />
                </button>
            </Link>
        </div>
    );
};

export default Fact;
