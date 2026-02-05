const GREETINGS = [
    'Dzięki za głos! Udanej niedzieli.',
    'Dzięki za głos! Dobrego tygonia!',
    'Dzięki za głos! Udanego wtorku!',
    'Dzięki za głos! Miłej środy!',
    'Dzięki za głos! Dobrego czwartku!',
    'Dzięki za głos! Miłego weekendu, baw się dobrze!!!',
    'Dzięki za głos! Miłej soboty!',
];

export const getGreetingByDay = () => {
    const dayOfWeek = new Date().getDay();
    return GREETINGS[dayOfWeek];
};
