/**
 * A lightweight, immutable Decimal class to handle financial calculations
 * with precision, avoiding JavaScript's floating-point errors.
 *
 * Example: 0.1 + 0.2 in JS is 0.30000000000000004
 * With Decimal: new Decimal(0.1).add(new Decimal(0.2)).toNumber() === 0.3
 */
export class Decimal {
    private readonly value: number;
    private static readonly PRECISION = 10; // Use a high precision for internal calculations
    private static readonly FACTOR = Math.pow(10, Decimal.PRECISION);

    constructor(value: number | string) {
        if (typeof value === 'string') {
            this.value = Math.round(parseFloat(value) * Decimal.FACTOR);
        } else {
            this.value = Math.round(value * Decimal.FACTOR);
        }
    }

    private fromValue(value: number): Decimal {
        const d = new Decimal(0);
        // This is a private way to create a new instance without re-rounding
        (d as any).value = value;
        return d;
    }
    
    add(other: Decimal): Decimal {
        return this.fromValue(this.value + other.value);
    }

    subtract(other: Decimal): Decimal {
        return this.fromValue(this.value - other.value);
    }
    
    multiply(other: Decimal): Decimal {
        return this.fromValue(Math.round((this.value * other.value) / Decimal.FACTOR));
    }

    divide(other: Decimal): Decimal {
        if (other.value === 0) throw new Error("Division by zero");
        return this.fromValue(Math.round((this.value * Decimal.FACTOR) / other.value));
    }

    isPositive(): boolean {
        return this.value > 0;
    }

    abs(): Decimal {
        return this.fromValue(Math.abs(this.value));
    }

    toNumber(): number {
        return this.value / Decimal.FACTOR;
    }

    toFixed(places: number): string {
        return this.toNumber().toFixed(places);
    }
    
    toCurrency(digits: number = 2): string {
        return this.toNumber().toLocaleString('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
    }
}
