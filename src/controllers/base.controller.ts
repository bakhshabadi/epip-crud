import { Logger } from "winston";
declare var  Logger:any;

export class BaseController {
    protected logger: Logger
    constructor(){
        this.logger=new Logger();
    }
}