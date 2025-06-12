module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/main.js",
    "!src/firebaseConfig.js",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  testMatch: [
    "**/tests/unit/**/*-simple.spec.js",
    "**/tests/unit/**/logic.spec.js"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["js", "json"],
  transformIgnorePatterns: [
    "node_modules/(?!(vue-chartjs|chart.js)/)",
  ],
};
