import { ethers } from 'ethers';
import { format } from 'node:util';

import { IERC20ABI, ISwapRouter02ABI } from '@libs/abi';

import { encodePath, Path } from './path';

const ifaceToken = new ethers.utils.Interface(IERC20ABI);
const ifaceRouter = new ethers.utils.Interface(ISwapRouter02ABI);

export type Calldata = { data: string; payload: string };

function stringify(...params: unknown[]): string {
  if (params.length > 1) {
    return params.map((param) => stringify(param)).join(',');
  }

  const [param] = params;

  if (Array.isArray(param)) {
    return '[' + stringify(...param) + ']';
  }

  return String(param);
}

export function calldataTokenAllowance(owner: string, spender: string): Calldata {
  const method = 'allowance(address,address)';
  const values = [owner, spender];
  const data = ifaceToken.encodeFunctionData(method, values);

  const payload = format('allowance(%s)', stringify(...values));

  return { data, payload };
}

export function calldataTokenApprove(spender: string, amount: number | bigint): Calldata {
  const method = 'approve(address,uint256)';
  const values = [spender, amount];
  const data = ifaceToken.encodeFunctionData(method, values);

  const payload = format('approve(%s)', stringify(...values));

  return { data, payload };
}

export function calldataTokenBalanceOf(address: string): Calldata {
  const method = 'balanceOf(address)';
  const values = [address];
  const data = ifaceToken.encodeFunctionData(method, values);

  const payload = format('balanceOf(%s)', stringify(...values));

  return { data, payload };
}

export function calldataTokenTransfer(recipient: string, amount: number | bigint): Calldata {
  const method = 'transfer(address,uint256)';
  const values = [recipient, amount];
  const data = ifaceToken.encodeFunctionData(method, values);

  const payload = format('transfer(%s)', stringify(...values));

  return { data, payload };
}

export function calldataRouterExactInputSingle(
  tokenIn: string,
  tokenOut: string,
  fee: number | bigint,
  recipient: string,
  amountIn: number | bigint,
  amountOutMinimum: number | bigint,
  sqrtPriceLimitX96: number | bigint,
): Calldata {
  const method = 'exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))';
  const params = { tokenIn, tokenOut, fee, recipient, amountIn, amountOutMinimum, sqrtPriceLimitX96 };
  const data = ifaceRouter.encodeFunctionData(method, [params]);

  const payload = format('exactInputSingle((%s))', stringify(...Object.values(params)));

  return { data, payload };
}

export function calldataRouterExactInput(
  path: Path,
  recipient: string,
  amountIn: number | bigint,
  amountOutMinimum: number | bigint,
): Calldata {
  const method = 'exactInput((bytes,address,uint256,uint256))';
  const params = { path: encodePath(path), recipient, amountIn, amountOutMinimum };
  const data = ifaceRouter.encodeFunctionData(method, [params]);

  const payload = format('exactInput((%s))', stringify(path, recipient, amountIn, amountOutMinimum));

  return { data, payload };
}

export function calldataRouterExactOutputSingle(
  tokenIn: string,
  tokenOut: string,
  fee: number | bigint,
  recipient: string,
  amountInMaximum: number | bigint,
  amountOut: number | bigint,
  sqrtPriceLimitX96: number | bigint,
): Calldata {
  const method = 'exactOutputSingle((address,address,uint24,address,uint256,uint256,uint160))';
  const params = { tokenIn, tokenOut, fee, recipient, amountInMaximum, amountOut, sqrtPriceLimitX96 };
  const data = ifaceRouter.encodeFunctionData(method, [params]);

  const payload = format('exactOutputSingle((%s))', stringify(...Object.values(params)));

  return { data, payload };
}

export function calldataRouterExactOutput(
  path: Path,
  recipient: string,
  amountInMaximum: number | bigint,
  amountOut: number | bigint,
): Calldata {
  const method = 'exactOutput((bytes,address,uint256,uint256))';
  const params = { path: encodePath(path), recipient, amountInMaximum, amountOut };
  const data = ifaceRouter.encodeFunctionData(method, [params]);

  const payload = format('exactOutput((%s))', stringify(path, recipient, amountInMaximum, amountOut));

  return { data, payload };
}

export function calldataRouterUnwrapWeth(amountMinimum: number | bigint, recipient: string): Calldata {
  const method = 'unwrapWETH9(uint256,address)';
  const values = [amountMinimum, recipient];
  const data = ifaceRouter.encodeFunctionData(method, values);

  const payload = format('unwrapWETH9(%s)', stringify(...values));

  return { data, payload };
}

export function calldataRouterRefundEth(): Calldata {
  const method = 'refundETH()';
  const data = ifaceRouter.encodeFunctionData(method, []);

  const payload = method;

  return { data, payload };
}

export function calldataRouterMulticall(deadline: number, calls: Calldata[]): Calldata {
  const method = 'multicall(uint256,bytes[])';
  const values = [deadline, calls.map((cd) => cd.data)];
  const data = ifaceRouter.encodeFunctionData(method, values);

  const payloads = calls.map((cd) => cd.payload);
  const payload = format('multicall(%s)', stringify(deadline, payloads));

  return { data, payload };
}
