declare type Operation = any;
export declare class TextOperation {
    private ops;
    private baseLength;
    private targetLength;
    static fromString(operationsString: string): TextOperation;
    equals(operation: TextOperation): boolean;
    static isRetain(op: Operation): boolean;
    static isInsert(op: Operation): boolean;
    static isDelete(op: Operation): boolean;
    retain(n: Operation): TextOperation;
    insert(str: Operation): this;
    delete(fragment: Operation): this;
    isNoop(): boolean;
    toString(): string;
    apply(rawString: string): string;
    invert(str: string): TextOperation;
    compose(otherOperation: TextOperation): TextOperation;
    static getSimpleOp(operation: TextOperation): any;
    static getStartIndex(operation: TextOperation): any;
    shouldBeComposedWith(other: TextOperation): boolean;
    shouldBeComposedWithInverted(other: TextOperation): boolean;
    static transform(operation1: TextOperation, operation2: TextOperation): TextOperation[];
}
export {};
