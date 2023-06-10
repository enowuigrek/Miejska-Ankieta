import React, { useEffect, useState } from 'react';
import { FACTS_DATA } from '../data/factsData';

const Fact = () => {
    const [fact, setFact] = useState('');

    useEffect(() => {
        const randomFact = FACTS_DATA[Math.floor(Math.random() * FACTS_DATA.length)];
        setFact(randomFact);
    }, []);

    return (
        <div className='fact-container'>
            <p className='fact-text'>{fact}</p>
        </div>
    );
};

export default Fact;
