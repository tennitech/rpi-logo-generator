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

function buildRegexForTerm(term) {
    let pattern = '';
    for (let i = 0; i < term.length; i++) {
        let char = term[i].toLowerCase();
        let charPattern = LEET_MAP[char] || `[${char}]`;
        pattern += charPattern + '+';
        if (i < term.length - 1) {
            pattern += '[^a-zA-Z0-9]*';
        }
    }
    return new RegExp(`(^|[^a-zA-Z0-9])(${pattern})(?=[^a-zA-Z0-9]|$)`, 'gi');
}

const BLOCKED_TERMS = ["shit", "fuck", "bitch", "ass", "damn"];

function hasProfanity(text) {
    if (!text) return false;
    return BLOCKED_TERMS.some(term => {
        const regex = buildRegexForTerm(term);
        return regex.test(text);
    });
}

function sanitizeText(text) {
    if (!text) return text;
    let sanitized = text;

    BLOCKED_TERMS.forEach(term => {
        const regex = buildRegexForTerm(term);
        sanitized = sanitized.replace(regex, (match, prefix, profanity) => {
            return prefix + '*'.repeat(profanity.length);
        });
    });

    return sanitized;
}

const tests = [
    "~$hit~",
    "what a $hit",
    "f*ck",
    "b!tch",
    "class", // should not flag ass
    "asshole", // should it flag ass? yes, wait. "asshole" contains letters after ass, so lookahead fails! So no match for ass! But if asshole is in blocked list, it will match asshole explicitly.
    "ass",
    "@ss",
    "bull$hit", // should it?
    "f u c k",
    "sh it", // wait, "sh it" has no letters after t. So lookahead matches. Wait, is "sh it" a curse?
    "push it" // before s there is u. lookbehind fails!
];

tests.forEach(t => {
    console.log(`"${t}" -> hasProfanity: ${hasProfanity(t)}, sanitized: "${sanitizeText(t)}"`);
});
