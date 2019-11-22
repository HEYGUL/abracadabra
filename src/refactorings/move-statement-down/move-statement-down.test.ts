import { Editor, Code, ErrorReason } from "../../editor/editor";
import { Selection } from "../../editor/selection";
import { Position } from "../../editor/position";
import { InMemoryEditor } from "../../editor/adapters/in-memory-editor";
import { testEach } from "../../tests-helpers";

import { moveStatementDown } from "./move-statement-down";

describe("Move Statement Down", () => {
  let showErrorMessage: Editor["showError"];

  beforeEach(() => {
    showErrorMessage = jest.fn();
  });

  testEach<{
    code: Code;
    selection: Selection;
    expected: Code;
    expectedPosition: Position;
  }>(
    "should move statement down",
    [
      {
        description: "single-line statement",
        code: `console.log("I'm up");
console.log("I'm down");`,
        selection: Selection.cursorAt(0, 0),
        expected: `console.log("I'm down");
console.log("I'm up");`,
        expectedPosition: new Position(1, 0)
      },
      {
        description: "single-line statement moved below multi-lines statement",
        code: `console.log("I'm up");

if (isValid) {
  console.log("I'm down");
}`,
        selection: Selection.cursorAt(0, 0),
        expected: `if (isValid) {
  console.log("I'm down");
}

console.log("I'm up");`,
        expectedPosition: new Position(4, 0)
      },
      {
        description: "multi-lines statement",
        code: `if (isValid) {
  console.log("I'm up");
}

console.log("I'm down");`,
        selection: Selection.cursorAt(0, 0),
        expected: `console.log("I'm down");

if (isValid) {
  console.log("I'm up");
}`,
        expectedPosition: new Position(2, 0)
      },
      {
        description: "multi-lines statement moved below multi-lines statement",
        code: `if (isValid) {
  console.log("I'm up");
}

function saySomething() {
  console.log("I'm down");
}`,
        selection: Selection.cursorAt(0, 0),
        expected: `function saySomething() {
  console.log("I'm down");
}

if (isValid) {
  console.log("I'm up");
}`,
        expectedPosition: new Position(4, 0)
      },
      {
        description: "statement inside a container",
        code: `function doSomethingElse() {
  const a = 1;
  const b = 2;

  if (isValid) {
    console.log("I shouldn't move");
    console.log("Me neither");
  }
}

const hello = "world";`,
        selection: Selection.cursorAt(1, 2),
        expected: `function doSomethingElse() {
  const b = 2;
  const a = 1;

  if (isValid) {
    console.log("I shouldn't move");
    console.log("Me neither");
  }
}

const hello = "world";`,
        expectedPosition: new Position(2, 2)
      },
      {
        description: "statement inside a container, cursor at start of line",
        code: `function doSomethingElse() {
  const a = 1;
  const b = 2;

  if (isValid) {
    console.log("I shouldn't move");
    console.log("Me neither");
  }
}

const hello = "world";`,
        selection: Selection.cursorAt(1, 0),
        expected: `function doSomethingElse() {
  const b = 2;
  const a = 1;

  if (isValid) {
    console.log("I shouldn't move");
    console.log("Me neither");
  }
}

const hello = "world";`,
        expectedPosition: new Position(2, 0)
      },
      {
        description: "statement below is a function, without space in-between",
        code: `console.log("First");
function doSomething() {
  console.log("Second");
}`,
        selection: Selection.cursorAt(0, 0),
        expected: `function doSomething() {
  console.log("Second");
}

console.log("First");`,
        expectedPosition: new Position(4, 0)
      },
      {
        description: "statement below is a function, with space in-between",
        code: `console.log("First");

function doSomething() {
  console.log("Second");
}`,
        selection: Selection.cursorAt(0, 0),
        expected: `function doSomething() {
  console.log("Second");
}

console.log("First");`,
        expectedPosition: new Position(4, 0)
      },
      {
        description:
          "statement below is a function, without space in-between + statement above",
        code: `console.log("First");
console.log("Second");
function doSomething() {
  console.log("Third");
}`,
        selection: Selection.cursorAt(1, 0),
        expected: `console.log("First");

function doSomething() {
  console.log("Third");
}

console.log("Second");`,
        expectedPosition: new Position(6, 0)
      },
      {
        description: "object properties",
        code: `const data = {
  foo: "foo",
  bar: "bar",
  baz: "baz"
};
console.log("Should not move");`,
        selection: Selection.cursorAt(1, 2),
        expected: `const data = {
  bar: "bar",
  foo: "foo",
  baz: "baz"
};
console.log("Should not move");`,
        expectedPosition: new Position(2, 2)
      },
      {
        description: "object properties, cursor on closing bracket",
        code: `const data = {
  foo: "foo",
  bar: "bar",
  baz: "baz"
};
console.log("Should move");`,
        selection: Selection.cursorAt(0, 14),
        expected: `console.log("Should move");
const data = {
  foo: "foo",
  bar: "bar",
  baz: "baz"
};`,
        expectedPosition: new Position(1, 14)
      },
      {
        description: "object properties, one-liner",
        code: `const data = { foo: "foo", bar: "bar" };
console.log("Should move in this scenario");`,
        selection: Selection.cursorAt(0, 16),
        expected: `console.log("Should move in this scenario");
const data = { foo: "foo", bar: "bar" };`,
        expectedPosition: new Position(1, 16)
      },
      {
        description: "object properties, cursor after comma",
        code: `const data = {
  foo: "foo",
  bar: "bar",
  baz: "baz"
};
console.log("Should not move");`,
        selection: Selection.cursorAt(1, 13),
        expected: `const data = {
  bar: "bar",
  foo: "foo",
  baz: "baz"
};
console.log("Should not move");`,
        expectedPosition: new Position(2, 13)
      },
      {
        description: "object property, respecting trailing commas",
        code: `const data = {
  foo: "foo",
  bar: "bar",
  baz: "baz"
};`,
        selection: Selection.cursorAt(2, 2),
        expected: `const data = {
  foo: "foo",
  baz: "baz",
  bar: "bar"
};`,
        expectedPosition: new Position(3, 2)
      },
      {
        description: "object method",
        code: `const data = {
  foo() {
    return "foo";
  },
  bar: "bar"
};`,
        selection: Selection.cursorAt(1, 2),
        expected: `const data = {
  bar: "bar",

  foo() {
    return "foo";
  }
};`,
        expectedPosition: new Position(3, 2)
      },
      {
        description: "class method",
        code: `class Node {
  getName() {
    return "foo";
  }

  getSize() {
    return 1;
  }
}`,
        selection: Selection.cursorAt(1, 2),
        expected: `class Node {
  getSize() {
    return 1;
  }

  getName() {
    return "foo";
  }
}`,
        expectedPosition: new Position(5, 2)
      },
      {
        description: "class property",
        code: `class Node {
  name = "foo"

  getSize() {
    return 1;
  }
}`,
        selection: Selection.cursorAt(1, 2),
        expected: `class Node {
  getSize() {
    return 1;
  }

  name = "foo";
}`,
        expectedPosition: new Position(5, 2)
      },
      {
        description: "class method without space between methods",
        code: `class Node {
  getName() {
    return "foo";
  }
  getSize() {
    return 1;
  }
}`,
        selection: Selection.cursorAt(1, 2),
        expected: `class Node {
  getSize() {
    return 1;
  }
  getName() {
    return "foo";
  }
}`,
        expectedPosition: new Position(4, 2)
      },
      {
        description: "object method without space between methods",
        code: `const node = {
  getName() {
    return "foo";
  },
  getSize() {
    return 1;
  }
}`,
        selection: Selection.cursorAt(1, 2),
        expected: `const node = {
  getSize() {
    return 1;
  },
  getName() {
    return "foo";
  }
}`,
        expectedPosition: new Position(4, 2)
      }
    ],
    async ({ code, selection, expected, expectedPosition }) => {
      const result = await doMoveStatementDown(code, selection);

      expect(result.code).toBe(expected);
      expect(result.position).toStrictEqual(expectedPosition);
    }
  );

  it("should do nothing, nor show an error message if selected statement is at the bottom of the file", async () => {
    const code = `console.log(
  "nothing below this statement"
)`;
    const selection = Selection.cursorAt(0, 0);

    const result = await doMoveStatementDown(code, selection);

    expect(result.code).toBe(code);
    expect(showErrorMessage).not.toBeCalled();
  });

  it("should show an error message for multi-lines selections", async () => {
    const code = `console.log("First");
console.log("Second");
console.log("Third")`;
    const selection = new Selection([1, 0], [2, 0]);

    await doMoveStatementDown(code, selection);

    expect(showErrorMessage).toBeCalledWith(
      ErrorReason.CantMoveMultiLinesStatementDown
    );
  });

  it("should show an error message if selection is invalid", async () => {
    const code = `console.log("First");`;
    const invalidSelection = Selection.cursorAt(2, 0);

    await doMoveStatementDown(code, invalidSelection);

    expect(showErrorMessage).toBeCalledWith(ErrorReason.CantMoveStatementDown);
  });

  async function doMoveStatementDown(
    code: Code,
    selection: Selection
  ): Promise<{ code: Code; position: Position }> {
    const editor = new InMemoryEditor(code);
    editor.showError = showErrorMessage;
    await moveStatementDown(code, selection, editor);
    return { code: editor.code, position: editor.position };
  }
});
