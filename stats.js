const fs = require('fs');
const data = require('./src/data/answers.json');

const stats = {};

data.forEach((answer) => {
    if (!stats[answer.questionId]) {
        stats[answer.questionId] = {};
    }

    if (!stats[answer.questionId][answer.answer]) {
        stats[answer.questionId][answer.answer] = 0;
    }

    stats[answer.questionId][answer.answer]++;
});

fs.writeFileSync('./src/data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
