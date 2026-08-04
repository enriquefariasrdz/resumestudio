import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken, UserSessionPayload } from '../lib/auth';

describe('Authentication & JWT Utility Tests', () => {
  it('should correctly hash and verify passwords', async () => {
    const password = 'ProductionSecretPass123!';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format

    const isValid = await comparePassword(password, hashedPassword);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });

  it('should sign and verify valid JWT session tokens', () => {
    const userPayload: UserSessionPayload = {
      userId: 'usr-production-001',
      email: 'engineer@resumestudio.io',
      name: 'Enrique Farias',
      role: 'USER',
    };

    const token = signToken(userPayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('usr-production-001');
    expect(decoded?.email).toBe('engineer@resumestudio.io');
    expect(decoded?.role).toBe('USER');
  });

  it('should return null for malformed or tampered tokens', () => {
    const invalidToken = 'invalid.jwt.token';
    const decodedInvalid = verifyToken(invalidToken);
    expect(decodedInvalid).toBeNull();

    const emptyToken = '';
    const decodedEmpty = verifyToken(emptyToken);
    expect(decodedEmpty).toBeNull();
  });
});
