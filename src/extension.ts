import * as vscode from "vscode";

import { createCommand } from "./commands";
import { RefactoringActionProvider } from "./action-providers";

import addBracesToArrowFunction from "./refactorings/add-braces-to-arrow-function";
import addBracesToIfStatement from "./refactorings/add-braces-to-if-statement";
import bubbleUpIfStatement from "./refactorings/bubble-up-if-statement";
import convertForToForeach from "./refactorings/convert-for-to-foreach";
import convertIfElseToSwitch from "./refactorings/convert-if-else-to-switch";
import convertIfElseToTernary from "./refactorings/convert-if-else-to-ternary";
import convertTernaryToIfElse from "./refactorings/convert-ternary-to-if-else";
import convertToTemplateLiteral from "./refactorings/convert-to-template-literal";
import extractVariable from "./refactorings/extract-variable";
import flipIfElse from "./refactorings/flip-if-else";
import flipTernary from "./refactorings/flip-ternary";
import inlineVariableOrFunction from "./refactorings/inline-variable-or-function";
import mergeIfStatements from "./refactorings/merge-if-statements";
import mergeWithPreviousIfStatement from "./refactorings/merge-with-previous-if-statement";
import moveStatementDown from "./refactorings/move-statement-down";
import moveStatementUp from "./refactorings/move-statement-up";
import negateExpression from "./refactorings/negate-expression";
import reactConvertToPureComponent from "./refactorings/react/convert-to-pure-component";
import removeBracesFromArrowFunction from "./refactorings/remove-braces-from-arrow-function";
import removeDeadCode from "./refactorings/remove-dead-code";
import removeRedundantElse from "./refactorings/remove-redundant-else";
import renameSymbol from "./refactorings/rename-symbol";
import replaceBinaryWithAssignment from "./refactorings/replace-binary-with-assignment";
import splitDeclarationAndInitialization from "./refactorings/split-declaration-and-initialization";
import splitIfStatement from "./refactorings/split-if-statement";

const SUPPORTED_LANGUAGES = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact"
];

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("abracadabra.quickFix", () => {
      vscode.commands.executeCommand("editor.action.quickFix");
    })
  );

  [
    addBracesToArrowFunction,
    addBracesToIfStatement,
    bubbleUpIfStatement,
    convertForToForeach,
    convertIfElseToSwitch,
    convertIfElseToTernary,
    convertTernaryToIfElse,
    convertToTemplateLiteral,
    extractVariable,
    flipIfElse,
    flipTernary,
    inlineVariableOrFunction,
    mergeIfStatements,
    mergeWithPreviousIfStatement,
    moveStatementDown,
    moveStatementUp,
    negateExpression,
    reactConvertToPureComponent,
    removeBracesFromArrowFunction,
    removeDeadCode,
    removeRedundantElse,
    renameSymbol,
    replaceBinaryWithAssignment,
    splitDeclarationAndInitialization,
    splitIfStatement
  ].forEach(({ command }) =>
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `abracadabra.${command.key}`,
        createCommand(command.operation)
      )
    )
  );

  SUPPORTED_LANGUAGES.forEach(language => {
    vscode.languages.registerCodeActionsProvider(
      language,
      new RefactoringActionProvider([
        addBracesToArrowFunction,
        addBracesToIfStatement,
        bubbleUpIfStatement,
        convertForToForeach,
        convertIfElseToSwitch,
        convertIfElseToTernary,
        convertTernaryToIfElse,
        convertToTemplateLiteral,
        flipIfElse,
        flipTernary,
        mergeIfStatements,
        mergeWithPreviousIfStatement,
        negateExpression,
        reactConvertToPureComponent,
        removeBracesFromArrowFunction,
        removeDeadCode,
        removeRedundantElse,
        replaceBinaryWithAssignment,
        splitDeclarationAndInitialization,
        splitIfStatement
      ]),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite]
      }
    );
  });
}

export function deactivate() {}
