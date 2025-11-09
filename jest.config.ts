import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/services/**/*.ts',
    '!src/**/controllers/**/*.ts',
    '!src/**/routes/**/*.ts',
    '!src/**/validation/**/*.ts',
    '!src/**/config/**/*.ts',
    '!src/**/types/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/*.unit.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['**/*.integration.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
  ],
};

export default config;
