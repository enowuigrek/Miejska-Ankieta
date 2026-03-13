import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import './LocationsTab.scss';

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

const LocationsTab = ({ stats }) => {
    if (!stats) return <div className='tab-empty'><p>Ładowanie...</p></div>;

    if (!stats.hasData) {
        return (
            <div className='tab-empty locations-no-data'>
                <div className='no-data-icon'>📍</div>
                <p className='no-data-title'>Brak danych lokalizacyjnych</p>
                <p className='no-data-hint'>
                    Dodaj parametr <code>?loc=nazwa</code> do URL-i na naklejkach,<br />
                    żeby śledzić, która lokalizacja działa najlepiej.
                </p>
                <p className='no-data-example'>
                    Przykład: <code>jakmyslisz.com/kawa?loc=rynek</code>
                </p>
            </div>
        );
    }

    const { stats: locationStats, topLocation, bestConversionLoc, totalLocations } = stats;
    const axisStyle = { fontFamily: FONT, fontSize: 11, fill: DARK, opacity: 0.6 };

    return (
        <div className='locations-tab'>
            {/* Summary */}
            <div className='locations-summary'>
                <div className='loc-summary-card'>
                    <div className='loc-summary-number'>{totalLocations}</div>
                    <div className='loc-summary-label'>lokalizacje</div>
                </div>
                {topLocation && (
                    <div className='loc-summary-card'>
                        <div className='loc-summary-number accent'>{topLocation.name}</div>
                        <div className='loc-summary-label'>najwięcej skanów ({topLocation.scans})</div>
                    </div>
                )}
                {bestConversionLoc && (
                    <div className='loc-summary-card'>
                        <div className='loc-summary-number'>{bestConversionLoc.name}</div>
                        <div className='loc-summary-label'>najlepsza konwersja ({bestConversionLoc.conversion}%)</div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <section className='locations-section'>
                <h3 className='section-title'>skany wg lokalizacji</h3>
                <div className='chart-wrap'>
                    <ResponsiveContainer width='100%' height={Math.max(120, locationStats.length * 44)}>
                        <BarChart
                            data={locationStats}
                            layout='vertical'
                            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray='3 3' stroke='rgba(69,69,69,0.1)' horizontal={false} />
                            <XAxis type='number' tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                            <YAxis type='category' dataKey='name' tick={axisStyle} tickLine={false} axisLine={false} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey='scans' name='skany' fill={DARK} radius={0} isAnimationActive={false}>
                                {locationStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? ACCENT : DARK} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Table */}
            <section className='locations-section'>
                <h3 className='section-title'>ranking lokalizacji</h3>
                <div className='locations-table-wrap'>
                    <table className='locations-table'>
                        <thead>
                            <tr>
                                <th>lokalizacja</th>
                                <th>skany</th>
                                <th>odpowiedzi</th>
                                <th>konwersja</th>
                                <th>trend 7d</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locationStats.map((loc, i) => {
                                const trendPositive = loc.trend > 0;
                                const trendNeutral = loc.trend === 0;
                                return (
                                    <tr key={loc.name} className={i === 0 ? 'top-row' : ''}>
                                        <td className='loc-name'>{loc.name}</td>
                                        <td><strong>{loc.scans}</strong></td>
                                        <td>{loc.answers}</td>
                                        <td>
                                            <span className={loc.conversion >= 50 ? 'conv-good' : 'conv-bad'}>
                                                {loc.conversion}%
                                            </span>
                                        </td>
                                        <td className={`trend-cell ${trendNeutral ? 'neutral' : trendPositive ? 'up' : 'down'}`}>
                                            {trendNeutral ? '→' : trendPositive ? `↑ +${loc.trend}%` : `↓ ${loc.trend}%`}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default LocationsTab;
