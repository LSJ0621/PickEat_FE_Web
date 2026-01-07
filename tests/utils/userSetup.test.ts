import { describe, it, expect } from 'vitest';
import { checkUserSetupStatus } from '@/utils/userSetup';
import type { UserSetupStatus } from '@/utils/userSetup';

describe('checkUserSetupStatus', () => {
  describe('Complete user setup', () => {
    it('should return all false when user has all information', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: ['Spicy'],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(false);
      expect(result.needsAddress).toBe(false);
      expect(result.needsPreferences).toBe(false);
      expect(result.hasAnyMissing).toBe(false);
    });

    it('should return false for hasAnyMissing when only likes are present', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(false);
      expect(result.hasAnyMissing).toBe(false);
    });

    it('should return false for hasAnyMissing when only dislikes are present', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: [],
          dislikes: ['Spicy'],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(false);
      expect(result.hasAnyMissing).toBe(false);
    });
  });

  describe('Missing name', () => {
    it('should return needsName true when name is undefined', () => {
      const user = {
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsName true when name is null', () => {
      const user = {
        name: null,
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsName true when name is empty string', () => {
      const user = {
        name: '',
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsName true when name is only whitespace', () => {
      const user = {
        name: '   ',
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });
  });

  describe('Missing address', () => {
    it('should return needsAddress true when address is undefined', () => {
      const user = {
        name: 'John Doe',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsAddress).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsAddress true when address is null', () => {
      const user = {
        name: 'John Doe',
        address: null,
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsAddress).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsAddress true when address is empty string', () => {
      const user = {
        name: 'John Doe',
        address: '',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsAddress).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsAddress true when address is only whitespace', () => {
      const user = {
        name: 'John Doe',
        address: '   ',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsAddress).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });
  });

  describe('Missing preferences', () => {
    it('should return needsPreferences true when preferences is null', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: null,
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsPreferences true when preferences is undefined', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsPreferences true when both likes and dislikes are empty', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: [],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsPreferences true when likes is undefined', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: undefined as unknown as string[],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return needsPreferences true when dislikes is undefined', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: [],
          dislikes: undefined as unknown as string[],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });
  });

  describe('Multiple missing fields', () => {
    it('should return all true when all fields are missing', () => {
      const user = {
        name: null,
        address: null,
        preferences: null,
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.needsAddress).toBe(true);
      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return correct status when name and address are missing', () => {
      const user = {
        name: '',
        address: '',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.needsAddress).toBe(true);
      expect(result.needsPreferences).toBe(false);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return correct status when name and preferences are missing', () => {
      const user = {
        name: '',
        address: '123 Main St',
        preferences: {
          likes: [],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.needsAddress).toBe(false);
      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should return correct status when address and preferences are missing', () => {
      const user = {
        name: 'John Doe',
        address: '',
        preferences: null,
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(false);
      expect(result.needsAddress).toBe(true);
      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });
  });

  describe('Return type validation', () => {
    it('should return UserSetupStatus type with all required fields', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result: UserSetupStatus = checkUserSetupStatus(user);

      expect(result).toHaveProperty('needsName');
      expect(result).toHaveProperty('needsAddress');
      expect(result).toHaveProperty('needsPreferences');
      expect(result).toHaveProperty('hasAnyMissing');
      expect(typeof result.needsName).toBe('boolean');
      expect(typeof result.needsAddress).toBe('boolean');
      expect(typeof result.needsPreferences).toBe('boolean');
      expect(typeof result.hasAnyMissing).toBe('boolean');
    });
  });

  describe('Edge cases', () => {
    it('should handle user with only whitespace in name and address', () => {
      const user = {
        name: '  \t  ',
        address: '  \n  ',
        preferences: {
          likes: ['Korean'],
          dislikes: [],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsName).toBe(true);
      expect(result.needsAddress).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should handle preferences with null arrays', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: null as unknown as string[],
          dislikes: null as unknown as string[],
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(true);
      expect(result.hasAnyMissing).toBe(true);
    });

    it('should handle very long preference arrays', () => {
      const user = {
        name: 'John Doe',
        address: '123 Main St',
        preferences: {
          likes: Array(100).fill('Korean'),
          dislikes: Array(50).fill('Spicy'),
        },
      };

      const result = checkUserSetupStatus(user);

      expect(result.needsPreferences).toBe(false);
      expect(result.hasAnyMissing).toBe(false);
    });
  });
});
