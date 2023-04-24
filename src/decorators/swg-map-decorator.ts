import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Type, applyDecorators } from "@nestjs/common";
import { ObjectLiteral } from "typeorm";

declare module "typeorm" {
    interface SelectQueryBuilder<Entity extends ObjectLiteral> {
        getMapRawManyAndCount: <T>(type: any) => Promise<[T[], number]>,
        getMapRawMany: <T>(type: any) => Promise<T[]>;
    }
}

export function MapProperty(sqlSelectParams: string, options?: ApiPropertyOptions) {
    function decorator(target: Object, property: string): void {
        if (!(target as any)._params) {
            target.constructor.prototype._params = [];
        }
        (target as any)._params.push(sqlSelectParams + " as \"" + property+"\"");
    }
    return applyDecorators(ApiProperty(options), decorator);
}