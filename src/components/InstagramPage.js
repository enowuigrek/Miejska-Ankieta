import React from 'react';
import './InstagramPage.css';

const InstagramPage = () => {
    return (
        <div className='instagram-page-container'>
            <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png'
                alt='Instagram Logo'
                style={{ width: '100px', height: '100px' }}
            />
            <span>Obserwuj, aby śledzić wyniki</span>
        </div>
    );
};

export default InstagramPage;
