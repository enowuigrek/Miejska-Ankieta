import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faQrcode } from '@fortawesome/free-solid-svg-icons';
import QRStickerModal from './QRStickerModal';
import './QuestionDetail.scss';

const DARK = 'rgb(69, 69, 69)';
const ACCENT = '#FF2323';
const FONT = "'Urbanist', sans-serif";
const PIE_COLORS = [ACCENT, DARK, 'rgba(69,69,69,0.5)', 'rgba(69,69,69,0.3)', 'rgba(69,69,69,0.15)', '#888'];

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className='chart-tooltip'>
            <p><strong>{payload[0].name}</strong>: {payload[0].value}%</p>
        </div>
    );
};

const QuestionDetail = ({ question, isPrinted, onTogglePrinted }) => {
    const [showQR, setShowQR] = useState(false);
    const { responsesWithPct, locationEntries, timelineData } = question;
    const axisStyle = { fontFamily: FONT, fontSize: 10, fill: DARK, opacity: 0.5 };

    const pieData = responsesWithPct.map(r => ({
        name: r.label,
        value: r.percentage,
    }));

    const hasTimeline = timelineData.some(d => d.count > 0);

    return (
        <div className='question-detail'>
            {/* Response bars + Pie */}
            <div className='detail-charts-row'>
                {/* Bars */}
                <div className='detail-bars'>
                    {responsesWithPct.map(r => (
                        <div key={r.answer} className='detail-response-row'>
                            <div className='detail-bar-box'>
                                <div className='detail-bar-fill' style={{ width: `${r.percentage}%` }} />
                                <span className='detail-bar-label'>{r.label}</span>
                            </div>
                            <div className='detail-bar-stats'>
                                <span className='detail-pct'>{r.percentage}%</span>
                                <span className='detail-count'>{r.count}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pie */}
                {pieData.length > 0 && (
                    <div className='detail-pie'>
                        <ResponsiveContainer width={140} height={140}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey='value'
                                    nameKey='name'
                                    cx='50%'
                                    cy='50%'
                                    outerRadius={60}
                                    innerRadius={28}
                                    isAnimationActive={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Locations */}
            {locationEntries.length > 0 && (
                <div className='detail-locations'>
                    <span className='detail-section-label'>lokalizacje:</span>
                    {locationEntries.map(loc => (
                        <span key={loc.name} className='detail-location-tag'>
                            {loc.name} <strong>{loc.count}</strong>
                        </span>
                    ))}
                </div>
            )}

            {/* Mini timeline */}
            {hasTimeline && (
                <div className='detail-timeline'>
                    <span className='detail-section-label'>aktywność (30 dni)</span>
                    <ResponsiveContainer width='100%' height={80}>
                        <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                            <defs>
                                <linearGradient id='miniGrad' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor={ACCENT} stopOpacity={0.3} />
                                    <stop offset='95%' stopColor={ACCENT} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray='2 2' stroke='rgba(69,69,69,0.08)' vertical={false} />
                            <XAxis dataKey='date' tick={axisStyle} tickLine={false} axisLine={false} interval='preserveStartEnd' />
                            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Area
                                type='monotone'
                                dataKey='count'
                                stroke={ACCENT}
                                strokeWidth={1.5}
                                fill='url(#miniGrad)'
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Akcje: printed + naklejki */}
            <div className='detail-actions'>
                <button
                    type='button'
                    className={`printed-toggle-btn${isPrinted ? ' active' : ''}`}
                    onClick={onTogglePrinted}
                    title={isPrinted ? 'Wydrukowane' : 'Oznacz jako wydrukowane'}
                >
                    <FontAwesomeIcon icon={faPrint} />
                </button>
                <button
                    type='button'
                    className='sticker-btn'
                    onClick={() => setShowQR(true)}
                    title='Naklejki do druku'
                >
                    <FontAwesomeIcon icon={faQrcode} />
                </button>
            </div>

            {showQR && (
                <QRStickerModal
                    questionId={question.id}
                    questionText={question.questionText}
                    options={question.options || []}
                    questionNum={question.number || 0}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
};

export default QuestionDetail;
