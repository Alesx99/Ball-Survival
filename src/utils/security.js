/**
 * Security Module - Password Hashing and Validation
 * @module security
 */

export class SecurityManager {
    constructor() {
        this.algorithm = 'SHA-256';
        this.iterations = 10000;
        this.keyLength = 64;
    }

    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    stringToArrayBuffer(str) {
        return new TextEncoder().encode(str);
    }

    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async hashPassword(password, salt = null) {
        try {
            if (!salt) salt = this.generateSalt();
            const passwordBuffer = this.stringToArrayBuffer(password + salt);
            let currentHash = await crypto.subtle.digest(this.algorithm, passwordBuffer);
            for (let i = 0; i < this.iterations; i++) {
                currentHash = await crypto.subtle.digest(this.algorithm, currentHash);
            }
            return { hash: this.arrayBufferToHex(currentHash), salt };
        } catch (error) {
            console.error('Errore hash password:', error);
            return this.simpleFallbackHash(password, salt);
        }
    }

    simpleFallbackHash(password, salt) {
        if (!salt) salt = Math.random().toString(36).substring(2, 15);
        let hash = 0;
        const str = password + salt;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        hash = Math.abs(hash).toString(36).padStart(16, '0');
        console.warn('Usando fallback hash (meno sicuro). Aggiorna il browser.');
        return { hash, salt };
    }

    async verifyPassword(password, storedHash, salt) {
        try {
            const { hash } = await this.hashPassword(password, salt);
            return hash === storedHash;
        } catch (error) {
            console.error('Errore verifica password:', error);
            return false;
        }
    }

    async migrateFromPlaintext(plaintextPassword) {
        return await this.hashPassword(plaintextPassword);
    }

    validatePasswordStrength(password) {
        if (!password || password.length < 4) {
            return { valid: false, strength: 'debole', message: 'Password deve essere almeno 4 caratteri' };
        }
        if (password.length < 6) {
            return { valid: true, strength: 'debole', message: 'Password debole. Consigliato almeno 6 caratteri.' };
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const strengthPoints = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
        if (strengthPoints >= 3 && password.length >= 8) {
            return { valid: true, strength: 'forte', message: 'Password forte!' };
        }
        if (strengthPoints >= 2 && password.length >= 6) {
            return { valid: true, strength: 'media', message: 'Password media. Aggiungi maiuscole, numeri o caratteri speciali.' };
        }
        return { valid: true, strength: 'debole', message: 'Password debole. Usa una combinazione di lettere, numeri e simboli.' };
    }

    generateSecurePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => charset[byte % charset.length]).join('');
    }
}

export const securityManager = new SecurityManager();
