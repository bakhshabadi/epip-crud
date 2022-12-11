import { applyDecorators, Controller, Type } from "@nestjs/common";
import { ApiExtraModels, ApiHeader, ApiTags } from "@nestjs/swagger";
import { IResponseAll } from "../types";

export const ApiController = <TModel extends Type<any>>(
    model: TModel,options:any
  ) => {
    return applyDecorators(
      ApiTags(options?.tagName || model.name),
      Controller({
        version: options.version || '1',
        path:options?.url || model.name,  
      }),
      ApiExtraModels(model),
      ApiExtraModels(IResponseAll)
    );
  };