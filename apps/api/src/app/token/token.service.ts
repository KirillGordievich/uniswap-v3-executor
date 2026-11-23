import { bufferToHex, hexToBuffer } from '@libs/core';
import { DatabaseService } from '@libs/database';
import { Logger } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ITokenDB, ITokenResponse } from './interfaces';

@Injectable()
export class TokenService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: Logger,
  ) {}

  private baseSelect(): Prisma.TokenSelect {
    return { id: true, address: true, decimals: true, symbol: true, name: true, createdAt: true };
  }

  private prepareForResponse(entity: ITokenDB): ITokenResponse {
    return {
      ...entity,
      address: bufferToHex(entity.address),
    };
  }

  async list(): Promise<ITokenResponse[]> {
    const tokens = await this.db.token.findMany({ select: this.baseSelect() });

    return (tokens as unknown as ITokenDB[]).map((t) => this.prepareForResponse(t));
  }

  async retrieve(address: string): Promise<ITokenResponse | null> {
    const token = await this.db.token.findUnique({
      where: { address: hexToBuffer(address) as unknown as Uint8Array<ArrayBuffer> },
      select: this.baseSelect(),
    });

    if (!token) {
      return null;
    }

    return this.prepareForResponse(token as unknown as ITokenDB);
  }
}
