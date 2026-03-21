import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, writeBatch, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SEED_QUESTIONS } from '../data/questionsData';
import { SEED_FACTS } from '../data/factsData';

export const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [questions, setQuestions] = useState(null); // null = ładowanie
    const [facts, setFacts]         = useState(null);

    // Real-time listener na pytania
    useEffect(() => {
        const q = query(collection(db, 'questions'), orderBy('number'));
        const unsub = onSnapshot(q, async (snap) => {
            // Auto-seed jeśli kolekcja pusta
            if (snap.empty) {
                const batch = writeBatch(db);
                Object.entries(SEED_QUESTIONS).forEach(([id, qData], idx) => {
                    batch.set(doc(db, 'questions', id), {
                        questionText: qData.questionText,
                        options:      qData.options,
                        number:       idx + 1,
                    });
                });
                await batch.commit();
                // onSnapshot automatycznie odpali się ponownie po seed
                return;
            }

            const data = {};
            snap.docs.forEach(d => { data[d.id] = { ...d.data() }; });
            setQuestions(data);
        }, (err) => {
            console.error('DataContext: błąd nasłuchiwania pytań:', err);
            // Fallback do statycznych danych
            const data = {};
            Object.entries(SEED_QUESTIONS).forEach(([id, qData], idx) => {
                data[id] = { ...qData, number: idx + 1 };
            });
            setQuestions(data);
        });

        return unsub;
    }, []);

    // Real-time listener na ciekawostki
    useEffect(() => {
        const q = query(collection(db, 'facts'), orderBy('number'));
        const unsub = onSnapshot(q, async (snap) => {
            if (snap.empty) {
                const batch = writeBatch(db);
                SEED_FACTS.forEach((text, idx) => {
                    batch.set(doc(db, 'facts', String(idx + 1).padStart(4, '0')), {
                        text,
                        number: idx + 1,
                    });
                });
                await batch.commit();
                return;
            }

            setFacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => {
            console.error('DataContext: błąd nasłuchiwania ciekawostek:', err);
            setFacts(SEED_FACTS.map((text, idx) => ({ id: String(idx+1).padStart(4,'0'), text, number: idx+1 })));
        });

        return unsub;
    }, []);

    // refresh zachowany dla kompatybilności (np. wymuszenie odczytu po batch update)
    const refresh = useCallback(async () => {
        // onSnapshot sam aktualizuje dane — refresh jest teraz no-op
        // ale zostawiamy go żeby nie łamać istniejącego kodu
    }, []);

    return (
        <DataContext.Provider value={{ questions, facts, refresh }}>
            {children}
        </DataContext.Provider>
    );
};
