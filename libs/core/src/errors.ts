export class Uniswap3Error extends Error {
  public code: string;

  constructor(name: string, code: string, message: string) {
    super(message);

    this.name = name;
    this.code = code;
  }
}

function createErrorClass(name: string, code: string): new (message: string) => Uniswap3Error {
  return class extends Uniswap3Error {
    constructor(message: string) {
      super(name, code, message);
    }
  };
}

export const ApiError = createErrorClass('ApiError', 'UNI3_ERR_API');
export const DatabaseQueryError = createErrorClass('DatabaseQueryError', 'UNI3_ERR_DB_QY');
export const EvmCallError = createErrorClass('EvmCallError', 'UNI3_ERR_EVM_CALL');
export const HttpError = createErrorClass('HttpError', 'UNI3_ERR_HTTP');
export const InsufficientLiquidityError = createErrorClass('InsufficientLiquidityError', 'UNI3_ERR_INSUF_LIQ');
export const InvalidArgumentError = createErrorClass('InvalidArgumentError', 'UNI3_ERR_INVALID_ARG');
export const LensCallError = createErrorClass('LensCallError', 'UNI3_ERR_LENS_CALL');
export const MalformedDataError = createErrorClass('MalformedDataError', 'UNI3_ERR_DATA_MALFM');
export const MathError = createErrorClass('MathError', 'UNI3_ERR_MATH');
export const MisconfigurationError = createErrorClass('MisconfigurationError', 'UNI3_ERR_MISCONFIG');
export const NotFoundError = createErrorClass('NotFoundError', 'UNI3_ERR_NOT_FOUND');
export const PoolCallError = createErrorClass('PoolCallError', 'UNI3_ERR_POOL_CALL');
export const RpcError = createErrorClass('RpcError', 'UNI3_ERR_RPC');
export const TokenCallError = createErrorClass('TokenCallError', 'UNI3_ERR_TOK_CALL');
export const TransactionError = createErrorClass('TransactionError', 'UNI3_ERR_TX');
export const TraversalError = createErrorClass('TraversalError', 'UNI3_ERR_TRAV');
