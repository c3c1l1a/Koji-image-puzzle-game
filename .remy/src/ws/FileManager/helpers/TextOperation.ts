// Handle operations for collaborative editing
// tslint:disable

type Operation = any;

export class TextOperation {
  private ops: Operation[] = [];
  private baseLength: number = 0;
  private targetLength: number = 0;

  // Convenience constructor from JSON string of ops
  static fromString(operationsString: string) {
    const operations = JSON.parse(operationsString);

    const newOperation = new TextOperation();
    operations.forEach((op: Operation) => {
      if (TextOperation.isRetain(op)) {
        newOperation.retain(op);
      } else if (TextOperation.isInsert(op)) {
        newOperation.insert(op);
      } else if (TextOperation.isDelete(op)) {
        newOperation.delete(op);
      }
    });

    return newOperation;
  }

  equals(operation: TextOperation) {
    if (this.baseLength !== operation.baseLength) {
      return false;
    }
    if (this.targetLength !== operation.targetLength) {
      return false;
    }
    if (this.ops.length !== operation.ops.length) {
      return false;
    }

    return this.ops
      .every((op, index) => op === operation.ops[index]);
  }

  static isRetain(op: Operation) {
    return typeof op === 'number' && op > 0;
  }
  static isInsert(op: Operation) {
    return typeof op === 'string';
  }
  static isDelete(op: Operation) {
    return typeof op === 'number' && op < 0;
  }

  // Skip over a given number of characters
  retain(n: Operation): TextOperation {

    if (n === 0) {
      return this;
    }
    this.baseLength += n;
    this.targetLength += n;

    if (TextOperation.isRetain(this.ops[this.ops.length - 1])) {
      // Last op is a retain, so merge into a single op
      this.ops[this.ops.length - 1] += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  // Insert a string at current pos
  insert(str: Operation) {
    if (str === '') {
      return this;
    }
    this.targetLength += str.length;

    if (TextOperation.isInsert(this.ops[this.ops.length - 1])) {
      // Merge insert with last op
      this.ops[this.ops.length - 1] += str;
    } else if (TextOperation.isDelete(this.ops[this.ops.length - 1])) {
      // Enforce insert before delete in consecutive ops
      if (TextOperation.isInsert(this.ops[this.ops.length - 2])) {
        this.ops[this.ops.length - 2] += str;
      } else {
        this.ops[this.ops.length] = this.ops[this.ops.length - 1];
        this.ops[this.ops.length - 2] = str;
      }
    } else {
      this.ops.push(str);
    }
    return this;
  }

  // Delete a string at current pos (either int or string)
  delete(fragment: Operation) {
    let n = fragment;
    if (typeof fragment === 'string') {
      n = n.length;
    }

    if (n === 0) {
      return this;
    }
    if (n > 0) {
      n = -n;
    }

    this.baseLength -= n;
    if (TextOperation.isDelete(this.ops[this.ops.length - 1])) {
      this.ops[this.ops.length - 1] += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  isNoop() {
    return this.ops.length === 0 || (this.ops.length === 1 && TextOperation.isRetain(this.ops[0]));
  }

  toString() {
    return JSON.stringify(this.ops);
  }

  // Apply operation to a string
  apply(rawString: string) {
    let index = 0;
    let string = rawString;

    this.ops.forEach((op: Operation) => {
      if (TextOperation.isRetain(op)) {
        index += op;
      } else if (TextOperation.isInsert(op)) {
        string = string.substring(0, index) + op + string.substring(index);
        index += op.length;
      } else if (TextOperation.isDelete(op)) {
        string = string.substring(0, index) + string.substring(index - op);
      }
    });

    return string;
  }

  // Compute inverse of an operation for implementing undo
  invert(str: string) {
    let strIndex = 0;
    const inverseOperation = new TextOperation();

    for (let i = 0; i < this.ops.length; i += 1) {
      const op = this.ops[i];
      if (TextOperation.isRetain(op)) {
        inverseOperation.retain(op);
        strIndex += op;
      } else if (TextOperation.isInsert(op)) {
        inverseOperation.delete(op.length);
      } else {
        inverseOperation.insert(str.slice(strIndex, strIndex - op));
        strIndex -= op;
      }
    }

    return inverseOperation;
  }

  // Merge two consecurive operations into a single operation
  // that preserves the changes of both.
  // e.g., apply(apply(str, A), B) === apply(apply(str, B), A)
  compose(otherOperation: TextOperation) {
    if (this.targetLength !== otherOperation.targetLength) {
      throw new Error('base length of A must == base length of B');
    }

    const combinedOperation = new TextOperation();
    const ops1 = this.ops;
    const ops2 = otherOperation.ops;
    let i1 = 0;
    let i2 = 0;

    let op1 = ops1[i1++];
    let op2 = ops2[i2++];

    while (true) {
      // Dispatch on type of op1 and op2
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        break;
      }

      if (TextOperation.isDelete(op1)) {
        combinedOperation.delete(op1);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        combinedOperation.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error('cannot compose ops: first operation too short');
      }
      if (typeof op2 === 'undefined') {
        throw new Error('cannot compose ops: first operation too long');
      }

      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        if (op1 > op2) {
          combinedOperation.retain(op2);
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          combinedOperation.retain(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.retain(op1);
          op2 -= op1;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isDelete(op2)) {
        if (op1.length > -op2) {
          op1 = op1.slice(-op2);
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 += op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isRetain(op2)) {
        if (op1.length > op2) {
          combinedOperation.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          combinedOperation.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.insert(op1);
          op2 -= op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        if (op1 > -op2) {
          combinedOperation.delete(op2);
          op1 += op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          combinedOperation.delete(op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.delete(op1);
          op2 += op1;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(`This shouldn't happen: op1: ${JSON.stringify(op1)} / op2: ${JSON.stringify(op2)}`);
      }
    }

    return combinedOperation;
  }

  static getSimpleOp(operation: TextOperation) {
    const { ops } = operation;

    switch (ops.length) {
      case 1:
        return ops[0];
      case 2:
        if (TextOperation.isRetain(ops[0])) {
          return ops[1];
        }
        if (TextOperation.isRetain(ops[1])) {
          return ops[0];
        }
        return null;
      case 3:
        if (TextOperation.isRetain(ops[0]) && TextOperation.isRetain(ops[2])) {
          return ops[1];
        }
        return null;
      default:
        return null;
    }
  }

  static getStartIndex(operation: TextOperation) {
    if (TextOperation.isRetain(operation.ops[0])) {
      return operation.ops[0];
    }
    return 0;
  }

  // Used for undo
  shouldBeComposedWith(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);

    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);

    if (!simpleA || !simpleB) {
      return false;
    }

    if (TextOperation.isInsert(simpleA) && TextOperation.isInsert(simpleB)) {
      return (startA + simpleA.length) === startB;
    }

    if (TextOperation.isDelete(simpleA) && TextOperation.isDelete(simpleB)) {
      return ((startB - simpleB) === startA) || startB === startA;
    }

    return false;
  }

  shouldBeComposedWithInverted(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);

    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);

    if (!simpleA || !simpleB) {
      return false;
    }

    if (TextOperation.isInsert(simpleA) && TextOperation.isInsert(simpleB)) {
      return (startA + simpleA.length) === startB || startA === startB;
    }

    if (TextOperation.isDelete(simpleA) && TextOperation.isDelete(simpleB)) {
      return ((startB - simpleB) === startA);
    }

    return false;
  }

  static transform(operation1: TextOperation, operation2: TextOperation) {
    if (operation1.baseLength !== operation2.baseLength) {
      throw new Error('Both ops must have the same base length');
    }

    const operation1Prime = new TextOperation();
    const operation2Prime = new TextOperation();

    const ops1 = operation1.ops;
    const ops2 = operation2.ops;

    let i1 = 0;
    let i2 = 0;

    let op1 = ops1[i1++];
    let op2 = ops2[i2++];

    while (true) {
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.

      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding Prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (TextOperation.isInsert(op1)) {
        operation1Prime.insert(op1);
        operation2Prime.retain(op1.length);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        operation1Prime.retain(op2.length);
        operation2Prime.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too short.");
      }
      if (typeof op2 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too long.");
      }

      let minl;
      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        // Simple case: retain/retain
        if (op1 > op2) {
          minl = op2;
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 -= op1;
          op1 = ops1[i1++];
        }
        operation1Prime.retain(minl);
        operation2Prime.retain(minl);
      } else if (TextOperation.isDelete(op1) && TextOperation.isDelete(op2)) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (-op1 > -op2) {
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 -= op1;
          op1 = ops1[i1++];
        }
      // next two cases: delete/retain and retain/delete
      } else if (TextOperation.isDelete(op1) && TextOperation.isRetain(op2)) {
        if (-op1 > op2) {
          minl = op2;
          op1 += op2;
          op2 = ops2[i2++];
        } else if (-op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = -op1;
          op2 += op1;
          op1 = ops1[i1++];
        }
        operation1Prime.delete(minl);
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        if (op1 > -op2) {
          minl = -op2;
          op1 += op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          minl = op1;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 += op1;
          op1 = ops1[i1++];
        }
        operation2Prime.delete(minl);
      } else {
        throw new Error("The two operations aren't compatible");
      }
    }

    return [operation1Prime, operation2Prime];
  }
}
