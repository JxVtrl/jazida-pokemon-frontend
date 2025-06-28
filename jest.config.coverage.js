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
        "!src/**/*.spec.{ts,tsx}",
        "!src/**/__tests__/**",
        "!src/**/__mocks__/**",
        "!src/app/layout.tsx",
        "!src/app/globals.css",
        "!src/app/page.tsx"
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
    testMatch: [
        "**/__tests__/**/*.{ts,tsx}",
        "**/*.{test,spec}.{ts,tsx}"
    ],
    verbose: true,
    collectCoverage: true
}

module.exports = createJestConfig(customJestConfig) 