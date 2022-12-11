import { applyDecorators, Delete, Get, Inject, Patch, Post, Put, Type, UseFilters } from "@nestjs/common";
import { ApiOkResponse, ApiParam, getSchemaPath } from "@nestjs/swagger";
import { IResponseAll } from "../types/res.interface";

export const ApiGetAll = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  let s=getSchemaPath(IResponseAll);
  return applyDecorators(
    Get(path || "/"),
    ApiOkResponse({
      schema: {
        allOf: [
          {$ref: getSchemaPath(IResponseAll)},
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model.name) },
              },
            },
          },
        ],
      },
    })
  );
};

export const ApiGet = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  return applyDecorators(
    Get(path || "/:id"),
    ApiParam({
      name: 'id',
      type: 'string'
    }),
    ApiOkResponse({
      type: model,
    })
  );
};

export const ApiPost = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  return applyDecorators(
    Post(path || "/"),
    ApiOkResponse({
      type: model,
    })
  );
};

export const ApiPut = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  return applyDecorators(
    Put(path || "/:id"),
    ApiParam({
      name: 'id',
      type: 'string',      
    }),
    ApiOkResponse({
      type: model,
    })
  );
};

export const ApiPatch = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  return applyDecorators(
    Patch(path || "/:id"),
    ApiParam({
      name: 'id',
      type: 'string'
    }),
    ApiOkResponse({
      type: model,
    })
  );
};

export const ApiDelete = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  return applyDecorators(
    Delete(path || "/:id"),
    ApiParam({
      name: 'id',
      type: 'string'
    }),
    ApiOkResponse({
      type: model,
    })
  );
};
