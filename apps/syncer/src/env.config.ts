import { Exclude, Expose, Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const toInt = ({ value }: { value: string }): number => parseInt(value, 10);
const toBool = ({ value }: { value: string }): boolean => value === 'true';

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL is required' })
  DATABASE_URL: string;

  @Expose()
  @IsInt({ message: 'SYNCER_PORT must be an integer' })
  @Min(1)
  @Transform(toInt, { toClassOnly: true })
  SYNCER_PORT: number;

  @Expose()
  @IsInt({ message: 'SYNCER_POOL_LVC_SIZE must be an integer' })
  @Min(1)
  @Transform(toInt, { toClassOnly: true })
  SYNCER_POOL_LVC_SIZE: number;

  @Expose()
  @IsInt({ message: 'SYNCER_POOL_TICK_RANGE_SIZE must be an integer' })
  @Min(1)
  @Transform(toInt, { toClassOnly: true })
  SYNCER_POOL_TICK_RANGE_SIZE: number;

  // --- Ethers providers (all optional, but at least one must be enabled at runtime) ---

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(toBool, { toClassOnly: true })
  ETHERS_ANKR_ENABLED: boolean = false;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_ANKR_URL: string;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_ANKR_API_KEY: string;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_ANKR_TIMEOUT: number;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_ANKR_PRIORITY: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(toBool, { toClassOnly: true })
  ETHERS_GETBLOCK_ENABLED: boolean = false;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_GETBLOCK_URL: string;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_GETBLOCK_API_KEY: string;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_GETBLOCK_TIMEOUT: number;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_GETBLOCK_PRIORITY: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(toBool, { toClassOnly: true })
  ETHERS_LLAMANODES_ENABLED: boolean = false;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_LLAMANODES_URL: string;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_LLAMANODES_API_KEY: string;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_LLAMANODES_TIMEOUT: number;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_LLAMANODES_PRIORITY: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(toBool, { toClassOnly: true })
  ETHERS_NOWNODES_ENABLED: boolean = false;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_NOWNODES_URL: string;

  @Expose()
  @IsString()
  @IsOptional()
  ETHERS_NOWNODES_API_KEY: string;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_NOWNODES_TIMEOUT: number;

  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(toInt, { toClassOnly: true })
  ETHERS_NOWNODES_PRIORITY: number;
}
