export interface ITokenDB {
  id: string;
  address: Buffer;
  decimals: number;
  symbol: string;
  name: string;
  createdAt: Date;
}

export interface ITokenResponse {
  id: string;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  createdAt: Date;
}
