import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { BadRequestExceptionDTO, UnauthorizedExceptionDTO } from '../common/dto/error.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { EstimateQueryDTO, EstimateResponseDTO } from './dto';
import { EstimateService } from './estimate.service';

@Controller('v1/estimates')
@ApiTags('Estimates')
@ApiSecurity('api-key')
@ApiBadRequestResponse({ type: BadRequestExceptionDTO, description: 'Bad Request' })
@ApiUnauthorizedResponse({ type: UnauthorizedExceptionDTO, description: 'Unauthorized' })
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Get('buy')
  @UseGuards(ApiKeyGuard)
  async estimateBuy(@Query() query: EstimateQueryDTO): Promise<EstimateResponseDTO> {
    const quantity = await this.estimateService.estimateBuy(
      query.tokenSellAddress,
      query.tokenBuyAddress,
      query.quantity,
    );

    return EstimateResponseDTO.create({ quantity });
  }

  @Get('sell')
  @UseGuards(ApiKeyGuard)
  async estimateSell(@Query() query: EstimateQueryDTO): Promise<EstimateResponseDTO> {
    const quantity = await this.estimateService.estimateSell(
      query.tokenSellAddress,
      query.tokenBuyAddress,
      query.quantity,
    );

    return EstimateResponseDTO.create({ quantity });
  }
}
