import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';
import './SocialMediaIcons.scss';

const SocialMediaIcons = ({ isNight, variant = 'default' }) => {
    const dayNight = isNight ? 'night' : 'day';
    const variantClass = variant === 'home' ? 'home-icon' : 'icon';

    return (
        <div className={`social-icons-container ${variant}`}>
            <a
                href={SOCIAL_MEDIA_LINKS.instagram}
                target='_blank'
                rel='noopener noreferrer'
                aria-label="Instagram"
            >
                <FontAwesomeIcon
                    icon={faInstagram}
                    className={`fa-icon ${variantClass}-insta ${dayNight}`}
                />
            </a>
        </div>
    );
};

SocialMediaIcons.propTypes = {
    isNight: PropTypes.bool.isRequired,
    variant: PropTypes.oneOf(['default', 'home'])
};

export default SocialMediaIcons;
