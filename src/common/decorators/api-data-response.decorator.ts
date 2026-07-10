import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

/**
 * 성공 응답을 { data: T } 형태로 Swagger에 명시한다.
 * ResponseInterceptor의 런타임 래핑과 스펙을 일치시켜,
 * 프론트(openapi-typescript) 생성 타입이 실제 응답과 어긋나지 않게 한다.
 *
 * @example
 *   @ApiDataResponse(UserResponseDto)              // { data: UserResponseDto }
 *   @ApiDataResponse(UserResponseDto, { isArray: true }) // { data: UserResponseDto[] }
 */
export const ApiDataResponse = <TModel extends Type<unknown>>(
  model: TModel,
  options: { isArray?: boolean; status?: number; description?: string } = {},
) => {
  const { isArray = false, status = 200, description } = options;
  const dataSchema = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [{ $ref: getSchemaPath(ResponseDto) }, { properties: { data: dataSchema } }],
      },
    }),
  );
};
