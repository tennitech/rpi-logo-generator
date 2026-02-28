/**
 * Profanity Filter for RPI Logo Generator
 * Ensures that the data visualization "Bar" does not contain inappropriate content.
 */

const BLOCKED_TERMS = [
    // Standard list (expand as needed)
    "damn",
    "hell",
    "fuck",
    "shit",
    "bitch",
    "ass",
    "dick",
    "piss",
    "cunt",
    "cock",
    "whore",
    "bastard",
    "slut",
    "douche",
    // Add more as per requirements
];

// Export for both Browser and Node.js environments
if (typeof window !== 'undefined') {
    window.ProfanityFilter = {
        hasProfanity: hasProfanity,
        sanitizeText: sanitizeText
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { hasProfanity, sanitizeText };
}

const LEET_MAP = {
    'a': '[aA@4]',
    'b': '[bB8]',
    'c': '[cC]',
    'd': '[dD]',
    'e': '[eE3]',
    'f': '[fF]',
    'g': '[gG9]',
    'h': '[hH]',
    'i': '[iIlL1!\\x7c]', // \x7c is |
    'j': '[jJ]',
    'k': '[kK]',
    'l': '[lL1!\\x7c]',
    'm': '[mM]',
    'n': '[nN]',
    'o': '[oO0]',
    'p': '[pP]',
    'q': '[qQ9]',
    'r': '[rR]',
    's': '[sS\\$5]',
    't': '[tT7\\+]',
    'u': '[uUvV\\*]',  // f*ck
    'v': '[vVuU]',
    'w': '[wW]',
    'x': '[xX]',
    'y': '[yY]',
    'z': '[zZ2]'
};

/**
 * Builds a regex pattern for a given term that accounts for leet-speak and characters between letters.
 * @param {string} term - The base curse word.
 * @returns {RegExp} - Compiled regex.
 */
function buildRegexForTerm(term) {
    let pattern = '';
    for (let i = 0; i < term.length; i++) {
        let char = term[i].toLowerCase();
        let charPattern = LEET_MAP[char] || `[${char}]`;
        pattern += charPattern + '+';
        if (i < term.length - 1) {
            // Allows zero or more non-alphanumeric characters between letters of a curse word
            pattern += '[^a-zA-Z0-9]*';
        }
    }
    // (^|[^a-zA-Z0-9]) ensures the profanity acts as a standalone word (or surrounded by non-characters)
    // (?=[^a-zA-Z0-9]|$) ensures it doesn't match inside a larger standalone valid word like "class"
    return new RegExp(`(^|[^a-zA-Z0-9])(${pattern})(?=[^a-zA-Z0-9]|$)`, 'gi');
}

/**
 * Checks if the text contains profanity.
 * @param {string} text - The input text to check.
 * @returns {boolean} - True if profanity is found, false otherwise.
 */
function hasProfanity(text) {
    if (!text) return false;

    // Check if the text matches any leetspeak pattern from the blocked terms
    return BLOCKED_TERMS.some(term => {
        const regex = buildRegexForTerm(term);
        return regex.test(text);
    });
}

/**
 * Sanitizes the text by replacing profanity with asterisks.
 * @param {string} text - The input text.
 * @returns {string} - Sanitized text.
 */
function sanitizeText(text) {
    if (!text) return text;
    let sanitized = text;

    BLOCKED_TERMS.forEach(term => {
        const regex = buildRegexForTerm(term);
        // Replace profanity matches with identical length of asterisks, preserving the prefix boundary
        sanitized = sanitized.replace(regex, (match, prefix, profanity) => {
            return prefix + '*'.repeat(profanity.length);
        });
    });

    return sanitized;
}
