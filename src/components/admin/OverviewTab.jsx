import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import TrendIndicator from './TrendIndicator';
import './OverviewTab.scss';

const DARK = 'rgb(69, 69, 69)';
const ACCENT = '#FF2323';
const FONT = "'Urbanist', sans-serif";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className='chart-tooltip'>
            <p className='chart-tooltip-label'>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }}>
                    {entry.name}: <strong>{entry.value}</strong>
                </p>
            ))}
        </div>
    );
};

const PERIODS = [
    { id: '1d',  label: '1 dzień'  },
    { id: '7d',  label: '7 dni'    },
    { id: '30d', label: '30 dni'   },
    { id: 'all', label: 'wszystko' },
];

const groupByWeek = (days) => {
    const map = {};
    days.forEach(d => {
        const date = new Date(d.fullDate + 'T12:00:00');
        const dow = (date.getDay() + 6) % 7; // Mon=0
        const mon = new Date(date);
        mon.setDate(date.getDate() - dow);
        const key = `${String(mon.getDate()).padStart(2,'0')}.${String(mon.getMonth()+1).padStart(2,'0')}`;
        if (!map[key]) map[key] = { date: key, scans: 0, answers: 0 };
        map[key].scans += d.scans;
        map[key].answers += d.answers;
    });
    return Object.values(map);
};

const groupByMonth = (days) => {
    const map = {};
    days.forEach(d => {
        const date = new Date(d.fullDate + 'T12:00:00');
        const key = date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
        if (!map[key]) map[key] = { date: key, scans: 0, answers: 0 };
        map[key].scans += d.scans;
        map[key].answers += d.answers;
    });
    return Object.values(map);
};

const PAIR_TIMEOUT = 120000; // 2min

const pairScansWithAnswers = (scans, answers, questions, socialClicks = []) => {
    const usedAnswerIds = new Set();
    const sortedScans = [...scans].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const sortedAnswers = [...answers].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return sortedScans.map(scan => {
        const scanTime = new Date(scan.timestamp).getTime();
        const match = sortedAnswers.find(a =>
            !usedAnswerIds.has(a.id) &&
            a.questionId === scan.questionId &&
            Math.abs(new Date(a.timestamp).getTime() - scanTime) < PAIR_TIMEOUT
        );

        if (match) usedAnswerIds.add(match.id);

        // Find social clicks within 2 min of scan (scan → answer → social)
        const socialWindow = 120000;
        const matchedSocials = socialClicks.filter(sc =>
            sc.questionId === scan.questionId &&
            Math.abs(new Date(sc.timestamp).getTime() - scanTime) < socialWindow
        ).map(sc => sc.type);

        const q = questions?.[scan.questionId];
        const answerLabel = match
            ? (q?.options?.find(o => o.id === match.answer)?.label || match.answer)
            : null;

        return {
            id: scan.id,
            questionId: scan.questionId,
            questionText: q?.questionText || scan.questionId,
            timestamp: scan.timestamp,
            location: scan.location || null,
            answered: !!match,
            answerLabel,
            answerTimestamp: match?.timestamp || null,
            socials: [...new Set(matchedSocials)],
            revisit: !!scan.revisit,
        };
    });
};

const formatDateTime = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `dziś ${time}`;
    if (isYesterday) return `wczoraj ${time}`;
    return `${d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} ${time}`;
};

const OverviewTab = ({ stats, scans = [], answers = [], socialClicks = [], onGoToPrinted }) => {
    const { questions } = useData();
    const [period, setPeriod] = useState('7d');
    const [detailView, setDetailView] = useState(null); // null | 'scans' | 'answers' | 'social'
    const [scanFilter, setScanFilter] = useState('all'); // 'all' | 'answered' | 'unanswered'
    const printedCount = questions
        ? Object.values(questions).filter(q => q.printed).length
        : 0;

    const chartData = useMemo(() => {
        if (!stats) return [];
        if (period === '1d') return stats.hourlyActivity1d || [];
        if (period === '7d') return stats.dailyActivity7d || [];
        if (period === '30d') return groupByWeek(stats.dailyActivity30d || []);
        return groupByMonth(stats.dailyActivityAll || []);
    }, [period, stats]);

    if (!stats) {
        return (
            <div className='tab-empty'>
                <p>Brak danych — naklejki jeszcze nie są aktywne.</p>
            </div>
        );
    }

    const { totalScans, totalAnswers, totalRevisits, conversion, activeLocations, totalStickers, totalSocialClicks, instagramClicks, facebookClicks, weekTrend, hourlyActivity } = stats;

    const axisStyle = { fontFamily: FONT, fontSize: 11, fill: DARK, opacity: 0.6 };

    return (
        <div className='overview-tab'>
            {/* KPI Cards */}
            <div className='kpi-grid'>
                <button type='button' className={`kpi-card kpi-card--link${detailView === 'scans' ? ' kpi-card--active' : ''}`}
                    onClick={() => { setDetailView(detailView === 'scans' ? null : 'scans'); setScanFilter('all'); }}>
                    <div className='kpi-number'>{totalScans}</div>
                    <div className='kpi-label'>skanów łącznie</div>
                </button>
                <button type='button' className={`kpi-card kpi-card--link${detailView === 'answers' ? ' kpi-card--active' : ''}`}
                    onClick={() => { setDetailView(detailView === 'answers' ? null : 'answers'); setScanFilter('answered'); }}>
                    <div className='kpi-number'>{totalAnswers}</div>
                    <div className='kpi-label'>odpowiedzi łącznie</div>
                </button>
                <div className='kpi-card accent'>
                    <div className='kpi-number'>{conversion}%</div>
                    <div className='kpi-label'>konwersja skan→głos</div>
                </div>
                <button type='button' className={`kpi-card kpi-card--link${detailView === 'scans' && scanFilter === 'revisit' ? ' kpi-card--active' : ''}`}
                    onClick={() => { setDetailView(detailView === 'scans' && scanFilter === 'revisit' ? null : 'scans'); setScanFilter('revisit'); }}>
                    <div className='kpi-number'>{totalRevisits || 0}</div>
                    <div className='kpi-label'>ponownych skanów</div>
                </button>
                <div className='kpi-card'>
                    <div className='kpi-number'>{activeLocations}</div>
                    <div className='kpi-label'>aktywnych lokalizacji</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-number'>{totalStickers || 0}</div>
                    <div className='kpi-label'>naklejek rozklejonych</div>
                </div>
                <button type='button' className={`kpi-card kpi-card--link${detailView === 'social' ? ' kpi-card--active' : ''}`}
                    onClick={() => setDetailView(detailView === 'social' ? null : 'social')}>
                    <div className='kpi-number'>{totalSocialClicks || 0}</div>
                    <div className='kpi-label'>
                        kliknięć social
                        <span className='kpi-sub'>IG {instagramClicks || 0} · FB {facebookClicks || 0}</span>
                    </div>
                </button>
                <button type='button' className='kpi-card kpi-card--link' onClick={onGoToPrinted}>
                    <div className='kpi-number'>{printedCount}</div>
                    <div className='kpi-label'>wydrukowanych pytań →</div>
                </button>
            </div>

            {/* Scan/Answer detail list */}
            {(detailView === 'scans' || detailView === 'answers') && (() => {
                const paired = pairScansWithAnswers(scans, answers, questions, socialClicks);
                const effectiveFilter = detailView === 'answers' ? 'answered' : scanFilter;
                const filtered = effectiveFilter === 'all'
                    ? paired.filter(s => !s.revisit)
                    : effectiveFilter === 'answered'
                        ? paired.filter(s => s.answered && !s.revisit)
                        : effectiveFilter === 'unanswered'
                            ? paired.filter(s => !s.answered && !s.revisit)
                            : effectiveFilter === 'revisit'
                                ? paired.filter(s => s.revisit)
                                : paired;

                return (
                    <section className='overview-section scan-detail'>
                        <div className='section-title-row'>
                            <h3 className='section-title'>
                                {detailView === 'answers' ? 'odpowiedzi' : 'skany'}
                            </h3>
                            <button type='button' className='scan-detail-close' onClick={() => setDetailView(null)}>✕</button>
                        </div>

                        {detailView === 'scans' && (
                            <div className='scan-filters'>
                                {[
                                    { id: 'all', label: 'wszystkie' },
                                    { id: 'answered', label: 'odpowiedziane' },
                                    { id: 'unanswered', label: 'bez odpowiedzi' },
                                    { id: 'revisit', label: 'ponowne' },
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        type='button'
                                        className={`scan-filter-btn${scanFilter === f.id ? ' active' : ''}`}
                                        onClick={() => setScanFilter(f.id)}
                                    >{f.label}</button>
                                ))}
                            </div>
                        )}

                        {filtered.length === 0 ? (
                            <div className='scan-detail-empty'>Brak wyników</div>
                        ) : (
                            <div className='scan-detail-list'>
                                {filtered.map(s => (
                                    <div key={s.id} className={`scan-detail-item${s.answered ? ' answered' : ' unanswered'}`}>
                                        <div className='scan-detail-icon'>{s.revisit ? '🔄' : s.answered ? '✅' : '👀'}</div>
                                        <div className='scan-detail-body'>
                                            <div className='scan-detail-question'>{s.questionText}</div>
                                            <div className='scan-detail-meta'>
                                                {formatDateTime(s.timestamp)}
                                                {s.location && <> · 📍 {s.location}</>}
                                            </div>
                                            {s.answered && (
                                                <div className='scan-detail-answer'>→ {s.answerLabel}</div>
                                            )}
                                            {s.socials.length > 0 && (
                                                <div className='scan-detail-social'>
                                                    {s.socials.includes('instagram') && <span>📸 IG</span>}
                                                    {s.socials.includes('facebook') && <span>👤 FB</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })()}

            {/* Social clicks detail list */}
            {detailView === 'social' && (() => {
                const sortedClicks = [...socialClicks].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

                // Pair each social click with its scan (within 2 min)
                const enriched = sortedClicks.map(click => {
                    const clickTime = new Date(click.timestamp).getTime();
                    const matchedScan = scans.find(s =>
                        s.questionId === click.questionId &&
                        Math.abs(new Date(s.timestamp).getTime() - clickTime) < 120000
                    );
                    const q = questions?.[click.questionId];
                    return {
                        ...click,
                        questionText: q?.questionText || click.questionId,
                        scanLocation: matchedScan?.location || null,
                    };
                });

                return (
                    <section className='overview-section scan-detail'>
                        <div className='section-title-row'>
                            <h3 className='section-title'>kliknięcia social</h3>
                            <button type='button' className='scan-detail-close' onClick={() => setDetailView(null)}>✕</button>
                        </div>

                        {enriched.length === 0 ? (
                            <div className='scan-detail-empty'>Brak kliknięć</div>
                        ) : (
                            <div className='scan-detail-list'>
                                {enriched.map(c => (
                                    <div key={c.id} className='scan-detail-item answered'>
                                        <div className='scan-detail-icon'>
                                            {c.type === 'instagram' ? '📸' : '👤'}
                                        </div>
                                        <div className='scan-detail-body'>
                                            <div className='scan-detail-question'>{c.questionText}</div>
                                            <div className='scan-detail-meta'>
                                                {formatDateTime(c.timestamp)}
                                                {c.scanLocation && <> · 📍 {c.scanLocation}</>}
                                            </div>
                                            <div className='scan-detail-answer'>
                                                {c.type === 'instagram' ? 'Instagram' : 'Facebook'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })()}

            {/* Week trend */}
            <section className='overview-section'>
                <div className='section-title-row'>
                    <h3 className='section-title'>tydzień do tygodnia</h3>
                </div>
                <div className='trend-grid'>
                    <TrendIndicator
                        label='skany'
                        current={weekTrend.scans.current}
                        change={weekTrend.scans.change}
                    />
                    <TrendIndicator
                        label='odpowiedzi'
                        current={weekTrend.answers.current}
                        change={weekTrend.answers.change}
                    />
                    <TrendIndicator
                        label='konwersja'
                        current={weekTrend.conversion.current}
                        change={weekTrend.conversion.change}
                        isPercent
                        rawChange
                    />
                    {weekTrend.social && weekTrend.social.current > 0 && (
                        <TrendIndicator
                            label='social'
                            current={weekTrend.social.current}
                            change={weekTrend.social.change}
                        />
                    )}
                </div>
            </section>

            {/* Daily activity chart */}
            <section className='overview-section'>
                <div className='section-title-row'>
                    <h3 className='section-title'>aktywność</h3>
                    <div className='period-btns'>
                        {PERIODS.map(p => (
                            <button
                                key={p.id}
                                type='button'
                                className={`period-btn${period === p.id ? ' active' : ''}`}
                                onClick={() => setPeriod(p.id)}
                            >{p.label}</button>
                        ))}
                    </div>
                </div>
                <div className='chart-wrap'>
                    <ResponsiveContainer width='100%' height={220}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap='30%' barGap={2}>
                            <CartesianGrid strokeDasharray='3 3' stroke='rgba(69,69,69,0.1)' vertical={false} />
                            <XAxis dataKey='date' tick={axisStyle} tickLine={false} axisLine={false} interval='preserveStartEnd' />
                            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} />
                            <Bar dataKey='scans' name='skany' fill={DARK} fillOpacity={0.35} isAnimationActive={false} />
                            <Bar dataKey='answers' name='odpowiedzi' fill={ACCENT} fillOpacity={0.8} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Hourly chart */}
            {hourlyActivity.length > 0 && (
                <section className='overview-section'>
                    <h3 className='section-title'>godziny aktywności</h3>
                    <div className='chart-wrap'>
                        <ResponsiveContainer width='100%' height={180}>
                            <BarChart data={hourlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray='3 3' stroke='rgba(69,69,69,0.1)' vertical={false} />
                                <XAxis dataKey='hour' tick={axisStyle} tickLine={false} axisLine={false} />
                                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey='count'
                                    name='skany'
                                    fill={DARK}
                                    radius={0}
                                    isAnimationActive={false}
                                    label={false}
                                >
                                    {hourlyActivity.map((entry, index) => (
                                        <rect
                                            key={`bar-${index}`}
                                            fill={entry.isPeak ? ACCENT : DARK}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}
        </div>
    );
};

export default OverviewTab;
