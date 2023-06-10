import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QUESTIONS_DATA } from '../data/questionsData';
import './Question.css';

const Question = () => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);
    const { questionId } = useParams();
    const questionData = QUESTIONS_DATA[questionId];

    useEffect(() => {
        if (!questionData) {
            setTimeout(() => {
                navigate('/404', { replace: true });
            }, 0);
        }
    }, [navigate, questionData]);

    if (!questionData) {
        return null;
    }

    const handleOptionChange = (optionId) => {
        setSelectedOption(optionId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Wybrana opcja:', selectedOption);

        // Przekierowanie do strony "fact"
        navigate('/fact');
    };

    return (
        <div className='question-container'>
            <h1 className='question-title'>{questionData.questionText}</h1>
            <form onSubmit={handleSubmit}>
                {questionData.options.map((option) => (
                    <label className='radio-container' key={option.id}>
                        <input
                            type='radio'
                            name='options'
                            value={option.id}
                            checked={selectedOption === option.id}
                            onChange={() => handleOptionChange(option.id)}
                        />
                        <span className='custom-radio' />
                        {option.label}
                    </label>
                ))}
                <button type='submit'>Odpowiedz</button>
            </form>
        </div>
    );
};

export default Question;
