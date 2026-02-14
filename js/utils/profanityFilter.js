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

/**
 * Checks if the text contains profanity.
 * @param {string} text - The input text to check.
 * @returns {boolean} - True if profanity is found, false otherwise.
 */
function hasProfanity(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();

    // Simple check: does the text contain any blocked term?
    // This is a basic implementation; could be improved with regex borders.
    return BLOCKED_TERMS.some(term => {
        // Check for exact words or significant substrings
        // Using word boundaries
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        return regex.test(lowerText);
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
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '*'.repeat(term.length));
    });

    return sanitized;
}
