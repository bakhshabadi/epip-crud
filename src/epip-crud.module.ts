import { Module, DynamicModule, HttpException, HttpStatus } from '@nestjs/common';
import * as decorators from './decorators';
import * as services from './services';
import * as controllers from './controllers';
import * as types from './types';
import { SelectQueryBuilder } from 'typeorm';
import to from 'await-to-js';

@Module({})
export class EpipCrudModule {
  static register(): DynamicModule {
    SelectQueryBuilder.prototype.getMapRawManyAndCount = async function (type: any): Promise<[any[], number]> {
      let [err, count] = await to(this.select((type as any).prototype._params).getCount())
      if (err) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
      }

      let [err1, data] = await to(this.select((type as any).prototype._params).getRawMany())
      if (err1) {
        throw new HttpException(err1, HttpStatus.INTERNAL_SERVER_ERROR)
      }

      return [data as any[], count as number]
    };

    SelectQueryBuilder.prototype.getMapRawMany = async function  (type: any): Promise<any[]> {
      return this.select((type as any).prototype._params).getRawMany();
    };
    return {
      module: EpipCrudModule,
    };
  }
}
