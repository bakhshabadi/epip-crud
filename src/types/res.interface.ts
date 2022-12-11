import { ApiProperty } from "@nestjs/swagger";

export class IResponseAll<TData>{
    @ApiProperty()
    count:number=0;

    @ApiProperty()
    status:number=0;

    @ApiProperty()
    message?:string;

    results:Array<TData>;
}

export class IResponse<T>{
    
    @ApiProperty()
    status:number=0;

    @ApiProperty()
    message?:string;
    
    result?:T;
}