import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInstagram,
    faFacebook,
    faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import './Home.css';

const Home = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/miejska_ankieta/';
    const facebookLink = 'https://www.facebook.com/miejska.ankieta';
    const twitterLink = 'https://twitter.com/miejska_ankieta';
    const dayNight = isNight ? 'night' : 'day';

    return (
        <div className='home-container'>
            <div className='home-icons-container'>
                <a
                    href={instagramLink}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FontAwesomeIcon
                        icon={faInstagram}
                        className={`fa-icon home-icon-insta ${dayNight}`}
                    />
                </a>
                <a
                    href={facebookLink}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FontAwesomeIcon
                        icon={faFacebook}
                        className={`fa-icon home-icon-fb ${dayNight}`}
                    />
                </a>
                <a href={twitterLink} target='_blank' rel='noopener noreferrer'>
                    <FontAwesomeIcon
                        icon={faTwitter}
                        className={`fa-icon home-icon-twitter ${dayNight}`}
                    />
                </a>
            </div>
            <p>
                Na mieście znajdziesz pytania, na które możesz odpowiedzieć i
                wziąć udział w miejskiej ankiecie skanując QR kod. Ankieta jest
                w pełni anonimowa.
            </p>
            <p>Obserwuj social media, aby śledzić wyniki.</p>
        </div>
    );
};

export default Home;
