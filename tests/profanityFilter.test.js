const { hasProfanity, sanitizeText } = require('../js/utils/profanityFilter');

describe('Profanity Filter', () => {
    test('should detect profanity in text', () => {
        expect(hasProfanity('This is a damn test')).toBe(true);
        expect(hasProfanity('hell no')).toBe(true);
    });

    test('should not detect profanity in clean text', () => {
        expect(hasProfanity('Hello world')).toBe(false);
        expect(hasProfanity('RPI is great')).toBe(false);
    });

    test('should sanitize profanity with asterisks', () => {
        expect(sanitizeText('This is a damn test')).toBe('This is a **** test');
        expect(sanitizeText('What the hell')).toBe('What the ****');
    });

    test('should be case insensitive', () => {
        expect(hasProfanity('DaMn it')).toBe(true);
        expect(sanitizeText('DaMn it')).toBe('**** it');
    });

    test('should handle partial matches correctly (word boundaries)', () => {
        // "class" contains "ass" but should not be flagged
        expect(hasProfanity('class')).toBe(false);
        expect(sanitizeText('class')).toBe('class');
    });
});
