import { QUESTIONS_DATA } from '../data/questionsData';

export const generateStats = (answersData) => {
    const statsData = {};
    let totalResponses = 0;
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    let weeklyResponses = 0;

    answersData.forEach((answer) => {
        const { questionId, answer: response, timestamp } = answer;

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

    return statsData;
};
