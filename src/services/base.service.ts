import * as contextService from 'request-context';
import { to } from "await-to-js";
import { Between, DeepPartial, FindManyOptions, FindOneOptions, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { IResponse, IResponseAll, QUERY } from "../types";
import { query, Request } from "express";
import { BadGatewayException, HttpException, HttpStatus, Query, Req } from "@nestjs/common";
import _ = require("lodash");
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseService<T, IN, OUT> {

  abstract mapper(entity: T): OUT;
  constructor(
    public repo: Repository<T>,
    private relations?: Array<string>,
  ) { }

  private async getById(id): Promise<IResponse<T>> {
    const [err, result] = await to(
      this.repo.findOne({
        ...(this.relations ? { relations: this.relations } : {}),
        where: {
          id,
        },
      } as FindOneOptions)
    );
    if (err) {
      throw err
    }

    return {
      status: 200,
      result,
      message: "ok",
    } as IResponse<T>;
  }

  public async getAll(@Req() req: Request, @Query() query: IN): Promise<IResponseAll<OUT | T>> {
    let filter: FindManyOptions = {
      ...(this.relations ? { relations: this.relations } : {}),
      ...(req.query.offset ? { skip: +req.query.offset } : { skip: 0 }),
      ...(req.query.limit ? { take: +req.query.limit } : { take: 20 }),
      order: {
        id: "ASC"
      },
      where: {},
    }

    let sqlWhere = [];
    let sqlValues = {};

    _(query).map((f, key) => {
      let commands = key.split("__");
      if (commands.length == 1) {
        if (!['offset', 'limit'].find(c => c == key)) {
          // let hasProperty = Object.keys(query).find(row => row == f);
          // if (!hasProperty) {
          //   throw new BadGatewayException(`[${f}] is not a valid field`);
          // }

          filter.where[key] = f;
          // sqlWhere.push(`${key} = :${key}`);
          sqlValues[key] = f;
        }
      } else {

        // let hasProperty = Object.keys(query).find(f => f == commands[0]);
        // if (!hasProperty) {
        //   throw new BadGatewayException(`[${commands[0]}] is not a valid field`);
        // }

        function simpleJsonToNestedProps(str_splitter, arr, value) {
          var obj = null;
          let split_str = str_splitter.split("__");
          let lenghtOfString = split_str.length;

          if (lenghtOfString > 2) {

            let key = split_str.splice(0, 1);
            if (!arr[key]) {
              arr[key] = {}
            }
            return simpleJsonToNestedProps(split_str.join("__"), arr[key], value);
          } else if (lenghtOfString == 2) {
            let key = split_str.splice(0, 1);
            arr[key] = value;
            return key;
          }
        }

        let key="";
        switch (commands[commands.length - 1]) {
          case 'isnull':
            if (f.toLowerCase() == 'true') {
              simpleJsonToNestedProps(commands.join('__'), filter.where, IsNull());
            }
            break;
          case 'like':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, Like(`%${f}%`));

            sqlValues[key] = f;
            break;
          case 'gte':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, MoreThanOrEqual(f));
            sqlValues[key] = f;
            break;
          case 'lte':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, LessThanOrEqual(f));  
            sqlValues[key] = f;
            break;
          case 'gt':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, MoreThan(f));  
            sqlValues[key] = f;
            break;
          case 'lt':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, LessThan(f));  
            sqlValues[key] = f;
            break;
          case 'between':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, Between(f.split(',')[0], f.split(',')[1]));  
            sqlValues[key] = f;
            break;
          case 'in':
            key = simpleJsonToNestedProps(commands.join('__'), filter.where, In(f.split(',')));  
            sqlValues[key] = f;
            break;
        }
      }
    }).value();

    const [err, [results, count]] = await to(this.repo.findAndCount(filter as FindManyOptions));
    if (err) {
      return {
        count: 0,
        status: 500,
        message: err.message,
        results: []
      };
    }

    return {
      count,
      status: 200,
      message: "ok",
      results: this.mapper ? results.map(f => this.mapper(f)) : results,
    };
  }

  public async get(req: Request, id: number): Promise<IResponse<OUT | T>> {
    const [err, res] = await to(this.getById(id));
    if (err) {
      return {
        status: 500,
        message: err.message,
      }
    }

    return {
      status: 200,
      message: "ok",
      result: this.mapper ? this.mapper(res.result) : res.result,
    };
  }

  public async post(req: Request, entity: DeepPartial<T>): Promise<IResponse<T | OUT>> {
    delete (entity as any).jwt;
    
    const [err, result] = await to(this.repo.save(entity));
    if (err) {
      return {
        status: 500,
        message: err.message,
      } as IResponse<T>;
    }

    return {
      status: 201,
      message: "ok",
      result: this.mapper ? this.mapper(result) : result,
    };
  }

  public async put(req: Request, id: number, entity: DeepPartial<T>): Promise<IResponse<T | OUT>> {
    let [err, results] = await to(this.getById(id));
    if (err) {
      return {
        status: 500,
        message: err.message,
      } as IResponse<T>;
    }

    let data: T;
    if (results?.result) {
      data = results?.result;
      for (const key in entity as any) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const element = entity[key];
          data[key] = entity[key]
        }
      }
    } else {
      return {
        status: 404,
        message: "not found record",
      } as IResponse<T>;
    }

    let res;
    if (this.relations) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (this.relations.includes(key)) {
            delete data[key];
          }
        }
      }
    }

    delete (data as any).jwt;

    [err, res] = await to(this.repo.update(id, data as QueryDeepPartialEntity<T>));
    if (err) {
      return {
        status: 500,
        message: err.message,
      } as IResponse<T>;
    }

    if (res?.affected) {
      return {
        status: 200,
        message: "ok",
        result: this.mapper ? this.mapper(data) : data,
      };
    } else {
      return {
        status: 500,
        message: 'error !.',
      } as IResponse<T>;
    }
  }

  public async patch(req: Request, id: number, entity: QueryDeepPartialEntity<T>): Promise<IResponse<T | OUT>> {
    let [err, results] = await to(this.get(req, id));
    if (err) {
      return {
        status: 501,
        message: err.message,
      } as IResponse<T>;
    }

    delete (entity as any).jwt;

    const [err1, resUpdate] = await to(this.repo.update(id, entity));
    console.log(err1)
    if (err1) {
      return {
        status: 502,
        message: err1.message,
      } as IResponse<T>;
    }

    if (resUpdate?.affected) {
      return {
        status: 200,
        message: "ok",
        result: this.mapper ? this.mapper(entity as T) : entity as T,
      };
    } else {
      return {
        status: 503,
        message: 'error !.',
      } as IResponse<T>;
    }
  }

  public async delete(req: Request, id: number): Promise<IResponse<T>> {
    let [err, results] = await to(this.getById(id));
    if (err) {
      return {
        status: 500,
        message: err.message,
      } as IResponse<T>;
    }

    let data: T | OUT;
    if (results?.result) {
      data = results?.result;
      if (this.relations) {
        for (const key in data as T[]) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (this.relations.includes(key)) {
              delete data[key];
            }
          }
        }
      }

      let [errDelete, resultsDelete] = await to(this.repo.softDelete(id));
      if (errDelete) {
        return {
          status: 500,
          message: "not found record",
        } as IResponse<T>;
      } else {
        return {
          status: 200,
          message: "ok",
        } as IResponse<T>;
      }

    } else {
      return {
        status: 404,
        message: "not found record",
      } as IResponse<T>;
    }
  }


  public getJwtClaim(claim: string, error?: string) {
    let meId = contextService.get('request:user.' + claim);
    if (!meId) {
      throw new HttpException(error || 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    return meId;
  }
}
