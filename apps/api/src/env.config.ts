import { Exclude, Expose, Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL is required' })
  DATABASE_URL: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'API_HOST is required' })
  API_HOST: string;

  @Expose()
  @IsInt({ message: 'API_PORT must be an integer' })
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  API_PORT: number;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'API_KEY is required' })
  API_KEY: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'SYNCER_GRPC_URL is required' })
  SYNCER_GRPC_URL: string;
}
