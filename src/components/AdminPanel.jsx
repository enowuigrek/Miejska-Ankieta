import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { QUESTIONS_DATA } from '../data/questionsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRefresh,
    faChartBar,
    faUsers,
    faQuestionCircle,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import './AdminPanel.scss';

const AdminPanel = ({ isNight }) => {
    const [answers, setAnswers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnswers();
    }, []);

    const fetchAnswers = async () => {
        try {
            setRefreshing(true);
            setLoading(answers.length === 0); // Show loading only on first load

            const querySnapshot = await getDocs(collection(db, "answers"));
            const answersData = [];

            querySnapshot.forEach((doc) => {
                answersData.push({ id: doc.id, ...doc.data() });
            });

            setAnswers(answersData);
            generateStats(answersData);
            setError(null);
        } catch (err) {
            setError('Błąd podczas pobierania danych: ' + err.message);
            console.error('Firebase error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateStats = (answersData) => {
        const statsData = {};
        let totalResponses = 0;
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        let weeklyResponses = 0;

        answersData.forEach((answer) => {
            const { questionId, answer: response, timestamp } = answer;

            // Count weekly responses
            const answerDate = new Date(timestamp);
            if (answerDate >= lastWeek) {
                weeklyResponses++;
            }

            if (!statsData[questionId]) {
                statsData[questionId] = {
                    questionText: QUESTIONS_DATA[questionId]?.questionText || questionId,
                    responses: {},
                    total: 0
                };
            }

            if (!statsData[questionId].responses[response]) {
                statsData[questionId].responses[response] = 0;
            }

            statsData[questionId].responses[response]++;
            statsData[questionId].total++;
            totalResponses++;
        });

        // Add percentages
        Object.keys(statsData).forEach(questionId => {
            const questionStats = statsData[questionId];
            Object.keys(questionStats.responses).forEach(response => {
                const count = questionStats.responses[response];
                questionStats.responses[response] = {
                    count,
                    percentage: ((count / questionStats.total) * 100).toFixed(1)
                };
            });
        });

        statsData._total = totalResponses;
        statsData._weekly = weeklyResponses;
        statsData._questionsCount = Object.keys(statsData).filter(k => !k.startsWith('_')).length;
        setStats(statsData);
    };

    const exportToCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Pytanie,Odpowiedź,Data\n" +
            answers.map(answer =>
                `"${QUESTIONS_DATA[answer.questionId]?.questionText || answer.questionId}","${answer.answer}","${answer.timestamp}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ankieta-odpowiedzi-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFilteredStats = () => {
        if (selectedQuestion === 'all') {
            return stats;
        }
        return { [selectedQuestion]: stats[selectedQuestion], _total: stats._total };
    };

    if (loading) {
        return (
            <div className={`admin-dashboard ${isNight ? 'night' : 'day'}`}>
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <h2>Ładowanie Dashboard...</h2>
                    <p>Pobieranie danych z Firebase...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`admin-dashboard ${isNight ? 'night' : 'day'}`}>
                <div className="error-screen">
                    <FontAwesomeIcon icon={faQuestionCircle} className="error-icon" />
                    <h2>Błąd połączenia</h2>
                    <p>{error}</p>
                    <button onClick={fetchAnswers} className="retry-btn">
                        <FontAwesomeIcon icon={faRefresh} /> Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

    const filteredStats = getFilteredStats();

    return (
        <div className={`admin-dashboard ${isNight ? 'night' : 'day'}`}>
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="header-title">
                        <h1> Admin Dashboard</h1>
                        <span className="subtitle">Częstochowa Survey System</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        onClick={exportToCSV}
                        className="action-btn export-btn"
                        disabled={answers.length === 0}
                        title="Pobierz dane jako CSV"
                    >
                        📥 Export CSV
                    </button>
                    <button
                        onClick={fetchAnswers}
                        className={`action-btn refresh-btn ${refreshing ? 'spinning' : ''}`}
                        disabled={refreshing}
                        title="Odśwież dane z Firebase"
                    >
                        <FontAwesomeIcon icon={faRefresh} />
                        {refreshing ? 'Odświeżanie...' : 'Odśwież'}
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card total-responses">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="stat-content">
                        <h3>Łączne odpowiedzi</h3>
                        <div className="stat-number">{stats._total || 0}</div>
                        <div className="stat-subtitle">Wszystkie ankiety</div>
                    </div>
                </div>

                <div className="stat-card weekly-responses">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="stat-content">
                        <h3>Ostatnie 7 dni</h3>
                        <div className="stat-number">{stats._weekly || 0}</div>
                        <div className="stat-subtitle">Nowe odpowiedzi</div>
                    </div>
                </div>

                <div className="stat-card active-questions">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                    </div>
                    <div className="stat-content">
                        <h3>Aktywne pytania</h3>
                        <div className="stat-number">{stats._questionsCount || 0}</div>
                        <div className="stat-subtitle">Z odpowiedziami</div>
                    </div>
                </div>

                <div className="stat-card engagement-rate">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faChartBar} />
                    </div>
                    <div className="stat-content">
                        <h3>Średnia/pytanie</h3>
                        <div className="stat-number">
                            {stats._questionsCount ? Math.round(stats._total / stats._questionsCount) : 0}
                        </div>
                        <div className="stat-subtitle">Odpowiedzi</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="dashboard-controls">
                <div className="filter-section">
                    <label className="filter-label">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                        Filtruj pytania:
                    </label>
                    <select
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">📊 Wszystkie pytania ({stats._questionsCount || 0})</option>
                        {Object.keys(stats).filter(k => !k.startsWith('_')).map(questionId => (
                            <option key={questionId} value={questionId}>
                                🎯 {QUESTIONS_DATA[questionId]?.questionText || questionId} ({stats[questionId]?.total || 0})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Question Cards */}
            <div className="questions-grid">
                {Object.entries(filteredStats).filter(([key]) => !key.startsWith('_')).map(([questionId, questionStats]) => (
                    <div key={questionId} className="question-card">
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
                                .sort(([,a], [,b]) => b.count - a.count) // Sort by count desc
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
                ))}
            </div>

            {Object.keys(filteredStats).filter(k => !k.startsWith('_')).length === 0 && (
                <div className="no-data">
                    <FontAwesomeIcon icon={faQuestionCircle} className="no-data-icon" />
                    <h3>Brak danych</h3>
                    <p>Nie znaleziono odpowiedzi dla wybranych filtrów.</p>
                    <button onClick={() => setSelectedQuestion('all')} className="show-all-btn">
                        Pokaż wszystkie
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;