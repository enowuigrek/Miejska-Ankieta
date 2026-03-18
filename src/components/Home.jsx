import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSquareInstagram,
} from '@fortawesome/free-brands-svg-icons';
import './Home.scss';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';

const Home = ({ isNight }) => {
    const dayNight = isNight ? 'night' : 'day';

    return (
        <div className='home-container'>
            <p>
                Znajdź pytanie na mieście, zeskanuj kod i daj znać
                jak myślisz. Spokojnie, nikt nie wie że to Ty.
            </p>

            <div className='social-links'>
                <a href={SOCIAL_MEDIA_LINKS.instagram} target='_blank' rel='noopener noreferrer'>
                    <FontAwesomeIcon icon={faSquareInstagram} className='social-icon' />
                </a>
            </div>
        </div>
    );
};

export default Home;
