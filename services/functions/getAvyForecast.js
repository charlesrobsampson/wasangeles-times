import handler from './lambda';

export const main = handler(async (event, context) => {
    return 'AVY FORECAST';
});