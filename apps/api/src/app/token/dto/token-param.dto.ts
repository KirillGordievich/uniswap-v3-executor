import { Exclude, Expose } from 'class-transformer';
import { IsHexadecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class TokenParamDTO {
  @Expose()
  @IsHexadecimal()
  @ApiProperty({ description: 'Ethereum address (hex, without 0x prefix)' })
  address: string;
}
