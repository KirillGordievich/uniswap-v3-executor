import { Decimal } from 'decimal.js';
import hre from 'hardhat';

export default async function globalSetup(): Promise<void> {
  Decimal.set({ precision: 128, rounding: Decimal.ROUND_DOWN });
  await hre.run('compile');
}
