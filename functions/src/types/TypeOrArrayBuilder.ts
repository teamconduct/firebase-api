import { ILogger, ITypeBuilder } from 'firebase-function';

export class TypeOrArrayBuilder<V, T> implements ITypeBuilder<V | V[], T | T[]> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: V | V[], logger: ILogger): T | T[] {
        if (Array.isArray(value))
            return value.map(v => this.builder.build(v, logger));
        return this.builder.build(value, logger);
    }
}
