import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import './InstagramPage.css';

const InstagramPage = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/TwojProfilNaInstagramie';

    const greetings = [
        'Dzięki za głos! Udanej niedzieli.',
        'Dzięki za głos! Dobrego tygonia Ci życzę!',
        'Dzięki za głos! Udanego wtorku!',
        'Dzięki za głos! Miłej środy!',
        'Dzięki za głos! Dobrego czwartku!',
        'Dzięki za głos! Miłego weekendu!!!',
        'Dzięki za głos! Miłej soboty, baw się dobrze!',
    ];

    const date = new Date();
    const dayOfWeek = date.getDay();

    const greeting = greetings[dayOfWeek];

    return (
        <div className='instagram-page-container'>
            <p>{greeting}</p>
            <a href={instagramLink} target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon
                    icon={faInstagram}
                    className={`fa-icon icon-insta ${isNight ? 'night' : 'day'}`}
                />
            </a>
            <p>Obserwuj, aby śledzić wyniki.</p>
        </div>
    );
};

export default InstagramPage;
