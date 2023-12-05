import { applyDecorators, Delete, Get, Inject, Patch, Post, Put, Type, UseFilters } from "@nestjs/common";
import { ApiOkResponse, ApiParam, getSchemaPath } from "@nestjs/swagger";
import { IResponse, IResponseAll } from "../types/res.interface";

const getParams = url => {
  let arr = url.split('/').filter(f => f.substring(0, 1) == ":").map(f => f.substring(1));
  return arr.map(f => ApiParam({
    name: f,
    type: 'string'
  }))
}

export class AnyResponse { }

const getResponse = (model: any) => {
  if (model) {
    return [
      { $ref: getSchemaPath(IResponse) },
      {
        properties: {
          result: {
            $ref: getSchemaPath(model.name !== 'Object' ? model.name : AnyResponse.name),
          },
        },
      }
    ]
  } else {
    return [{ $ref: getSchemaPath(IResponse) }]
  }
}

export const ApiGetAll = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  if (!path) {
    path = "/";
  }
  let s = getSchemaPath(IResponseAll);
  return applyDecorators(
    Get(path || "/"),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponseAll) },
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
  if (!path) {
    path = "/:id";
  }
  return applyDecorators(
    Get(path),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          ...getResponse(model),
        ],
      },
    })
  );
};

export const ApiPost = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  if (!path) {
    path = "/";
  }

  return applyDecorators(
    Post(path),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          ...getResponse(model),
        ],
      },
    })
  );
};

export const ApiPut = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  if (!path) {
    path = "/:id";
  }

  return applyDecorators(
    Put(path || "/:id"),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          ...getResponse(model), ,
        ],
      },
    })
  );
};

export const ApiPatch = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  if (!path) {
    path = "/:id";
  }
  return applyDecorators(
    Patch(path || "/:id"),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          ...getResponse(model),
        ],
      },
    })
  );
};

export const ApiDelete = <TModel extends Type<any>>(
  model: TModel,
  path?: string
) => {
  if (!path) {
    path = "/:id";
  }
  return applyDecorators(
    Delete(path || "/:id"),
    ...getParams(path),
    ApiOkResponse({
      schema: {
        allOf: [
          ...getResponse(model),
        ],
      },
    })
  );
};
