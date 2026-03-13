import React from 'react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
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

const OverviewTab = ({ stats }) => {
    if (!stats) {
        return (
            <div className='tab-empty'>
                <p>Brak danych — naklejki jeszcze nie są aktywne.</p>
            </div>
        );
    }

    const { totalScans, totalAnswers, conversion, activeLocations, weekTrend, dailyActivity, hourlyActivity } = stats;

    const axisStyle = { fontFamily: FONT, fontSize: 11, fill: DARK, opacity: 0.6 };

    return (
        <div className='overview-tab'>
            {/* KPI Cards */}
            <div className='kpi-grid'>
                <div className='kpi-card'>
                    <div className='kpi-number'>{totalScans}</div>
                    <div className='kpi-label'>skanów łącznie</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-number'>{totalAnswers}</div>
                    <div className='kpi-label'>odpowiedzi łącznie</div>
                </div>
                <div className='kpi-card accent'>
                    <div className='kpi-number'>{conversion}%</div>
                    <div className='kpi-label'>konwersja skan→głos</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-number'>{activeLocations}</div>
                    <div className='kpi-label'>aktywnych lokalizacji</div>
                </div>
            </div>

            {/* Week trend */}
            <section className='overview-section'>
                <h3 className='section-title'>tydzień do tygodnia</h3>
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
                </div>
            </section>

            {/* Daily activity chart */}
            <section className='overview-section'>
                <h3 className='section-title'>aktywność — ostatnie 30 dni</h3>
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
