export class Pluralization {

    private readonly zero: string | null;

    private readonly one: string | null;

    private readonly two: string | null;

    private readonly few: string | null;

    private readonly many: string | null;

    private readonly other: string;

    public constructor(countLocals: {
        zero?: string,
        one?: string,
        two?: string,
        few?: string,
        many?: string,
        other: string
    }) {
        this.zero = countLocals.zero ?? null;
        this.one = countLocals.one ?? null;
        this.two = countLocals.two ?? null;
        this.few = countLocals.few ?? null;
        this.many = countLocals.many ?? null;
        this.other = countLocals.other;
    }

    public get(count: number): string {
        if (count === 0 && this.zero)
            return this.zero;
        else if (count === 1 && this.one)
            return this.one;
        else if (count === 2 && this.two)
            return this.two;
        else if (count > 1 && count < 5 && this.few)
            return this.few;
        else if (count >= 5 && count <= 20 && this.many)
            return this.many;
        return this.other;
    }
}
