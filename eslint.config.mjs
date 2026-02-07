import tseslint from "typescript-eslint";
import angularEslint from "@angular-eslint/eslint-plugin";
import angularTemplateEslint from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";

export default tseslint.config(
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true,
      },
    },
    plugins: {
      "@angular-eslint": angularEslint,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@angular-eslint/component-class-suffix": [
        "error",
        {
          suffixes: ["Page", "Component"],
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplateEslint,
    },
    rules: {},
  }
);
