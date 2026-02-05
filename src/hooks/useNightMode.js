import { useState, useEffect } from 'react';

const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

export const useNightMode = () => {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const checkNightMode = () => {
            const hour = new Date().getHours();
            setIsNight(hour < NIGHT_END_HOUR || hour >= NIGHT_START_HOUR);
        };

        checkNightMode();
    }, []);

    return isNight;
};
