import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/dist/**'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  testPathIgnorePatterns: ['/node_modules/', '/libs/math/contracts/'],
  moduleNameMapper: {
    '^@libs/core(.*)$': '<rootDir>/libs/core/src$1',
    '^@libs/math(.*)$': '<rootDir>/libs/math/src$1',
    '^@libs/database(.*)$': '<rootDir>/libs/database/src$1',
    '^@libs/ethers(.*)$': '<rootDir>/libs/ethers/src$1',
    '^@libs/logger(.*)$': '<rootDir>/libs/logger/src$1',
    '^@libs/abi(.*)$': '<rootDir>/libs/abi/src$1',
    '^@libs/grpc(.*)$': '<rootDir>/libs/grpc/src$1',
  },
};

export default config;
