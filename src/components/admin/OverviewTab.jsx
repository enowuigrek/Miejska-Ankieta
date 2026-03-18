import React, { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar,
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
    { id: '1d',  label: '1 dzień',   key: 'dailyActivity1d'  },
    { id: '7d',  label: '7 dni',     key: 'dailyActivity7d'  },
    { id: '30d', label: '30 dni',    key: 'dailyActivity30d' },
    { id: 'all', label: 'wszystko',  key: 'dailyActivityAll' },
];

const PAIR_TIMEOUT = 60000; // 60s

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
    const [period, setPeriod] = useState('30d');
    const [detailView, setDetailView] = useState(null); // null | 'scans' | 'answers'
    const [scanFilter, setScanFilter] = useState('all'); // 'all' | 'answered' | 'unanswered'
    const printedCount = questions
        ? Object.values(questions).filter(q => q.printed).length
        : 0;

    if (!stats) {
        return (
            <div className='tab-empty'>
                <p>Brak danych — naklejki jeszcze nie są aktywne.</p>
            </div>
        );
    }

    const { totalScans, totalAnswers, conversion, activeLocations, totalStickers, totalSocialClicks, instagramClicks, facebookClicks, weekTrend, hourlyActivity } = stats;
    const activePeriod = PERIODS.find(p => p.id === period);
    const dailyActivity = stats[activePeriod.key] || [];

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
                <div className='kpi-card'>
                    <div className='kpi-number'>{activeLocations}</div>
                    <div className='kpi-label'>aktywnych lokalizacji</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-number'>{totalStickers || 0}</div>
                    <div className='kpi-label'>naklejek rozklejonych</div>
                </div>
                {totalStickers > 0 && (
                    <div className='kpi-card'>
                        <div className='kpi-number'>{totalScans > 0 ? Math.round((totalScans / totalStickers) * 100) : 0}%</div>
                        <div className='kpi-label'>naklejka→skan</div>
                    </div>
                )}
                <div className='kpi-card'>
                    <div className='kpi-number'>{totalSocialClicks || 0}</div>
                    <div className='kpi-label'>
                        kliknięć social
                        <span className='kpi-sub'>IG {instagramClicks || 0} · FB {facebookClicks || 0}</span>
                    </div>
                </div>
                <button type='button' className='kpi-card kpi-card--link' onClick={onGoToPrinted}>
                    <div className='kpi-number'>{printedCount}</div>
                    <div className='kpi-label'>wydrukowanych pytań →</div>
                </button>
            </div>

            {/* Scan detail list */}
            {detailView && (() => {
                const paired = pairScansWithAnswers(scans, answers, questions, socialClicks);
                const effectiveFilter = detailView === 'answers' ? 'answered' : scanFilter;
                const filtered = effectiveFilter === 'all'
                    ? paired
                    : effectiveFilter === 'answered'
                        ? paired.filter(s => s.answered)
                        : paired.filter(s => !s.answered);

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
                                        <div className='scan-detail-icon'>{s.answered ? '✅' : '👀'}</div>
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
                        <AreaChart data={dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id='scanGrad' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor={DARK} stopOpacity={0.15} />
                                    <stop offset='95%' stopColor={DARK} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id='answerGrad' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor={ACCENT} stopOpacity={0.25} />
                                    <stop offset='95%' stopColor={ACCENT} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray='3 3' stroke='rgba(69,69,69,0.1)' vertical={false} />
                            <XAxis dataKey='date' tick={axisStyle} tickLine={false} axisLine={false} interval='preserveStartEnd' />
                            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} />
                            <Area
                                type='monotone'
                                dataKey='scans'
                                name='skany'
                                stroke={DARK}
                                strokeWidth={2}
                                fill='url(#scanGrad)'
                                isAnimationActive={false}
                            />
                            <Area
                                type='monotone'
                                dataKey='answers'
                                name='odpowiedzi'
                                stroke={ACCENT}
                                strokeWidth={2}
                                fill='url(#answerGrad)'
                                isAnimationActive={false}
                            />
                        </AreaChart>
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
