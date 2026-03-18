import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import './SocialMediaPage.scss';

const SocialMediaPage = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/_jakmyslisz_/';

    const greetings = [
        'Dzięki za głos! Udanej niedzieli.',
        'Dzięki za głos! Dobrego tygodnia!',
        'Dzięki za głos! Udanego wtorku!',
        'Dzięki za głos! Miłej środy!',
        'Dzięki za głos! Dobrego czwartku!',
        'Dzięki za głos! Miłego weekendu, baw się dobrze!!!',
        'Dzięki za głos! Miłej soboty!',
    ];

    const date = new Date();
    const dayOfWeek = date.getDay();

    const greeting = greetings[dayOfWeek];

    return (
        <div className='social-page-container'>
            <p>{greeting}</p>
            <div className='social-icon-container'>
                <a
                    href={instagramLink}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FontAwesomeIcon
                        icon={faInstagram}
                        className={`fa-icon icon-insta ${
                            isNight ? 'night' : 'day'
                        }`}
                    />
                </a>
            </div>
            <p>Obserwuj, aby śledzić wyniki.</p>
        </div>
    );
};

export default SocialMediaPage;
