import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import './QuestionCard.scss';

const QuestionCard = ({ questionStats }) => {
    return (
        <div className="question-card">
            <div className="question-header">
                <h3 className="question-title">{questionStats.questionText}</h3>
                <div className="question-meta">
                    <span className="response-count">
                        <FontAwesomeIcon icon={faUsers} />
                        {questionStats.total} odpowiedzi
                    </span>
                </div>
            </div>

            <div className="responses-list">
                {Object.entries(questionStats.responses)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([response, data]) => (
                        <div key={response} className="response-item">
                            <div className="response-header">
                                <span className="response-text">{response}</span>
                                <div className="response-stats">
                                    <span className="response-count">{data.count}</span>
                                    <span className="response-percentage">{data.percentage}%</span>
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${data.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

QuestionCard.propTypes = {
    questionStats: PropTypes.shape({
        questionText: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        responses: PropTypes.objectOf(
            PropTypes.shape({
                count: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired
            })
        ).isRequired
    }).isRequired
};

export default QuestionCard;
