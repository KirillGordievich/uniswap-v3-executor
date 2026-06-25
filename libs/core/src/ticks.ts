const feeTickSpacingMap = new Map<number, number>([
  [0.0001, 1],
  [0.0005, 10],
  [0.003, 60],
  [0.01, 200],
]);

export function getTickSpacingFromFee(fee: number): number | undefined {
  return feeTickSpacingMap.get(fee);
}

export function getCompressedTick(tick: number, tickSpacing: number): number {
  return Math.floor(tick / tickSpacing);
}

export function getUncompressedTick(tick: number, tickSpacing: number): number {
  return tick * tickSpacing;
}

export function getTickWord(tick: number): number {
  return tick >> 8;
}

export function getFirstTickInTickWord(tickWord: number): number {
  return tickWord << 8;
}

export function getLastTickInTickWord(tickWord: number): number {
  return ((tickWord + 1) << 8) - 1;
}
