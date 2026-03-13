import React, { useState, useEffect } from 'react';
import QuestionDetail from './QuestionDetail';
import './QuestionsTab.scss';

const SORT_OPTIONS = [
    { id: 'answers', label: 'odpowiedzi' },
    { id: 'conversion', label: 'konwersja' },
    { id: 'activity', label: 'aktywność' },
];

const STORAGE_KEY = 'admin_printed_questions';

const getPrintedSet = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
};

const savePrintedSet = (set) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};

const QuestionsTab = ({ stats }) => {
    const [sort, setSort] = useState('answers');
    const [expanded, setExpanded] = useState(null);
    const [printed, setPrinted] = useState(getPrintedSet);

    const togglePrinted = (id, e) => {
        e.stopPropagation();
        setPrinted(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            savePrintedSet(next);
            return next;
        });
    };

    if (!stats) return <div className='tab-empty'><p>Ładowanie...</p></div>;

    const { stats: questions } = stats;

    const sorted = [...questions].sort((a, b) => {
        if (sort === 'answers') return b.answers - a.answers;
        if (sort === 'conversion') return b.conversion - a.conversion;
        if (sort === 'activity') {
            const ta = a.latestActivity ? new Date(a.latestActivity) : new Date(0);
            const tb = b.latestActivity ? new Date(b.latestActivity) : new Date(0);
            return tb - ta;
        }
        return 0;
    });

    const withAnswers = sorted.filter(q => q.answers > 0);
    const withoutAnswers = sorted.filter(q => q.answers === 0);

    const printedCount = questions.filter(q => printed.has(q.id)).length;

    const toggleExpand = (id) => {
        setExpanded(prev => prev === id ? null : id);
    };

    const renderRow = (q, grayed = false) => {
        const isOpen = expanded === q.id;
        const isPrinted = printed.has(q.id);
        return (
            <div key={q.id} className={`question-row${isOpen ? ' open' : ''}${grayed ? ' grayed' : ''}`}>
                <div className='question-row-header-wrap'>
                    {isPrinted && (
                        <span className='printed-indicator' title='Wydrukowane'>🖨</span>
                    )}
                    <button
                        type='button'
                        className='question-row-header'
                        onClick={() => toggleExpand(q.id)}
                    >
                        <div className='question-row-text'>
                            <span className='question-row-title'>{q.questionText}</span>
                            {q.dominant && (
                                <span className='question-row-dominant'>{q.dominant.label} {q.dominant.percentage}%</span>
                            )}
                        </div>
                        <div className='question-row-meta'>
                            <span className='meta-item'>
                                <span className='meta-val'>{q.answers}</span>
                                <span className='meta-lbl'>odp.</span>
                            </span>
                            <span className='meta-item'>
                                <span className='meta-val'>{q.scans}</span>
                                <span className='meta-lbl'>skan.</span>
                            </span>
                            <span className='meta-item'>
                                <span className='meta-val'>{q.conversion}%</span>
                                <span className='meta-lbl'>konw.</span>
                            </span>
                            <span className={`expand-arrow${isOpen ? ' open' : ''}`}>›</span>
                        </div>
                    </button>
                </div>
                {isOpen && q.answers > 0 && (
                    <QuestionDetail
                        question={q}
                        isPrinted={isPrinted}
                        onTogglePrinted={(e) => togglePrinted(q.id, e)}
                    />
                )}
                {isOpen && q.answers === 0 && (
                    <div className='question-detail'>
                        <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Brak odpowiedzi na to pytanie.</p>
                        <button
                            type='button'
                            className={`printed-toggle-btn${isPrinted ? ' active' : ''}`}
                            onClick={(e) => togglePrinted(q.id, e)}
                        >
                            {isPrinted ? '🖨 wydrukowane' : '🖨 oznacz jako wydrukowane'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='questions-tab'>
            {/* Sort + printed counter */}
            <div className='questions-sort'>
                <span className='sort-label'>sortuj:</span>
                {SORT_OPTIONS.map(opt => (
                    <button
                        key={opt.id}
                        type='button'
                        className={`sort-btn${sort === opt.id ? ' active' : ''}`}
                        onClick={() => setSort(opt.id)}
                    >
                        {opt.label}
                    </button>
                ))}
                <span className='printed-counter'>
                    🖨 {printedCount}/{questions.length}
                </span>
            </div>

            {/* Questions with answers */}
            <div className='questions-list'>
                {withAnswers.map(q => renderRow(q, false))}
                {withoutAnswers.length > 0 && (
                    <>
                        {withAnswers.length > 0 && <div className='questions-divider'>bez odpowiedzi</div>}
                        {withoutAnswers.map(q => renderRow(q, true))}
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionsTab;
