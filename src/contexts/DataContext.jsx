import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { SEED_QUESTIONS } from '../data/questionsData';
import { SEED_FACTS } from '../data/factsData';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [questions, setQuestions] = useState(null); // null = ładowanie
    const [facts, setFacts]         = useState(null);

    const fetchQuestions = useCallback(async () => {
        const snap = await getDocs(query(collection(db, 'questions'), orderBy('number')));

        // Auto-seed jeśli kolekcja pusta
        if (snap.empty) {
            const batch = writeBatch(db);
            Object.entries(SEED_QUESTIONS).forEach(([id, q], idx) => {
                batch.set(doc(db, 'questions', id), {
                    questionText: q.questionText,
                    options:      q.options,
                    number:       idx + 1,
                });
            });
            await batch.commit();

            // Fetchuj ponownie po seedzie
            const snap2 = await getDocs(query(collection(db, 'questions'), orderBy('number')));
            const data = {};
            snap2.docs.forEach(d => { data[d.id] = { ...d.data() }; });
            setQuestions(data);
            return;
        }

        const data = {};
        snap.docs.forEach(d => { data[d.id] = { ...d.data() }; });
        setQuestions(data);
    }, []);

    const fetchFacts = useCallback(async () => {
        const snap = await getDocs(query(collection(db, 'facts'), orderBy('number')));

        // Auto-seed jeśli kolekcja pusta
        if (snap.empty) {
            const batch = writeBatch(db);
            SEED_FACTS.forEach((text, idx) => {
                batch.set(doc(db, 'facts', String(idx + 1).padStart(4, '0')), {
                    text,
                    number: idx + 1,
                });
            });
            await batch.commit();

            const snap2 = await getDocs(query(collection(db, 'facts'), orderBy('number')));
            setFacts(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
            return;
        }

        setFacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, []);

    const refresh = useCallback(async () => {
        await Promise.all([fetchQuestions(), fetchFacts()]);
    }, [fetchQuestions, fetchFacts]);

    useEffect(() => {
        fetchQuestions().catch(err => {
            console.error('DataContext: błąd ładowania pytań:', err);
            // Fallback do statycznych danych
            const data = {};
            Object.entries(SEED_QUESTIONS).forEach(([id, q], idx) => {
                data[id] = { ...q, number: idx + 1 };
            });
            setQuestions(data);
        });

        fetchFacts().catch(err => {
            console.error('DataContext: błąd ładowania ciekawostek:', err);
            setFacts(SEED_FACTS.map((text, idx) => ({ id: String(idx+1).padStart(4,'0'), text, number: idx+1 })));
        });
    }, [fetchQuestions, fetchFacts]);

    return (
        <DataContext.Provider value={{ questions, facts, refresh }}>
            {children}
        </DataContext.Provider>
    );
};
