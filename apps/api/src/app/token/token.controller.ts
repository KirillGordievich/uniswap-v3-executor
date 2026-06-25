import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

import { BadRequestExceptionDTO, UnauthorizedExceptionDTO, NotFoundExceptionDTO } from '../common/dto/error.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

import { TokenParamDTO, TokenResponseDTO } from './dto';
import { TokenService } from './token.service';

@Controller('v1/tokens')
@ApiTags('Tokens')
@ApiSecurity('api-key')
@ApiBadRequestResponse({ type: BadRequestExceptionDTO, description: 'Bad Request' })
@ApiUnauthorizedResponse({ type: UnauthorizedExceptionDTO, description: 'Unauthorized' })
@ApiNotFoundResponse({ type: NotFoundExceptionDTO, description: 'Not found' })
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  async list(): Promise<TokenResponseDTO[]> {
    const tokens = await this.tokenService.list();

    return tokens.map((t) => TokenResponseDTO.create(t));
  }

  @Get(':address')
  @UseGuards(ApiKeyGuard)
  async retrieve(@Param() params: TokenParamDTO): Promise<TokenResponseDTO> {
    const token = await this.tokenService.retrieve(params.address);

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return TokenResponseDTO.create(token);
  }
}
