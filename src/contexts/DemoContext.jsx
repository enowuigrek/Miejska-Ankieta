import React, { createContext, useContext } from 'react';
import { DataContext } from './DataContext';
import { DEMO_QUESTIONS, DEMO_FACTS } from '../demo/mockData';

const DemoContext = createContext(false);

export const useDemoMode = () => useContext(DemoContext);

export const DemoProvider = ({ children }) => {
    const mockData = {
        questions: DEMO_QUESTIONS,
        facts:     DEMO_FACTS,
        refresh:   async () => {},
    };

    return (
        <DemoContext.Provider value={true}>
            <DataContext.Provider value={mockData}>
                {children}
            </DataContext.Provider>
        </DemoContext.Provider>
    );
};
