import { ApiProperty } from '@nestjs/swagger';

export class BadRequestExceptionDTO {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;
}

export class UnauthorizedExceptionDTO {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;
}

export class NotFoundExceptionDTO {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not found' })
  message: string;
}
