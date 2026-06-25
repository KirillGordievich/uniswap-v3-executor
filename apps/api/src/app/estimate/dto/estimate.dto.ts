import { Exclude, Expose } from 'class-transformer';
import { IsHexadecimal, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class EstimateQueryDTO {
  @Expose()
  @IsHexadecimal()
  @ApiProperty({ description: 'Sold token address (hex)' })
  tokenSellAddress: string;

  @Expose()
  @IsHexadecimal()
  @ApiProperty({ description: 'Purchased token address (hex)' })
  tokenBuyAddress: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Quantity' })
  quantity: string;
}

@Exclude()
export class EstimateResponseDTO {
  @Expose()
  @ApiProperty()
  quantity: string;

  static create(this: void, input: unknown): EstimateResponseDTO {
    return plainToInstance(EstimateResponseDTO, input, { strategy: 'excludeAll' });
  }
}
