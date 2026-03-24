import { useMemo } from 'react';

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const subDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
};

const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
};

// Lokalna data jako YYYY-MM-DD (bez konwersji do UTC)
const localDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const groupByDay = (items, since) => {
    const map = {};
    items.forEach(item => {
        const d = new Date(item.timestamp);
        if (d >= since) {
            const key = localDateKey(d);
            map[key] = (map[key] || 0) + 1;
        }
    });
    return map;
};

const fillDays = (scansByDay, answersByDay, since, until) => {
    const result = [];
    const current = new Date(since);
    while (current <= until) {
        const key = localDateKey(current);
        result.push({
            date: formatDate(current),
            fullDate: key,
            scans: scansByDay[key] || 0,
            answers: answersByDay[key] || 0,
        });
        current.setDate(current.getDate() + 1);
    }
    return result;
};

const useAdminStats = (answers, scans, questions, socialClicks = []) => {
    return useMemo(() => {
        if (!questions) return null;

        const now    = new Date();
        const today  = startOfDay(now);
        const last7  = subDays(today, 7);
        const prev7  = subDays(today, 14);
        const last30 = subDays(today, 30);
        const last1  = subDays(today, 1);

        if (!answers.length && !scans.length) {
            const questionStats = Object.keys(questions).map(qid => ({
                id: qid,
                questionText: questions[qid].questionText,
                options:      questions[qid].options || [],
                number:       questions[qid].number,
                scans: 0, answers: 0, conversion: 0,
                responses: {}, responsesWithPct: [],
                dominant: null, timelineData: [], locationEntries: [],
                latestActivity: null,
            })).sort((a, b) => (a.number || 0) - (b.number || 0));
            return {
                overview: {
                    totalScans: 0, totalAnswers: 0, conversion: 0, activeLocations: 0, totalStickers: 0,
                    weekTrend: {
                        scans:      { current: 0, previous: 0, change: 0 },
                        answers:    { current: 0, previous: 0, change: 0 },
                        conversion: { current: 0, previous: 0, change: 0 },
                    },
                    dailyActivity:    fillDays({}, {}, last30, today),
                    dailyActivity1d:  fillDays({}, {}, last1,  today),
                    dailyActivity7d:  fillDays({}, {}, last7,  today),
                    dailyActivity30d: fillDays({}, {}, last30, today),
                    dailyActivityAll: fillDays({}, {}, last30, today),
                    hourlyActivity: [],
                },
                locations: {
                    stats: [], hasData: false, totalLocations: 0,
                    topLocation: null, bestConversionLoc: null,
                },
                questions: { stats: questionStats, totalQuestions: questionStats.length, withAnswers: 0 },
            };
        }

        // ============ OVERVIEW ============

        // Oddziel ponowne skany od nowych
        const freshScans = scans.filter(s => !s.revisit);
        const revisitScans = scans.filter(s => s.revisit);
        const totalRevisits = revisitScans.length;

        const totalScans = freshScans.length;
        const totalAnswers = answers.length;
        const conversion = totalScans > 0 ? Math.round((totalAnswers / totalScans) * 100) : 0;

        // Unique locations
        const allLocations = new Set();
        freshScans.forEach(s => { if (s.location) allLocations.add(s.location); });
        answers.forEach(a => { if (a.location) allLocations.add(a.location); });
        const activeLocations = allLocations.size;

        // Weekly comparison — tygodnie kalendarzowe (pon-niedz)
        const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
        const thisWeekStart = subDays(today, dayOfWeek); // poniedziałek tego tygodnia
        const prevWeekStart = subDays(thisWeekStart, 7);

        const thisWeekScans = freshScans.filter(s => new Date(s.timestamp) >= thisWeekStart).length;
        const prevWeekScans = freshScans.filter(s => {
            const d = new Date(s.timestamp);
            return d >= prevWeekStart && d < thisWeekStart;
        }).length;
        const thisWeekAnswers = answers.filter(a => new Date(a.timestamp) >= thisWeekStart).length;
        const prevWeekAnswers = answers.filter(a => {
            const d = new Date(a.timestamp);
            return d >= prevWeekStart && d < thisWeekStart;
        }).length;
        const thisWeekConversion = thisWeekScans > 0 ? Math.round((thisWeekAnswers / thisWeekScans) * 100) : 0;
        const prevWeekConversion = prevWeekScans > 0 ? Math.round((prevWeekAnswers / prevWeekScans) * 100) : 0;

        const calcTrend = (current, previous) => {
            if (previous === 0 && current === 0) return 0;
            if (previous === 0) return 100;
            return Math.round(((current - previous) / previous) * 100);
        };

        const weekTrend = {
            scans: { current: thisWeekScans, previous: prevWeekScans, change: calcTrend(thisWeekScans, prevWeekScans) },
            answers: { current: thisWeekAnswers, previous: prevWeekAnswers, change: calcTrend(thisWeekAnswers, prevWeekAnswers) },
            conversion: { current: thisWeekConversion, previous: prevWeekConversion, change: thisWeekConversion - prevWeekConversion },
        };

        // Daily activity — tylko fresh scans (bez revisit)
        const allTimestamps = [...freshScans, ...answers].map(x => x.timestamp).filter(Boolean);
        const earliest = allTimestamps.length > 0
            ? startOfDay(new Date(allTimestamps.sort()[0]))
            : last30;

        const scansByDayAll   = groupByDay(freshScans, earliest);
        const answersByDayAll = groupByDay(answers, earliest);

        const dailyActivity1d  = fillDays(scansByDayAll, answersByDayAll, last1,  today);
        const dailyActivity7d  = fillDays(scansByDayAll, answersByDayAll, last7,  today);
        const dailyActivity30d = fillDays(scansByDayAll, answersByDayAll, last30, today);
        const dailyActivityAll = fillDays(scansByDayAll, answersByDayAll, earliest, today);

        // Compat alias dla istniejących konsumentów
        const dailyActivity = dailyActivity30d;
        const scansByDay    = scansByDayAll;
        const answersByDay  = answersByDayAll;

        // Hourly distribution all-time (only fresh scans)
        const hourlyScans = new Array(24).fill(0);
        freshScans.forEach(s => {
            const h = new Date(s.timestamp).getHours();
            hourlyScans[h]++;
        });
        const maxHourly = Math.max(...hourlyScans);
        const hourlyActivity = hourlyScans.map((count, hour) => ({
            hour: `${String(hour).padStart(2, '0')}:00`,
            count,
            isPeak: count === maxHourly && count > 0,
        })).filter(h => h.count > 0);

        // Hourly distribution for last 24h (scans + answers)
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const hourlyScans1d = new Array(24).fill(0);
        const hourlyAnswers1d = new Array(24).fill(0);
        freshScans.filter(s => new Date(s.timestamp) >= last24h).forEach(s => {
            hourlyScans1d[new Date(s.timestamp).getHours()]++;
        });
        answers.filter(a => new Date(a.timestamp) >= last24h).forEach(a => {
            hourlyAnswers1d[new Date(a.timestamp).getHours()]++;
        });
        const hourlyActivity1d = Array.from({ length: 24 }, (_, h) => ({
            date: `${String(h).padStart(2, '0')}:00`,
            scans: hourlyScans1d[h],
            answers: hourlyAnswers1d[h],
        }));

        // Total stickers
        const totalStickers = Object.values(questions).reduce((sum, q) => sum + (q.stickersCount || 0), 0);

        // Social clicks
        const totalSocialClicks = socialClicks.length;
        const instagramClicks = socialClicks.filter(c => c.type === 'instagram').length;
        const facebookClicks = socialClicks.filter(c => c.type === 'facebook').length;
        const thisWeekSocial = socialClicks.filter(c => new Date(c.timestamp) >= last7).length;
        const prevWeekSocial = socialClicks.filter(c => {
            const d = new Date(c.timestamp);
            return d >= prev7 && d < last7;
        }).length;

        const overview = {
            totalScans,
            totalAnswers,
            totalRevisits,
            conversion,
            activeLocations,
            totalStickers,
            totalSocialClicks,
            instagramClicks,
            facebookClicks,
            weekTrend: {
                ...weekTrend,
                social: { current: thisWeekSocial, previous: prevWeekSocial, change: calcTrend(thisWeekSocial, prevWeekSocial) },
            },
            dailyActivity,
            dailyActivity1d,
            dailyActivity7d,
            dailyActivity30d,
            dailyActivityAll,
            hourlyActivity,
            hourlyActivity1d,
        };

        // ============ LOCATIONS ============

        const locationMap = {};
        freshScans.forEach(s => {
            if (!s.location) return;
            if (!locationMap[s.location]) locationMap[s.location] = { name: s.location, scans: 0, answers: 0, weekScans: 0, prevWeekScans: 0 };
            locationMap[s.location].scans++;
            const d = new Date(s.timestamp);
            if (d >= last7) locationMap[s.location].weekScans++;
            else if (d >= prev7) locationMap[s.location].prevWeekScans++;
        });
        answers.forEach(a => {
            if (!a.location) return;
            if (!locationMap[a.location]) locationMap[a.location] = { name: a.location, scans: 0, answers: 0, weekScans: 0, prevWeekScans: 0 };
            locationMap[a.location].answers++;
        });

        const locationStats = Object.values(locationMap)
            .map(loc => ({
                ...loc,
                conversion: loc.scans > 0 ? Math.round((loc.answers / loc.scans) * 100) : 0,
                trend: calcTrend(loc.weekScans, loc.prevWeekScans),
            }))
            .sort((a, b) => b.scans - a.scans);

        const hasLocationData = locationStats.length > 0;
        const topLocation = locationStats[0] || null;
        const bestConversionLoc = [...locationStats].sort((a, b) => b.conversion - a.conversion)[0] || null;

        const locations = {
            stats: locationStats,
            hasData: hasLocationData,
            totalLocations: locationStats.length,
            topLocation,
            bestConversionLoc,
        };

        // ============ QUESTIONS ============

        const questionMap = {};

        // Init all known questions (z Firestore via DataContext)
        Object.keys(questions).forEach(qid => {
            questionMap[qid] = {
                id: qid,
                questionText: questions[qid].questionText,
                options:      questions[qid].options,
                number:       questions[qid].number,
                stickersCount: questions[qid].stickersCount || 0,
                scans: 0,
                answers: 0,
                responses: {},
                locations: {},
                dailyActivity: {},
                latestActivity: null,
            };
        });

        // Count scans (only fresh, skip deleted questions)
        freshScans.forEach(s => {
            const qid = s.questionId;
            if (!questionMap[qid]) return; // pytanie usunięte → ignoruj
            questionMap[qid].scans++;
            if (s.location) {
                questionMap[qid].locations[s.location] = (questionMap[qid].locations[s.location] || 0) + 1;
            }
        });

        // Count answers
        answers.forEach(a => {
            const qid = a.questionId;
            if (!questionMap[qid]) return;
            questionMap[qid].answers++;
            questionMap[qid].responses[a.answer] = (questionMap[qid].responses[a.answer] || 0) + 1;

            const dayKey = a.timestamp.slice(0, 10);
            questionMap[qid].dailyActivity[dayKey] = (questionMap[qid].dailyActivity[dayKey] || 0) + 1;

            const ts = new Date(a.timestamp);
            if (!questionMap[qid].latestActivity || ts > questionMap[qid].latestActivity) {
                questionMap[qid].latestActivity = ts;
            }
        });

        // Compute percentages and dominant answer
        const questionStats = Object.values(questionMap).map(q => {
            const total = q.answers;
            const responsesWithPct = Object.entries(q.responses).map(([answer, count]) => ({
                answer,
                label: q.options.find(o => o.id === answer)?.label || answer,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            })).sort((a, b) => b.count - a.count);

            const dominant = responsesWithPct[0] || null;
            const conversion = q.scans > 0 ? Math.round((q.answers / q.scans) * 100) : 0;

            // Mini timeline
            const timelineData = fillDays(q.dailyActivity, {}, last30, today)
                .map(d => ({ date: d.date, count: d.scans })); // scans field holds the count here

            const locationEntries = Object.entries(q.locations)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            return {
                ...q,
                conversion,
                responsesWithPct,
                dominant,
                timelineData,
                locationEntries,
            };
        });

        const questionsResult = {
            stats: questionStats,
            totalQuestions: questionStats.length,
            withAnswers: questionStats.filter(q => q.answers > 0).length,
        };

        return { overview, locations, questions: questionsResult };
    }, [answers, scans, questions, socialClicks]);
};

export default useAdminStats;
