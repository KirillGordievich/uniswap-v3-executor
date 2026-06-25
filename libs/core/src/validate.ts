import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const validate = <DTO extends object>(dto: Type<DTO>): ((config: Record<string, unknown>) => DTO) => {
  return function (config: Record<string, unknown>): DTO {
    const validated = plainToInstance(dto, config);

    const errors = validateSync(validated, {
      skipUndefinedProperties: false,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors.map((e) => {
        const property = e.property;
        const value = (validated as Record<string, unknown>)[property];
        const constraints = Object.values(e.constraints ?? {}).join(', ');

        return `${property}=${JSON.stringify(value)}: ${constraints}`;
      });

      throw new Error('ENV validation failed:\n' + errorMessages.join('\n'));
    }

    return validated;
  };
};
