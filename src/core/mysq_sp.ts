import mysql from 'mysql2';
import {logger} from './logger';
export default class MysqlSP {
    pool: mysql.Pool;
    constructor() {
        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            database: 'taptwointeract',
            port: 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    doQuery(query:string,args:string[]){
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                try {
                    if (err) {
                        logger.error(`[sprocs][base][getConnection] err:${err.message}`);
                        return reject(err);
                    } else {
                        conn.query({
                            sql:query,
                            values: args
                        }, (err, result, fields) => {
                            //this.pool.releaseConnection(conn);
                            if (err) {
                                logger.error(`[sprocs][base][getConnection][conn.query] err: ${err.message}`);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                } catch (error) {
                    
                }
            });
        });
    }

    connection_query(query, res = null) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                try {
                    if (err) {
                        logger.error(`[sprocs][base][getConnection] err:${err.message}`);
                        return reject(err);
                    } else {
                        conn.query(query, (err, result, fields) => {
                            //this.pool.releaseConnection(conn);
                            if (err) {
                                logger.error(`[sprocs][base][getConnection][conn.query] err: ${err.message}`);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                } catch (err) {
                    logger.error(`[sprocs][base][getConnection][conn.query] catch err:${err.message}`);
                    //  this.pool.releaseConnection(conn);
                    return reject(err);
                } finally {
                    // this.pool.releaseConnection(conn);
                }
            })
        })
    }
    pool_query(args:any[],sproc_name?:string,  res = null) {
        return new Promise((resolve, reject) => {

            const newArgs=args.map(item=>item!=undefined?`"${item}"`:`""`);
            const query = `CALL ${sproc_name}(${newArgs})`
           // logger.info(`[sprocs][base][pool_query] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    logger.error(`[sprocs][base][pool_query] err:${err.message}`);
                    return reject(err);
                }

              //  logger.error(`[sprocs][base][pool_query] query:${query} success`);
                resolve(result);
            });
        });
    }
    drop_query(sproc_name, res = null) {
        return new Promise((resolve, reject) => {

            const query = `DROP PROCEDURE IF EXISTS ${sproc_name};`
            logger.info(`[sprocs][base][drop_query] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    logger.error(`[sprocs][base][drop_query] err:${err.message}`);
                    return reject(err);
                }

               // logger.info(`[sprocs][base][drop_query] query:${query} success`);
                resolve(result);
            });
        });
    }

    get_sp_details(routine_schema, sproc_name, res = null) {
        return new Promise((resolve, reject) => {

            const query = `SELECT SPECIFIC_NAME,ROUTINE_DEFINITION  from information_schema.routines where routine_type = 'PROCEDURE' and ROUTINE_SCHEMA='${routine_schema}' and SPECIFIC_NAME = '${sproc_name}';
            `
            logger.error(`[sprocs][base][get_sp_details] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    logger.error(`[sprocs][base][get_sp_details] err:${err.message}`);
                    return reject(err);
                }

               // logger.error(`[sprocs][base][get_sp_details] query:${query} success`);
                resolve(result);
            });
        });
    }
    connection_close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if (err)
                    return reject(err);
                resolve('');
            });
        });
    }

}

export interface spDefination {
    sp_method_name: string
}

export interface queryDefination{
    query_method_name:string
}

export interface spResponse { createProcedure: string, query: string, run?:(args:string[])=>Promise<any> }

export interface queryResponse {query: string, args?:string[], run?:(args:string[])=>Promise<any> }

export const entity = (): ClassDecorator => {
    return (target: any) => {
        //Reflect.defineMetadata('prefix', '', target);
        // Since routes are set by our methods this should almost never be true (except the controller has no methods)
        if (!Reflect.hasMetadata('entity', target)) {
            const data:spDefination[]=[]
            Reflect.defineMetadata('entity', data, target);
        }
        if (!Reflect.hasMetadata('entity_query', target)) {
            const data:queryDefination[]=[]
            Reflect.defineMetadata('entity_query', data, target);
        }
    };
};

export const sp = (): MethodDecorator => {
    return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        if (!Reflect.hasMetadata('entity', target.constructor)) {
            const data:spDefination[]=[]
            Reflect.defineMetadata('entity', data, target.constructor);
        }
        const sp = Reflect.getMetadata('entity', target.constructor) as Array<spDefination>;
        // logger.error("🚀 ~ file: mysq_sp.ts ~ line 58 ~ return ~ sp", sp)
        sp.push({
            sp_method_name: propertyKey
        })
        Reflect.defineMetadata('entity', sp, target.constructor);
        const originalMethod = descriptor.value;
        descriptor.value = (...args: any[]) => {
            const result: spResponse = <spResponse>originalMethod.apply(this, args);
            // changing the return dynamically 
            const run=(args)=>{
                return new MysqlSP().pool_query(args,propertyKey);
            }
            result.run=run;
            if (!result.createProcedure && !result.query){
                throw new Error("Missing required argument.");
            }
            return result;
        }
    }
}

export const query = (): MethodDecorator => {
    return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        if (!Reflect.hasMetadata('entity_query', target.constructor)) {
            const data:queryDefination[]=[]
            Reflect.defineMetadata('entity_query', data, target.constructor);
        }
        const query = Reflect.getMetadata('entity_query', target.constructor) as Array<queryDefination>;
        // logger.error("🚀 ~ file: mysq_query.ts ~ line 58 ~ return ~ query", query)
        query.push({
            query_method_name: propertyKey
        });

        Reflect.defineMetadata('entity_query', query, target.constructor);

        const originalMethod = descriptor.value;

        descriptor.value = (...args: any[]) => {
            const result: queryResponse = originalMethod.apply(this, args);
            if (!result.query){ //!
                logger.error(`Expected query arguments of type queryResponse`);
                throw new Error(`Expected query arguments of type queryResponse`);
            }
            // changing the return dynamically 
            const run=(args:string[])=>{
                //["select * from user where id=?",['1']]
                const count= result.query.split("?").length - 1;
                if(count>0 && !args){
                    logger.error(`${propertyKey}():Expected ${count} arguments, but got 0.`);
                    throw new Error(`${propertyKey}():Expected ${count} arguments, but got 0.`);
                }
                if(count!=args.length){
                    logger.error(`${propertyKey}():Expected ${count} arguments, but got ${args.length}.`);
                    throw new Error(`${propertyKey}():Expected ${count} arguments, but got ${args.length}.`);
                }
                return new MysqlSP().doQuery(result.query,args);
            }
            result.run=run;
            return result;
        }
    }
}

