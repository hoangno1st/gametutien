export function formatGameNumber(value: number, decimals = 2): string {
    if (!Number.isFinite(value)) return "0";
    const safeDecimals = Math.min(6, Math.max(0, Math.floor(decimals)));
    const absolute = Math.abs(value);
    const units = [
        [1e12, "T"],
        [1e9, "B"],
        [1e6, "M"],
        [1e3, "K"],
    ] as const;
    for (const [threshold, suffix] of units) {
        if (absolute >= threshold) return `${(value / threshold).toFixed(safeDecimals)}${suffix}`;
    }
    return value.toFixed(safeDecimals);
}
