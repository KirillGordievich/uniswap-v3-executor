import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class TokenResponseDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiProperty()
  decimals: number;

  @Expose()
  @ApiProperty()
  symbol: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  static create(this: void, input: unknown): TokenResponseDTO {
    return plainToInstance(TokenResponseDTO, input, { strategy: 'excludeAll' });
  }
}
