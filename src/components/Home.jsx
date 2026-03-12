import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSquareInstagram,
    faSquareFacebook,
} from '@fortawesome/free-brands-svg-icons';
import './Home.scss';

const Home = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/miejska_ankieta/';
    const facebookLink = 'https://www.facebook.com/miejska.ankieta';
    const dayNight = isNight ? 'night' : 'day';

    return (
        <div className='home-container'>
            <p>
                Na mieście znajdziesz pytania, na które możesz odpowiedzieć
                skanując QR kod. Ankieta jest w pełni anonimowa.
            </p>

            <div className='social-links'>
                <a href={instagramLink} target='_blank' rel='noopener noreferrer'>
                    <FontAwesomeIcon icon={faSquareInstagram} className='social-icon' />
                </a>
                <a href={facebookLink} target='_blank' rel='noopener noreferrer'>
                    <FontAwesomeIcon icon={faSquareFacebook} className='social-icon' />
                </a>
            </div>
        </div>
    );
};

export default Home;
