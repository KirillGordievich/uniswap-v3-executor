export function pipFee(fee: number): number {
  return fee * 1e6;
}

export function percentFee(fee: number): number {
  return fee * 1e-6;
}
