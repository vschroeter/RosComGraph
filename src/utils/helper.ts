// Adapted from: https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
export function modPositive(n: number, m: number): number {
    return ((n % m) + m) % m;
}
