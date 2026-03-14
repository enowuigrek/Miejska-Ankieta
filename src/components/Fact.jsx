import React, { useEffect, useState } from 'react';
import './Fact.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const Fact = () => {
    const [fact, setFact] = useState('');
    const { facts } = useData();

    useEffect(() => {
        if (!facts || facts.length === 0) return;
        let storedFact = sessionStorage.getItem('fact');
        if (!storedFact) {
            storedFact = facts[Math.floor(Math.random() * facts.length)]?.text || '';
            sessionStorage.setItem('fact', storedFact);
        }
        setFact(storedFact);
    }, [facts]);

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
