const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
        "/node_modules/",
        "/e2e/"
    ],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/*.stories.{ts,tsx}",
        "!src/**/*.test.{ts,tsx}",
        "!src/**/*.spec.{ts,tsx}"
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx']
}

module.exports = createJestConfig(customJestConfig) 