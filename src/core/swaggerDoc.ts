import winston, { level, loggers } from "winston";
import Controller, { Methods } from "../core/controller";

// TODO : dynamic set status code and its message 
interface schemas {
    properties_name: string
    required: boolean,
    schemaName: string
}
/**
 * "/pet":
            {
                put: {
                    summary: "Update an existing pet",
                    responses: {
                        "400": { description: "Invalid ID supplied" },
                        "404": { description: "Pet not found" },
                        "405": { description: "Validation exception" }
                    }
                },
                post: {
                    summary: "Add a new pet to the store",
                    responses: {
                        "405": { description: "Invalid input" }
                    }
                }
            },
            "/pet/findByStatus":
            {
                get: {
                    summary: "Finds Pets by status",
                    responses: {
                        "200": {
                            description: "successful operation"
                        },
                        "400": {
                            description: "Invalid status value"
                        }
                    }
                }
            }, "/pet/findByTags": {
                get: {
                    summary: "Finds Pets by tags",
                    responses: {
                        "200": { description: "successful operation" },
                        "400": { description: "Invalid tag value" }
                    }
                }
            }
 */

interface API {
    path: string,
    method: Methods,
    summary?: string,
    rootPath?: string,
}
interface swaggerConfig {
    info: {
        title: string,
        description?: string,
        version: string,
    },
    servers: {
        url: string,
        description?: string
    }[]
}
export default class ASwaggerDoc {

    private _swaggerDoc:any = {
        openapi: "3.0.0",
        info: {
            title: "Swagger Petstore",
            description: "This is a sample Petstore server.  You can find\nout more about Swagger at\n",
            version: "1.0.0"
        },
        tags:[],
        servers: [
            {
                url: "https://virtserver.swaggerhub.com/avinashsingh/test/1.0.0",
                description: "SwaggerHub API Auto Mocking"
            },
            { url: "https://petstore.swagger.io/v2" }
        ], paths: {

        }, components: {}
    }
    private apis: API[] = [];
    constructor(controllers: Array<Controller>, swaggerConfig: swaggerConfig) {
        this._swaggerDoc.info = swaggerConfig.info;
        this._swaggerDoc.server = swaggerConfig.servers;
        controllers.forEach(controller => {
            this.setAPI(controller)
        });
    }
    setAPI(con: Controller) {
        con.initRoutes().forEach(path => {
            this.apis.push({
                rootPath: con.path,
                path: path.path,
                method: path.method,
                summary: path.summary
            })
        })
    }

    async getSwaggerJson(): Promise<any> {
        for (let api of this.apis) {
            const method = api.method
            const path = api.path;
            const rootPath = api.rootPath + path;

            if(this._swaggerDoc.tags.findIndex((i:any)=>i.name===api.rootPath)==-1){
                this._swaggerDoc.tags.push({
                    name:api.rootPath
                })
            }

            if (api.rootPath != "/") {
                const tag=api.rootPath;
                if (rootPath in this._swaggerDoc.paths) {
                    this._swaggerDoc.paths[rootPath][method.toLowerCase()] = {}
                    this._swaggerDoc.paths[rootPath][method.toLowerCase()] = {
                        tags:[tag],
                        summary: api.summary??"This is API defult description",
                        responses: {
                            200: {
                                description: "successful operation"
                            }
                        }
                    }
                }
               else{
                this._swaggerDoc.paths[rootPath] = {};
                this._swaggerDoc.paths[rootPath][method.toLowerCase()] = {}
                this._swaggerDoc.paths[rootPath][method.toLowerCase()] = {
                    tags:[tag],
                    summary: api.summary??"This is API defult description",
                    responses: {
                        200: {
                            description: "successful operation"
                        }
                    }
                }
               }
            } else {
                const tag=api.rootPath;
                if (path in this._swaggerDoc.paths) {
                    this._swaggerDoc.paths[path][method.toLowerCase()] = {
                        tags:[tag],
                        summary: api.summary ?? "This is API defult description",
                        responses: {
                            200: {
                                description: "successful operation"
                            }
                        }
                    }
                } else {
                    this._swaggerDoc.paths[path] = {};
                    this._swaggerDoc.paths[path][method.toLowerCase()] = {
                        tags:[tag],
                        summary: api.summary ?? "This is API defult description",
                        responses: {
                            200: {
                                description: "successful operation"
                            }
                        }
                    }
                }

            }
        }
        const logger=winston.createLogger({
            level:'info',
            format:winston.format.json(),
            transports:[
                new winston.transports.File({ filename: 'combined.log' }),
            ]
        })
        logger.log(
            {
                level:'info',
                message:this._swaggerDoc
            }
        )
        return this._swaggerDoc;
    }

}