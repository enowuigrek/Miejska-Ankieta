import React from 'react';
import './TrendIndicator.scss';

const TrendIndicator = ({ label, current, change, isPercent = false, rawChange = false }) => {
    const positive = change > 0;
    const neutral = change === 0;
    const sign = positive ? '+' : '';
    const arrow = neutral ? '→' : positive ? '↑' : '↓';
    const cls = neutral ? 'neutral' : positive ? 'up' : 'down';
    const displayChange = rawChange ? `${sign}${change}pp` : `${sign}${change}%`;

    return (
        <div className='trend-indicator'>
            <div className='trend-label'>{label}</div>
            <div className='trend-value'>{current}{isPercent ? '%' : ''}</div>
            <div className={`trend-change ${cls}`}>
                <span className='trend-arrow'>{arrow}</span>
                <span className='trend-diff'>{neutral ? 'bez zmian' : displayChange} vs poprz. tyg.</span>
            </div>
        </div>
    );
};

export default TrendIndicator;
