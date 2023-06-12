import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QUESTIONS_DATA } from '../data/questionsData';
import './Question.css';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const Question = ({ isNight }) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (selectedOption === null) {
            return;
        }
    
        const currentDateTime = new Date(); 
        const formattedDateTime = currentDateTime.toLocaleString(); 
    
        try {
            const docRef = await addDoc(collection(db, "answers"), {
                questionId: questionId,
                answer: selectedOption,
                timestamp: formattedDateTime 
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    
        navigate('/fact');
    };
    
    return (
        <div className='question-container'>
            <h1 className={`question-title ${isNight ? 'night' : 'day'}`}>{questionData.questionText}</h1>
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
                        <FontAwesomeIcon icon={faCheck} className={selectedOption === option.id ? 'check-icon' : 'check-icon hidden'} />
                        <span>{option.label}</span>
                    </label>
                ))}
                <button type='submit'>Odpowiedz</button>
            </form>
        </div>
    );
};

export default Question;
