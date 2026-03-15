import React from 'react';
import './ShareCard.scss';

const ShareCard = React.forwardRef(({ question, results, prevAnswerLabel, location }, ref) => (
    <div className='share-card' ref={ref}>
        <div className='sc-logo'>
            <div className='sc-logo-jak'>jak</div>
            <div className='sc-logo-myslisz'>myślisz<span className='sc-logo-q'>?</span></div>
        </div>

        <div className='sc-divider' />

        <div className='sc-question'>{question}</div>

        <div className='sc-results'>
            {results.map((r, i) => (
                <div key={i} className='sc-result-row'>
                    <div className='sc-bar-wrap'>
                        <div className='sc-bar-fill' style={{ width: `${r.percent}%` }} />
                        <span className='sc-bar-label'>{r.label}</span>
                    </div>
                    <span className='sc-percent'>{r.percent}%</span>
                </div>
            ))}
        </div>

        {prevAnswerLabel && (
            <div className='sc-my-answer'>twoja odpowiedź: <strong>{prevAnswerLabel}</strong></div>
        )}

        {location && (
            <div className='sc-location'>{location.replace(/_/g, ' ')}</div>
        )}

        <div className='sc-spacer' />

        <div className='sc-cta'>Znalazłem vlepę na mieście — oddaj swój głos!</div>

        <div className='sc-divider' />

        <div className='sc-handle'>@jakmyslisz</div>
    </div>
));

ShareCard.displayName = 'ShareCard';
export default ShareCard;
