import { ApiProperty } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";
import { ObjectLiteral } from "typeorm";

declare module "typeorm" {
    interface SelectQueryBuilder<Entity extends ObjectLiteral> {
        getRawManyAndCount(type: any);
    }
}

export function MapCol(a: string) {
    function decorator(target: Object, property: string): void {
        if (!(target as any)._params) {
            target.constructor.prototype._params = [];
        }
        (target as any)._params.push(a + " as " + property);
    }
    return applyDecorators(ApiProperty(), decorator);
}