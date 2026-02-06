export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    
    return input
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities that could be used for injection
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&');
};

export const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const sanitizePassword = (password: string): string => {
    return password.trim();
};

export const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text.trim();
};

export const sanitizeNumber = (input: string): string => {
    if (!input) return '';
    return input.replace(/[^\d]/g, '');
};

export const sanitizePhoneNumber = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/[^\d+\-() ]/g, '');
};

export const sanitizeAlphanumeric = (input: string): string => {
    if (!input) return '';
    return input.replace(/[^a-zA-Z0-9\-\/]/g, '');
};

export const sanitizeName = (name: string): string => {
    if (!name) return '';
    return name
        .trim()
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Allow only letters, spaces, hyphens, apostrophes, and accented characters
        .replace(/[^a-zA-Zñáéíóúüàèìòùâêîôûäëïöüçñ\s\-']/g, '')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ');
};

export const sanitizeTextarea = (text: string): string => {
    if (!text) return '';
    return text
        .trim()
        // Remove any HTML tags
        .replace(/<[^>]*>/g, '')
        // Collapse multiple newlines
        .replace(/\n\n+/g, '\n')
        // Collapse multiple spaces
        .replace(/[ \t]+/g, ' ');
};

export const encodeHTML = (text: string): string => {
    if (!text) return '';
    
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    
    return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

export const containsDangerousPatterns = (input: string): boolean => {
    if (!input) return false;
    
    // Check for common XSS patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // Event handlers like onclick, onerror, etc.
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\(/i,
        /expression\(/i,
    ];
    
    return dangerousPatterns.some((pattern) => pattern.test(input));
};

export const sanitizeAndValidate = (input: string): string => {
    if (containsDangerousPatterns(input)) {
        return '';
    }
    
    return sanitizeInput(input);
};

export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (value !== null && value !== undefined) {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

export const limitLength = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.substring(0, maxLength);
};
