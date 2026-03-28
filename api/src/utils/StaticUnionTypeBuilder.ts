import { ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class StaticUnionTypeBuilder<UnionT, Raw, T> implements ITypeBuilder<Raw | UnionT, T | UnionT> {

    constructor(
        private readonly isUnionType: (raw: Raw | UnionT) => raw is UnionT,
        private readonly typeBuilder: ITypeBuilder<Raw, T>
    ) {}

    public build(raw: Raw | UnionT): T | UnionT {
        if (this.isUnionType(raw))
            return raw;
        return this.typeBuilder.build(raw);
    }

    public static doNotUpdate<Raw, T>(typeBuilder: ITypeBuilder<Raw, T>): StaticUnionTypeBuilder<'do-not-update', Raw, T> {
        return new StaticUnionTypeBuilder<'do-not-update', Raw, T>((raw): raw is 'do-not-update' => raw === 'do-not-update', typeBuilder);
    }

    public static doNotUpdateRemove<Raw, T>(typeBuilder: ITypeBuilder<Raw, T>): StaticUnionTypeBuilder<'do-not-update' | 'remove', Raw, T> {
        return new StaticUnionTypeBuilder<'do-not-update' | 'remove', Raw, T>((raw): raw is 'do-not-update' | 'remove' => raw === 'do-not-update' || raw === 'remove', typeBuilder);
    }
}
