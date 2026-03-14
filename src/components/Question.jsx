import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './Question.scss';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram, faSquareFacebook } from '@fortawesome/free-brands-svg-icons';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';

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

const Question = ({ isNight, onResultsView }) => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);
    const [view, setView] = useState('question');
    const [results, setResults] = useState(null);
    const [fact, setFact] = useState('');
    const [loading, setLoading] = useState(false);
    const [prevAnswer, setPrevAnswer] = useState(null);
    const [barsVisible, setBarsVisible] = useState(false);
    const timerRef = React.useRef(null);
    const scanRecorded = React.useRef(false);
    const { questionId } = useParams();
    const [searchParams] = useSearchParams();
    const location = searchParams.get('loc') || null;
    const { questions, facts } = useData();
    const questionData = questions ? questions[questionId] : undefined;

    useEffect(() => {
        if (questions === null) return; // nadal ładowanie
        if (!questionData) {
            setTimeout(() => { navigate('/404', { replace: true }); }, 0);
        } else {
            document.title = `${questionData.questionText} — jakmyślisz`;
        }
        return () => { document.title = 'jakmyślisz'; };
    }, [navigate, questions, questionData]);

    // Zapis skanu (raz na sesję — nie nabijaj przy odświeżeniu)
    useEffect(() => {
        if (!questionData) return;
        if (scanRecorded.current) return;
        const sessionKey = `scan_${questionId}`;
        if (sessionStorage.getItem(sessionKey)) return; // już zeskanowano w tej sesji
        scanRecorded.current = true;
        sessionStorage.setItem(sessionKey, '1');
        addDoc(collection(db, "scans"), {
            questionId,
            timestamp: new Date().toISOString(),
            ...(location && { location }),
        }).catch(err => console.error("Scan record error:", err));
    }, [questionId, questionData]);

    // Sprawdź czy już głosował — jeśli tak, pokaż wyniki od razu
    useEffect(() => {
        if (!questionData) return;
        const voted = localStorage.getItem(`voted_${questionId}`);
        if (voted) {
            setPrevAnswer(voted);
            fetchResults();
        }
    }, [questionId, questionData]);

    useEffect(() => {
        if (view === 'results') {
            const t = setTimeout(() => setBarsVisible(true), 350);
            return () => clearTimeout(t);
        } else {
            setBarsVisible(false);
        }
    }, [view]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (onResultsView) onResultsView(false);
        };
    }, []);

    // Ładowanie danych z Firestore
    if (questions === null) return null;
    if (!questionData)      return null;

    const fetchResults = async () => {
        try {
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
                percent: total > 0 ? Math.round(((counts[opt.id] || 0) / total) * 100) : 0,
            }));
            const factsArr = facts || [];
            const factKey = `fact_${questionId}`;
            const storedFactIdx = localStorage.getItem(factKey);
            const factIdx = storedFactIdx !== null
                ? parseInt(storedFactIdx)
                : Math.floor(Math.random() * (factsArr.length || 1));
            if (storedFactIdx === null) localStorage.setItem(factKey, factIdx);
            const randomFact = factsArr[factIdx]?.text || '';
            setResults(computed);
            setFact(randomFact);
            setView('results');
            if (onResultsView) onResultsView(true);
        } catch (err) {
            console.error("Error fetching results:", err);
        }
    };

    const submitAnswer = async (answerId) => {
        if (loading) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "answers"), {
                questionId,
                answer: answerId,
                timestamp: new Date().toISOString(),
                ...(location && { location }),
            });

            localStorage.setItem(`voted_${questionId}`, answerId);
            setPrevAnswer(answerId);
            await fetchResults();
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
        const prevAnswerLabel = prevAnswer
            ? questionData.options.find(o => o.id === prevAnswer)?.label
            : null;

        return (
            <div className='question-container view-results'>
                {/* Poprzednia odpowiedź */}
                {prevAnswerLabel && (
                    <p className={`prev-answer-line ${isNight ? 'night' : 'day'}`}>
                        twoja odpowiedź: <strong>{prevAnswerLabel}</strong>
                    </p>
                )}

                <h1 className={`question-title ${isNight ? 'night' : 'day'}`}>
                    jak myślą inni
                </h1>
                <div className='results'>
                    {results.map((r, i) => (
                        <div key={i} className='result-row'>
                            <div className={`result-bar-box ${isNight ? 'night' : 'day'}`}>
                                <div
                                    className='result-bar-fill'
                                    style={{ width: barsVisible ? `${r.percent}%` : '0%' }}
                                />
                                <span className='result-label'>{r.label}</span>
                            </div>
                            <span className='result-percent'>{r.percent}%</span>
                        </div>
                    ))}
                </div>

                <h2 className={`fact-header ${isNight ? 'night' : 'day'}`}>a czy wiesz, że...</h2>
                <p className='fact-text'>{fact}</p>

                <p className='greeting'>{greeting}</p>

                {/* Social — fixed na dole */}
                <div className={`social-fixed ${isNight ? 'night' : 'day'}`}>
                    <a href={SOCIAL_MEDIA_LINKS.instagram} target='_blank' rel='noopener noreferrer'>
                        <FontAwesomeIcon icon={faSquareInstagram} className='social-icon' />
                    </a>
                    <a href={SOCIAL_MEDIA_LINKS.facebook} target='_blank' rel='noopener noreferrer'>
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
                {questionData.options.map((option, index) => (
                    <React.Fragment key={option.id}>
                        {index === questionData.options.length - 1 && (
                            <div className={`czy-separator ${isNight ? 'night' : 'day'}`}>czy</div>
                        )}
                        <button
                            type='button'
                            className={`option-btn ${isNight ? 'night' : 'day'}${selectedOption === option.id ? ' selected' : ''}${loading ? ' disabled' : ''}`}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={loading}
                        >
                            <span className='option-label'>{option.label}</span>
                            <div className='countdown-bar' key={selectedOption === option.id ? 'active' : 'idle'} />
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Question;
