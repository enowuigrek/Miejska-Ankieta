import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Home.css';

const Home = ({ isNight }) => {
    const instagramLink = 'https://www.instagram.com/TwojProfilNaInstagramie';
    const dayNight = isNight ? 'night' : 'day';
    
    return (
        <div className='home-container'>
            <a href={instagramLink} target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faInstagram} className={`fa-icon home-icon-insta ${dayNight}`} />
            </a>
            <p>Na mieście znajdziesz pytania, na które możesz odpowiedzieć i wziąć udział w miejskiej ankiecie.</p>
            <p>Obserwuj profil na Instagramie, aby śledzić wyniki.</p>
        </div>
    );
};

export default Home;