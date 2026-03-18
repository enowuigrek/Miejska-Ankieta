import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './Question.scss';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram, faSquareFacebook } from '@fortawesome/free-brands-svg-icons';
import { faArrowUpFromBracket, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';
import ShareCard from './ShareCard';
import { DEMO_RESULTS } from '../demo/mockData';

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

const Question = ({ isNight, onResultsView, demoMode = false }) => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);
    const [view, setView] = useState('question');
    const [results, setResults] = useState(null);
    const [fact, setFact] = useState('');
    const [loading, setLoading] = useState(false);
    const [prevAnswer, setPrevAnswer] = useState(null);
    const [barsVisible, setBarsVisible] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [textInputActive, setTextInputActive] = useState(false);
    const [textError, setTextError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const debounceRef = React.useRef(null);
    const timerRef = React.useRef(null);
    const textInputRef = React.useRef(null);
    const scanRecorded = React.useRef(false);
    const shareRef = React.useRef(null);
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

    // Zapis skanu (raz na sesję — nie nabijaj przy odświeżeniu; w demo pomijamy)
    useEffect(() => {
        if (!questionData) return;
        if (demoMode) return;
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
    // W demo: sessionStorage, żeby każda sesja startowała od nowa
    useEffect(() => {
        if (!questionData) return;
        const voted = demoMode
            ? sessionStorage.getItem(`demo_voted_${questionId}`)
            : localStorage.getItem(`voted_${questionId}`);
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

    // Pobierz dynamiczne opcje z bazy dla pytań allowText
    useEffect(() => {
        if (!questionData?.allowText || demoMode) return;
        const fetchDynamic = async () => {
            try {
                const q = query(collection(db, "answers"), where("questionId", "==", questionId));
                const snapshot = await getDocs(q);
                const counts = {};
                snapshot.forEach(doc => {
                    const ans = doc.data().answer;
                    if (ans && ans !== 'inne') counts[ans] = (counts[ans] || 0) + 1;
                });
                const knownIds = new Set(questionData.options.map(o => o.id));
                const extras = Object.entries(counts)
                    .filter(([key]) => !knownIds.has(key))
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([key]) => ({ id: key, label: key }));
                setDynamicOptions(extras);
            } catch (err) {
                console.error('Error fetching dynamic options:', err);
            }
        };
        fetchDynamic();
    }, [questionId, questionData]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (onResultsView) onResultsView(false);
        };
    }, []);

    // Ładowanie danych z Firestore
    if (questions === null) return null;
    if (!questionData)      return null;

    const fetchSuggestions = (value) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!value || value.trim().length < 2) { setSuggestions([]); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch('/.netlify/functions/placesAutocomplete', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ input: value }),
                });
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch {
                setSuggestions([]);
            }
        }, 300);
    };

    const handleSuggestionSelect = async (suggestion) => {
        setSuggestions([]);
        setTextInputActive(false);
        setTextError('');
        await submitAnswer(suggestion.name, suggestion.name, suggestion.address || null, suggestion.placeId || null);
    };

    const normalizeAnswer = async (rawText) => {
        const knownOptions = questionData.options
            .filter(o => o.type !== 'text')
            .map(o => o.id);
        try {
            const res = await fetch('/.netlify/functions/normalizeAnswer', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ rawAnswer: rawText, knownOptions }),
            });
            const data = await res.json();
            if (data.error === 'not_a_place') return null; // moderacja
            return { canonical: data.canonical || rawText, address: data.address || null };
        } catch {
            return { canonical: rawText, address: null };
        }
    };

    const fetchResults = async () => {
        // Demo: gotowe wyniki bez Firestore
        if (demoMode) {
            const mockResults = DEMO_RESULTS[questionId] || questionData.options.map(o => ({ label: o.label, percent: 0 }));
            const factsPool   = (facts || []).filter(f => f.active !== false);
            const factIdx     = questionId.charCodeAt(0) % (factsPool.length || 1);
            setResults(mockResults);
            setFact(factsPool[factIdx]?.text || '');
            setView('results');
            if (onResultsView) onResultsView(true);
            return;
        }

        try {
            const q = query(collection(db, "answers"), where("questionId", "==", questionId));
            const snapshot = await getDocs(q);
            const counts = {};
            const placeIds = {};
            snapshot.forEach(doc => {
                const { answer: ans, placeId } = doc.data();
                counts[ans] = (counts[ans] || 0) + 1;
                if (placeId && !placeIds[ans]) placeIds[ans] = placeId;
            });
            const total = Object.values(counts).reduce((a, b) => a + b, 0);

            // Fallback placeId z definicji opcji (gdy opcja ma placeId ale stare answery go nie mają)
            const optionPlaceIds = {};
            questionData.options.forEach(o => { if (o.placeId) optionPlaceIds[o.id] = o.placeId; });

            // Dla pytań z allowText: pokaż wszystkie zgrupowane canonical values
            const computed = questionData.allowText
                ? Object.entries(counts)
                    .map(([key, count]) => ({
                        label: key,
                        percent: total > 0 ? Math.round((count / total) * 100) : 0,
                        ...((placeIds[key] || optionPlaceIds[key]) && { placeId: placeIds[key] || optionPlaceIds[key] }),
                    }))
                    .sort((a, b) => b.percent - a.percent)
                : questionData.options.map(opt => ({
                    label: opt.label,
                    percent: total > 0 ? Math.round(((counts[opt.id] || 0) / total) * 100) : 0,
                }));

            const allFacts = facts || [];
            const activeFacts = allFacts.filter(f => f.active !== false);
            const factsPool = activeFacts.length > 0 ? activeFacts : allFacts;
            const factKey = `fact_${questionId}`;
            const storedFactIdx = localStorage.getItem(factKey);
            const storedIdx = storedFactIdx !== null ? parseInt(storedFactIdx) : null;
            const factIdx = storedIdx !== null && storedIdx < factsPool.length
                ? storedIdx
                : Math.floor(Math.random() * (factsPool.length || 1));
            if (storedFactIdx === null) localStorage.setItem(factKey, factIdx);
            const randomFact = factsPool[factIdx]?.text || '';
            setResults(computed);
            setFact(randomFact);
            setView('results');
            if (onResultsView) onResultsView(true);
        } catch (err) {
            console.error("Error fetching results:", err);
        }
    };

    const trackSocialClick = (type) => {
        if (demoMode) return;
        addDoc(collection(db, "socialClicks"), {
            type,
            questionId,
            timestamp: new Date().toISOString(),
            ...(location && { location }),
        }).catch(() => {});
    };

    const submitAnswer = async (answerId, rawText = null, address = null, placeId = null) => {
        if (loading) return;

        setLoading(true);
        try {
            if (demoMode) {
                sessionStorage.setItem(`demo_voted_${questionId}`, answerId);
            } else {
                await addDoc(collection(db, "answers"), {
                    questionId,
                    answer: answerId,
                    ...(rawText && { raw: rawText }),
                    ...(address && { address }),
                    ...(placeId && { placeId }),
                    timestamp: new Date().toISOString(),
                    ...(location && { location }),
                });
                localStorage.setItem(`voted_${questionId}`, answerId);
            }
            setPrevAnswer(answerId);
            await fetchResults();
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        const raw = textValue.trim();
        if (!raw || loading) return;
        setTextError('');
        setLoading(true);

        if (demoMode) {
            setLoading(false);
            setTextInputActive(false);
            await submitAnswer(raw, raw);
            return;
        }

        const result = await normalizeAnswer(raw);
        setLoading(false);

        if (result === null) {
            setTextError('wpisz nazwę prawdziwego lokalu');
            return;
        }

        setTextInputActive(false);
        await submitAnswer(result.canonical, raw, result.address);
    };

    const handleOptionClick = (optionId) => {
        if (loading) return;
        setSelectedOption(optionId);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const opt = questionData.options.find(o => o.id === optionId);
            submitAnswer(optionId, null, opt?.address || null, opt?.placeId || null);
        }, AUTO_SUBMIT_DELAY);
    };

    const handleShare = async () => {
        if (sharing || !shareRef.current) return;
        setSharing(true);
        try {
            await document.fonts.ready;
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(shareRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F3F2F2',
                logging: false,
            });
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'jakmyslisz.png', { type: 'image/png' });
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], url: window.location.href });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'jakmyslisz.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share error:', err);
        } finally {
            setSharing(false);
        }
    };

    if (view === 'results') {
        const greeting = GREETINGS[new Date().getDay()];
        const prevAnswerLabel = prevAnswer
            ? (questionData.options.find(o => o.id === prevAnswer)?.label || prevAnswer)
            : null;

        return (
            <div className='question-container view-results'>
                {/* Poprzednia odpowiedź */}
                {prevAnswerLabel && (
                    <div className='prev-answer-block'>
                        <h2 className={`prev-answer-heading ${isNight ? 'night' : 'day'}`}>moja odpowiedź</h2>
                        <div className={`prev-answer-value ${isNight ? 'night' : 'day'}`}>{prevAnswerLabel}</div>
                    </div>
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
                            {r.placeId && (
                                <a
                                    className='result-maps-link'
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.label)}&query_place_id=${r.placeId}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    idę tam
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                <h2 className={`fact-header ${isNight ? 'night' : 'day'}`}>a czy wiesz, że...</h2>
                <p className='fact-text'>{fact}</p>

                <p className='greeting'>{greeting}</p>

                <button
                    type='button'
                    className='share-btn'
                    onClick={handleShare}
                    disabled={sharing}
                >
                    <FontAwesomeIcon icon={faArrowUpFromBracket} />
                    {sharing ? 'Generuję...' : 'Udostępnij'}
                </button>

                {/* Karta off-screen do html2canvas */}
                <ShareCard
                    ref={shareRef}
                    question={questionData.questionText}
                    results={results}
                    prevAnswerLabel={prevAnswerLabel}
                    location={location}
                />

                {/* Social — fixed na dole */}
                <div className={`social-fixed ${isNight ? 'night' : 'day'}`}>
                    <a href={SOCIAL_MEDIA_LINKS.instagram} target='_blank' rel='noopener noreferrer'
                        onClick={() => trackSocialClick('instagram')}>
                        <FontAwesomeIcon icon={faSquareInstagram} className='social-icon' />
                    </a>
                    <a href={SOCIAL_MEDIA_LINKS.facebook} target='_blank' rel='noopener noreferrer'
                        onClick={() => trackSocialClick('facebook')}>
                        <FontAwesomeIcon icon={faSquareFacebook} className='social-icon' />
                    </a>
                </div>
            </div>
        );
    }

    // Dla allowText: stałe opcje + dynamiczne z bazy + "dodaj" na końcu
    const allOptions = questionData.allowText
        ? [
            ...questionData.options.filter(o => o.type !== 'text'),
            ...dynamicOptions.filter(d => !questionData.options.some(o => o.id === d.id)),
            questionData.options.find(o => o.type === 'text'),
          ].filter(Boolean)
        : questionData.options;

    // Indeks ostatniej opcji bez type:text (dla separatora "czy"); brak dla allowText
    const lastNonTextIdx = questionData.allowText
        ? -1
        : allOptions.reduce((acc, o, i) => (o.type !== 'text' ? i : acc), -1);

    return (
        <div className='question-container'>

            <h1 className={`question-title ${isNight ? 'night' : 'day'}`}>
                {questionData.questionText}
            </h1>
            <div className='options'>
                {allOptions.map((option, index) => (
                    <React.Fragment key={option.id}>
                        {index === lastNonTextIdx && (
                            <div className={`czy-separator ${isNight ? 'night' : 'day'}`}>czy</div>
                        )}
                        {option.type === 'text' ? (
                            textInputActive ? (
                                <div className='text-option-wrapper'>
                                    <div className={`text-option-input ${isNight ? 'night' : 'day'}`}>
                                        <input
                                            ref={textInputRef}
                                            type='text'
                                            className='text-option-field'
                                            placeholder='wpisz nazwę miejsca...'
                                            value={textValue}
                                            onChange={e => { setTextValue(e.target.value); setTextError(''); fetchSuggestions(e.target.value); }}
                                            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                                            autoFocus
                                            maxLength={80}
                                            disabled={loading}
                                        />
                                        <button
                                            type='button'
                                            className='text-option-submit'
                                            onClick={handleTextSubmit}
                                            disabled={!textValue.trim() || loading}
                                        >
                                            {loading ? '...' : 'OK'}
                                        </button>
                                    </div>
                                    {suggestions.length > 0 && (
                                        <ul className='places-dropdown'>
                                            {suggestions.map((s, i) => (
                                                <li
                                                    key={i}
                                                    className='places-dropdown-item'
                                                    onMouseDown={() => handleSuggestionSelect(s)}
                                                >
                                                    <span className='places-name'>{s.name}</span>
                                                    {s.address && <span className='places-address'>{s.address}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {textError && <p className='text-option-error'>{textError}</p>}
                                </div>
                            ) : (
                                <button
                                    type='button'
                                    className={`option-btn ${isNight ? 'night' : 'day'} text-option-btn${loading ? ' disabled' : ''}`}
                                    onClick={() => {
                                        setSelectedOption(option.id);
                                        setTextInputActive(true);
                                    }}
                                    disabled={loading}
                                >
                                    <span className='option-label'>{option.label}</span>
                                </button>
                            )
                        ) : (
                            <button
                                type='button'
                                className={`option-btn ${isNight ? 'night' : 'day'}${selectedOption === option.id ? ' selected' : ''}${loading ? ' disabled' : ''}`}
                                onClick={() => handleOptionClick(option.id)}
                                disabled={loading}
                            >
                                <span className='option-label'>{option.label}</span>
                                <div className='countdown-bar' key={selectedOption === option.id ? 'active' : 'idle'} />
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Question;
