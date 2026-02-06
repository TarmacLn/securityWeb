export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

function getUnicodeCategory(char: string): string {
    if (/[a-zA-Z\u0041-\u005A\u0061-\u007A]/.test(char)) return 'L'; // Latin letters
    if (/[\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/.test(char)) return 'L'; // Extended Latin (includes accented)
    if (/[\u0370-\u03FF]/.test(char)) return 'L'; // Greek
    if (/[\u0400-\u04FF]/.test(char)) return 'L'; // Cyrillic
    if (/[\u0590-\u05FF]/.test(char)) return 'L'; // Hebrew
    if (/[\u0600-\u06FF]/.test(char)) return 'L'; // Arabic
    if (/[\u0900-\u097F]/.test(char)) return 'L'; // Devanagari
    if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/.test(char)) return 'L'; // CJK ideographs and Hiragana/Katakana
    if (/[0-9]/.test(char)) return 'N'; // Decimal digits
    if (/[\s\t\n\r]/.test(char)) return 'Z'; // Separators (whitespace)
    if (/[!\"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~]/.test(char)) return 'P'; // Punctuation
    if (/[\u0000-\u001F\u007F-\u009F]/.test(char)) return 'C'; // Control characters
    if (/[\u0300-\u036F\u1AB0-\u1AFF]/.test(char)) return 'M'; // Marks/combining characters
    
    return 'S';
}

// Normalization
export function normalizeText(text: string): string {
    if (!text) return '';
    return text.normalize('NFC');
}

export function detectInvalidCharacter(
    text: string,
    allowedCategories: Set<string>,
    allowedIndividualChars: Set<string>,
    disallowedChars: Set<string>,
): string | null {
    for (const char of text) {
        if (disallowedChars.has(char)) {
            return char;
        }

        if (allowedIndividualChars.has(char)) {
            continue;
        }

        const category = getUnicodeCategory(char);
        if (!allowedCategories.has(category)) {
            return char;
        }
    }

    return null;
}

export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }
    
    const trimmedEmail = email.trim();
    
    // Total Length <= 254
    if (trimmedEmail.length > 254) {
        return { isValid: false, error: 'Email is too long' };
    }
    
    // One @ symbol
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount !== 1) {
        return { isValid: false, error: 'Email must contain exactly one @ symbol' };
    }
    
    const [localPart, domain] = trimmedEmail.split('@');
    
    if (!localPart || !domain) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Local part length <= 63
    if (localPart.length > 63) {
        return { isValid: false, error: 'Email local part is too long (max 63 characters)' };
    }
    
    if (localPart.length === 0) {
        return { isValid: false, error: 'Email local part cannot be empty' };
    }
    
    // Dangerous characters: backticks, single quotes, double quotes, null bytes
    if (/[`'"\u0000]/.test(trimmedEmail)) {
        return { isValid: false, error: 'Email contains invalid characters' };
    }
    
    // Domain part: only letters, numbers, hyphens (-), and periods (.)
    // Must have at least one period
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return { isValid: false, error: 'Please enter a valid domain' };
    }
    
    return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
        return { isValid: false, error: 'Password is too long' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return {
            isValid: false,
            error: 'Password must contain uppercase, lowercase, number, and special character',
        };
    }
    
    return { isValid: true };
};

export const validateFullName = (name: string): ValidationResult => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Full name is required' };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
        return { isValid: false, error: 'Full name must be at least 2 characters' };
    }
    
    if (trimmedName.length > 100) {
        return { isValid: false, error: 'Full name is too long' };
    }
    
    const nameRegex = /^[a-zA-Zñáéíóúüàèìòùâêîôûäëïöüçñ\s\-']+$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: 'Full name contains invalid characters' };
    }
    
    return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim().length === 0) {
        return { isValid: true };
    }
    
    const trimmedPhone = phone.trim();
    
    const phoneRegex = /^[+]?[0-9]{7,15}$/;
    if (!phoneRegex.test(trimmedPhone.replace(/[\s\-()]/g, ''))) {
        return { isValid: false, error: 'Please enter a valid phone number' };
    }
    
    return { isValid: true };
};

export const validateAMKA = (amka: string): ValidationResult => {
    if (!amka || amka.trim().length === 0) {
        return { isValid: false, error: 'AMKA is required' };
    }
    
    const trimmedAMKA = amka.trim();
    
    if (!/^\d{11}$/.test(trimmedAMKA)) {
        return { isValid: false, error: 'AMKA must be 11 digits' };
    }
    
    return { isValid: true };
};

export const validateLicenseID = (licenseID: string): ValidationResult => {
    if (!licenseID || licenseID.trim().length === 0) {
        return { isValid: false, error: 'License ID is required' };
    }
    
    const trimmedLicense = licenseID.trim();
    
    if (trimmedLicense.length < 3) {
        return { isValid: false, error: 'License ID is too short' };
    }
    
    if (trimmedLicense.length > 50) {
        return { isValid: false, error: 'License ID is too long' };
    }
    
    const licenseRegex = /^[a-zA-Z0-9\-\/]+$/;
    if (!licenseRegex.test(trimmedLicense)) {
        return { isValid: false, error: 'License ID contains invalid characters' };
    }
    
    return { isValid: true };
};

export const validateFreeFormText = (
    text: string,
    minLength: number = 0,
    maxLength: number = 1000,
    required: boolean = false,
    fieldName: string = 'Text',
): ValidationResult => {
    const allowedCategories = new Set(['L', 'N', 'Z', 'M']);
    const allowedIndividualChars = new Set([
        "'", '-', '.', ',', '!', '?', ';', ':', '(', ')', '"', '/', '&', '—', '–', '…', '\n'
    ]);
    const disallowedChars = new Set(['\u0000']);

    if (required && (!text || text.trim().length === 0)) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    if (!text || text.trim().length === 0) {
        return { isValid: true };
    }

    const normalizedText = normalizeText(text);

    if (minLength > 0 && normalizedText.trim().length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters`,
        };
    }

    if (maxLength > 0 && normalizedText.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} must not exceed ${maxLength} characters`,
        };
    }

    const invalidChar = detectInvalidCharacter(
        normalizedText,
        allowedCategories,
        allowedIndividualChars,
        disallowedChars,
    );

    if (invalidChar) {
        return {
            isValid: false,
            error: `${fieldName} contains invalid character '${invalidChar}'`,
        };
    }

    return { isValid: true };
};

export const validateSelectField = (value: string | null): ValidationResult => {
    if (!value || value.trim().length === 0) {
        return { isValid: false, error: 'Please select an option' };
    }
    
    return { isValid: true };
};
