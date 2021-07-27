import mysql from 'mysql';
export default abstract class MYSQLDB {
    private host:string="root";
    private password:string="";
    private database:string="users";
    protected con: mysql.Connection;
    port: number=3306;
    constructor(){
        if(process.env.MYSQL_Port){
            this.port=parseInt((process.env.MYSQL_Port)
        }
        
         this.con = mysql.createConnection({
            host: process.env.MYSQL_Host??this.host,
            user: process.env.MYSQL_Password??this.password,
            password: process.env.MYSQL_Database_name??this.database,
            port:this.port
          });
          this.con.connect(function(err) {
            if (err) {
                throw err;
            }
            console.log("Connected!");
          });
    }
    
}