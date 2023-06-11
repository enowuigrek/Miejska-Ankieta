const admin = require('firebase-admin');

const fs = require('fs');

const serviceAccount = require('./my-firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportData() {
    try {
        const snapshot = await db.collection('answers').get();
        const answers = [];

        snapshot.forEach((doc) => {
            answers.push(doc.data());
        });

        fs.writeFileSync('src/data/answers.json', JSON.stringify(answers, null, 2));
        console.log('Data successfully exported!');
    } catch (error) {
        console.error('Error exporting data: ', error);
    }
}

exportData();