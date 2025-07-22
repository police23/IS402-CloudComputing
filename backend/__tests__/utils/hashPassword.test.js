const bcrypt = require('bcrypt');

describe('Hash Password Utility', () => {
  describe('bcrypt password hashing', () => {
    it('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should verify password against hash', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      const isInvalidPassword = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(isValidPassword).toBe(true);
      expect(isInvalidPassword).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const saltRounds = 10;

      const hash1 = await bcrypt.hash(password, saltRounds);
      const hash2 = await bcrypt.hash(password, saltRounds);

      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      const verify1 = await bcrypt.compare(password, hash1);
      const verify2 = await bcrypt.compare(password, hash2);
      
      expect(verify1).toBe(true);
      expect(verify2).toBe(true);
    });

    it('should handle empty password', async () => {
      const password = '';
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const isValid = await bcrypt.compare(password, hashedPassword);

      expect(hashedPassword).toBeDefined();
      expect(isValid).toBe(true);
    });

    it('should handle special characters in password', async () => {
      const password = 'p@ssw0rd!#$%^&*()';
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const isValid = await bcrypt.compare(password, hashedPassword);

      expect(hashedPassword).toBeDefined();
      expect(isValid).toBe(true);
    });

    it('should handle different salt rounds', async () => {
      const password = 'testpassword123';
      
      const hash10 = await bcrypt.hash(password, 10);
      const hash12 = await bcrypt.hash(password, 12);

      const verify10 = await bcrypt.compare(password, hash10);
      const verify12 = await bcrypt.compare(password, hash12);

      expect(verify10).toBe(true);
      expect(verify12).toBe(true);
      expect(hash10).not.toBe(hash12);
    });
  });
});
