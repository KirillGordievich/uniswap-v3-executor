import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/test/'],
  moduleNameMapper: {
    '^@libs/core(.*)$': '<rootDir>/../../core/src$1',
    '^@libs/math(.*)$': '<rootDir>/../src$1',
  },
  globalSetup: '<rootDir>/test/global-setup.ts',
};

export default config;
