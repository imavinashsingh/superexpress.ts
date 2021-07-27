import mysql from 'mysql2';
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

    connection_query(query, res = null) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                try {
                    if (err) {
                        console.log(`[sprocs][base][getConnection] err:${err.message}`);
                        return reject(err);

                    } else {
                        conn.query(query, (err, result, fields) => {
                            //this.pool.releaseConnection(conn);
                            if (err) {
                                console.log(`[sprocs][base][getConnection][conn.query] err: ${err.message}`);
                                return reject(err);
                            }
                            resolve(result);
                            
                        });
                    }
                } catch (err) {
                    console.log(`[sprocs][base][getConnection][conn.query] catch err:${err.message}`);
                    //  this.pool.releaseConnection(conn);
                    return reject(err);
                } finally {
                    // this.pool.releaseConnection(conn);
                }
            })
        })
    }
    pool_query(sproc_name, args, res = null) {
        return new Promise((resolve, reject) => {
            const query = `CALL ${sproc_name}(${args})`
            console.log(`[sprocs][base][pool_query] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    console.log(`[sprocs][base][pool_query] err:${err.message}`);
                    return reject(err);
                }

                console.log(`[sprocs][base][pool_query] query:${query} success`);
                resolve(result);
            });
        });
    }
    drop_query(sproc_name, res = null) {
        return new Promise((resolve, reject) => {

            const query = `DROP PROCEDURE IF EXISTS ${sproc_name};`
            console.log(`[sprocs][base][drop_query] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    console.log(`[sprocs][base][drop_query] err:${err.message}`);
                    return reject(err);
                }

                console.log(`[sprocs][base][drop_query] query:${query} success`);
                resolve(result);
            });
        });
    }

    get_sp_details(routine_schema, sproc_name, res = null) {
        return new Promise((resolve, reject) => {

            const query = `SELECT SPECIFIC_NAME,ROUTINE_DEFINITION  from information_schema.routines where routine_type = 'PROCEDURE' and ROUTINE_SCHEMA='${routine_schema}' and SPECIFIC_NAME = '${sproc_name}';
            `
            console.log(`[sprocs][base][get_sp_details] query:` + JSON.stringify(query));

            this.pool.query(query, (err, result, fields) => {
                if (err) {
                    console.log(`[sprocs][base][get_sp_details] err:${err.message}`);
                    return reject(err);
                }

                console.log(`[sprocs][base][get_sp_details] query:${query} success`);
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
    /**
     * to call stored procedure
     */
    run_sp() {

    }
    /**
     * to get defination of stored procedure
     */
    get_sp_def() {

    }

    /** 
     * to drop stored procedure
     */
    drop_sp() {

    }


}

export interface spDefination {
    sp_method_name: string,
    params?: any[]
}

export interface spResponse { createProcedure: string, query: string, method_name?:string }

export const entity = (): ClassDecorator => {
    return (target: any) => {
        //Reflect.defineMetadata('prefix', '', target);
        // Since routes are set by our methods this should almost never be true (except the controller has no methods)
        if (!Reflect.hasMetadata('entity', target)) {
            Reflect.defineMetadata('entity', [], target);
        }
    };
};

export const sp = (params?: any[]): MethodDecorator => {
    return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        if (!Reflect.hasMetadata('entity', target.constructor)) {
            Reflect.defineMetadata('entity', [], target.constructor);
        }
        const sp = Reflect.getMetadata('entity', target.constructor) as Array<spDefination>;
        // console.log("🚀 ~ file: mysq_sp.ts ~ line 58 ~ return ~ sp", sp)
        sp.push({
            sp_method_name: propertyKey,
            params: params
        })
        Reflect.defineMetadata('routes', entity, target.constructor);
        const originalMethod = descriptor.value;
        descriptor.value = (...args: any[]) => {
            console.log("🚀 ~ file: mysq_sp.ts ~ line 57 ~ return ~ args", args)
            const result: spResponse = <spResponse>originalMethod.apply(this, args);
            // changing the return dynamically 
            result.method_name=propertyKey
            if (!result.createProcedure && !result.query){
                throw new Error("Missing required argument.");
            }
            return result;
        }
    }
}

