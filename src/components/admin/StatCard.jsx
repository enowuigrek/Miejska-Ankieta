import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './StatCard.scss';

const StatCard = ({ icon, title, value, subtitle, className = '' }) => {
    return (
        <div className={`stat-card ${className}`}>
            <div className="stat-icon">
                <FontAwesomeIcon icon={icon} />
            </div>
            <div className="stat-content">
                <h3>{title}</h3>
                <div className="stat-number">{value}</div>
                <div className="stat-subtitle">{subtitle}</div>
            </div>
        </div>
    );
};

StatCard.propTypes = {
    icon: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default StatCard;
