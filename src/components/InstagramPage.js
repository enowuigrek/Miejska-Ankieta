import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import './InstagramPage.css';

const InstagramPage = () => {
    const instagramLink = 'https://www.instagram.com/TwojProfilNaInstagramie';

    return (
        <div className='instagram-page-container'>
            <p>Życzę Ci dobrego dnia!!</p>
            <a href={instagramLink} target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon
                    icon={faInstagram}
                    className='fa-icon icon-insta'
                />
            </a>
            <p>Obserwuj, aby śledzić wyniki.</p>
        </div>
    );
};

export default InstagramPage;
