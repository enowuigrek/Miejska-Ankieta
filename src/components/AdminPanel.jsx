import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { QUESTIONS_DATA } from '../data/questionsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import './AdminPanel.scss';

const AdminPanel = () => {
    const [answers, setAnswers] = useState([]);
    const [scans, setScans] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(answers.length === 0 && scans.length === 0);

            const [answersSnap, scansSnap] = await Promise.all([
                getDocs(collection(db, "answers")),
                getDocs(collection(db, "scans")).catch(() => null),
            ]);

            const answersData = answersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const scansData = scansSnap ? scansSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];

            setAnswers(answersData);
            setScans(scansData);
            generateStats(answersData, scansData);
            setError(null);
        } catch (err) {
            setError('Błąd połączenia: ' + err.message);
            console.error('Firebase error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateStats = (answersData, scansData) => {
        const statsData = {};
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let totalAnswers = 0;
        let weeklyAnswers = 0;
        let totalScans = scansData.length;
        let weeklyScans = 0;

        // Zlicz tygodniowe skany
        scansData.forEach(scan => {
            if (new Date(scan.timestamp) >= lastWeek) weeklyScans++;
            const qid = scan.questionId;
            if (!statsData[qid]) {
                statsData[qid] = {
                    questionText: QUESTIONS_DATA[qid]?.questionText || qid,
                    responses: {},
                    total: 0,
                    scans: 0,
                    locations: {},
                };
            }
            statsData[qid].scans++;
            if (scan.location) {
                statsData[qid].locations[scan.location] = (statsData[qid].locations[scan.location] || 0) + 1;
            }
        });

        // Zlicz odpowiedzi
        answersData.forEach(answer => {
            const { questionId, answer: response, timestamp } = answer;
            if (new Date(timestamp) >= lastWeek) weeklyAnswers++;

            if (!statsData[questionId]) {
                statsData[questionId] = {
                    questionText: QUESTIONS_DATA[questionId]?.questionText || questionId,
                    responses: {},
                    total: 0,
                    scans: 0,
                    locations: {},
                };
            }

            if (!statsData[questionId].responses[response]) {
                statsData[questionId].responses[response] = 0;
            }
            statsData[questionId].responses[response]++;
            statsData[questionId].total++;
            totalAnswers++;
        });

        // Oblicz procenty
        Object.keys(statsData).forEach(qid => {
            const q = statsData[qid];
            Object.keys(q.responses).forEach(r => {
                const count = q.responses[r];
                q.responses[r] = {
                    count,
                    percentage: q.total > 0 ? ((count / q.total) * 100).toFixed(1) : '0',
                };
            });
        });

        statsData._totalAnswers = totalAnswers;
        statsData._totalScans = totalScans;
        statsData._weeklyAnswers = weeklyAnswers;
        statsData._weeklyScans = weeklyScans;
        statsData._questionsCount = Object.keys(statsData).filter(k => !k.startsWith('_')).length;
        statsData._conversion = totalScans > 0 ? Math.round((totalAnswers / totalScans) * 100) : 0;

        setStats(statsData);
    };

    const getFilteredStats = () => {
        if (selectedQuestion === 'all') return stats;
        return { [selectedQuestion]: stats[selectedQuestion] };
    };

    const questionKeys = Object.keys(stats).filter(k => !k.startsWith('_'));

    if (loading) {
        return (
            <div className='admin-dashboard'>
                <div className='loading-screen'>
                    <div className='loading-spinner' />
                    <p>Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='admin-dashboard'>
                <div className='error-screen'>
                    <p>{error}</p>
                    <button onClick={fetchData}>Spróbuj ponownie</button>
                </div>
            </div>
        );
    }

    const filteredStats = getFilteredStats();
    const filteredKeys = Object.keys(filteredStats).filter(k => !k.startsWith('_'));

    return (
        <div className='admin-dashboard'>
            <header className='admin-header'>
                <div className='admin-brand'>
                    Jak Myślisz<span className='brand-q'>?</span>
                    <span className='admin-label'>admin</span>
                </div>
                <button
                    onClick={fetchData}
                    className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
                    disabled={refreshing}
                >
                    <FontAwesomeIcon icon={faRefresh} />
                    {refreshing ? 'Odświeżam...' : 'Odśwież'}
                </button>
            </header>

            {/* Karty statystyk */}
            <div className='stats-grid'>
                <div className='stat-card'>
                    <div className='stat-number'>{stats._totalScans || 0}</div>
                    <div className='stat-label'>skanów łącznie</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-number'>{stats._totalAnswers || 0}</div>
                    <div className='stat-label'>odpowiedzi łącznie</div>
                </div>
                <div className='stat-card accent'>
                    <div className='stat-number'>{stats._conversion || 0}%</div>
                    <div className='stat-label'>konwersja skan→głos</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-number'>{stats._weeklyScans || 0}</div>
                    <div className='stat-label'>skanów (7 dni)</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-number'>{stats._weeklyAnswers || 0}</div>
                    <div className='stat-label'>odpowiedzi (7 dni)</div>
                </div>
                <div className='stat-card'>
                    <div className='stat-number'>{stats._questionsCount || 0}</div>
                    <div className='stat-label'>aktywnych pytań</div>
                </div>
            </div>

            {/* Filtr */}
            <div className='admin-controls'>
                <select
                    value={selectedQuestion}
                    onChange={e => setSelectedQuestion(e.target.value)}
                    className='filter-select'
                >
                    <option value='all'>Wszystkie pytania ({questionKeys.length})</option>
                    {questionKeys.map(qid => (
                        <option key={qid} value={qid}>
                            {QUESTIONS_DATA[qid]?.questionText || qid} ({stats[qid]?.total || 0})
                        </option>
                    ))}
                </select>
            </div>

            {/* Karty pytań */}
            <div className='questions-list'>
                {filteredKeys.length === 0 && (
                    <div className='no-data'>Brak danych.</div>
                )}
                {filteredKeys.map(qid => {
                    const q = filteredStats[qid];
                    const conversion = q.scans > 0 ? Math.round((q.total / q.scans) * 100) : 0;
                    const locationEntries = Object.entries(q.locations || {}).sort((a, b) => b[1] - a[1]);

                    return (
                        <div key={qid} className='question-card'>
                            <div className='question-card-header'>
                                <h2 className='question-card-title'>{q.questionText}</h2>
                                <div className='question-card-meta'>
                                    <span className='meta-scans'>{q.scans} skanów</span>
                                    <span className='meta-sep'>·</span>
                                    <span className='meta-answers'>{q.total} odpowiedzi</span>
                                    <span className='meta-sep'>·</span>
                                    <span className='meta-conversion'>{conversion}% konwersja</span>
                                </div>
                            </div>

                            {/* Wykresy słupkowe odpowiedzi */}
                            <div className='responses-list'>
                                {Object.entries(q.responses)
                                    .sort(([, a], [, b]) => b.count - a.count)
                                    .map(([response, data]) => (
                                        <div key={response} className='response-row'>
                                            <div className='response-bar-box'>
                                                <div
                                                    className='response-bar-fill'
                                                    style={{ width: `${data.percentage}%` }}
                                                />
                                                <span className='response-label'>{response}</span>
                                            </div>
                                            <div className='response-stats'>
                                                <span className='response-pct'>{data.percentage}%</span>
                                                <span className='response-count'>{data.count}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Lokalizacje */}
                            {locationEntries.length > 0 && (
                                <div className='locations-section'>
                                    <div className='locations-title'>lokalizacje</div>
                                    <div className='locations-list'>
                                        {locationEntries.map(([loc, count]) => (
                                            <span key={loc} className='location-tag'>
                                                {loc} <strong>{count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPanel;
