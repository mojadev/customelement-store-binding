// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: "coverage",
  preset: "ts-jest",
  testPathIgnorePatterns: ["/node_modules/", "/examples/"],
  testEnvironment: "jsdom"
};
