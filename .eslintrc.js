const { resolve } = require("path")

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "prettier",
    "plugin:jest/recommended",
  ],
  rules: {
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",
  },
  parserOptions: {
    project: [
      resolve(__dirname, "./tsconfig.json"),
      resolve(__dirname, "./tsconfig.eslint.json"),
    ],
  },
  ignorePatterns: ["jest.config.js"],
}
