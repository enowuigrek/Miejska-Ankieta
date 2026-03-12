import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QUESTIONS_DATA } from '../data/questionsData';
import { FACTS_DATA } from '../data/factsData';
import './Question.scss';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram, faSquareFacebook } from '@fortawesome/free-brands-svg-icons';

const GREETINGS = [
    'Dzięki za głos! Udanej niedzieli.',
    'Dzięki za głos! Dobrego tygodnia!',
    'Dzięki za głos! Udanego wtorku!',
    'Dzięki za głos! Miłej środy!',
    'Dzięki za głos! Dobrego czwartku!',
    'Dzięki za głos! Miłego weekendu, baw się dobrze!!!',
    'Dzięki za głos! Miłej soboty!',
];

const AUTO_SUBMIT_DELAY = 2000;

const Question = ({ isNight }) => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);
    const [view, setView] = useState('question');
    const [results, setResults] = useState(null);
    const [fact, setFact] = useState('');
    const [loading, setLoading] = useState(false);
    const timerRef = React.useRef(null);
    const { questionId } = useParams();
    const questionData = QUESTIONS_DATA[questionId];

    useEffect(() => {
        if (!questionData) {
            setTimeout(() => {
                navigate('/404', { replace: true });
            }, 0);
        }
    }, [navigate, questionData]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!questionData) {
        return null;
    }

    const submitAnswer = async (answerId) => {
        if (loading) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "answers"), {
                questionId,
                answer: answerId,
                timestamp: new Date().toLocaleString(),
            });

            const q = query(collection(db, "answers"), where("questionId", "==", questionId));
            const snapshot = await getDocs(q);

            const counts = {};
            snapshot.forEach(doc => {
                const ans = doc.data().answer;
                counts[ans] = (counts[ans] || 0) + 1;
            });

            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const computed = questionData.options.map(opt => ({
                label: opt.label,
                percent: Math.round(((counts[opt.id] || 0) / total) * 100),
            }));

            const randomFact = FACTS_DATA[Math.floor(Math.random() * FACTS_DATA.length)];
            setResults(computed);
            setFact(randomFact);
            setView('results');
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionClick = (optionId) => {
        if (loading) return;
        setSelectedOption(optionId);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            submitAnswer(optionId);
        }, AUTO_SUBMIT_DELAY);
    };

    if (view === 'results') {
        const greeting = GREETINGS[new Date().getDay()];
        return (
            <div className='question-container view-results'>
                <h1 className={`question-title ${isNight ? 'night' : 'day'}`}>
                    jak myślą inni
                </h1>
                <div className='results'>
                    {results.map((r, i) => (
                        <div key={i} className='result-row'>
                            <span className='result-label'>{r.label.toUpperCase()}</span>
                            <span className='result-percent'>— {r.percent}%</span>
                        </div>
                    ))}
                </div>

                <h2 className={`fact-header ${isNight ? 'night' : 'day'}`}>a czy wiesz, że...</h2>
                <p className='fact-text'>{fact}</p>

                <p className='greeting'>{greeting}</p>

                <div className='social-links'>
                    <a href='https://www.instagram.com/miejska_ankieta/' target='_blank' rel='noopener noreferrer'>
                        <FontAwesomeIcon icon={faSquareInstagram} className='social-icon' />
                    </a>
                    <a href='https://www.facebook.com/miejska.ankieta' target='_blank' rel='noopener noreferrer'>
                        <FontAwesomeIcon icon={faSquareFacebook} className='social-icon' />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className='question-container'>
            <h1 className={`question-title ${isNight ? 'night' : 'day'}`}>
                {questionData.questionText}
            </h1>
            <div className='options'>
                {questionData.options.map((option) => (
                    <button
                        key={option.id}
                        type='button'
                        className={`option-btn ${isNight ? 'night' : 'day'}${selectedOption === option.id ? ' selected' : ''}${loading ? ' disabled' : ''}`}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={loading}
                    >
                        <span className='option-label'>{option.label}</span>
                        <div className='countdown-bar' key={selectedOption === option.id ? 'active' : 'idle'} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Question;
