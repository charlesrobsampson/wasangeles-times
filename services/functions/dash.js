import handler from './lambda';

export const main = handler(async (event, context) => {
    return {
        message: 'We could put a forecast summary here wih whatever info we find relevant'
    }
});
