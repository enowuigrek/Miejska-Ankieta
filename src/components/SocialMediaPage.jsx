import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInstagram,
    faFacebook,
    faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import './SocialMediaPage.css';

const SocialMediaPage = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/miejska_ankieta/';
    const facebookLink = 'https://www.facebook.com/miejska.ankieta';
    const twitterLink = 'https://twitter.com/miejska_ankieta';

    const greetings = [
        'Dzięki za głos! Udanej niedzieli.',
        'Dzięki za głos! Dobrego tygonia!',
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
                <a
                    href={facebookLink}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FontAwesomeIcon
                        icon={faFacebook}
                        className={`fa-icon icon-fb ${
                            isNight ? 'night' : 'day'
                        }`}
                    />
                </a>
                <a href={twitterLink} target='_blank' rel='noopener noreferrer'>
                    <FontAwesomeIcon
                        icon={faXTwitter}
                        className={`fa-icon icon-twitter ${
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
