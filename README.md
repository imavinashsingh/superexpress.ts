# superexpress
Project implements decorators for controller and mysql 

## Installation
Use the [git cli](https://git-scm.com/downloads) to clone repo and explore.
## Usage
#### Controler/admin.ts
```
import { API, Get, Post } from "../core/controller";
import { Request,Response } from "express";
import { sendError, sendSuccess } from "../core/helperFunction";
import AdminModel from "../model/admin";

@API('/admin')
export default class Admin {
    adminModal: AdminModel;
    constructor(){
        this.adminModal=new AdminModel();
    }
    
    @Post('/login')
    async login(req:Request,res:Response){
        const d= await this.adminModal.getUser().run([])
        sendSuccess(res,{'a':d})
    }

    @Post('/getUserDetails')
    async getUserDetails(req:Request,res:Response){
        try {
            const d =await this.adminModal.testQuery().run(['1']);
            const data:any[][]=await this.adminModal.getUserDetails().run([req.body.email,req.body.id]);
            sendSuccess(res,{d,data})
        } catch (error) {
            sendError(res,error.message)
        }
    }
}
```

#### Modal/admin.ts
```
import { entity, query, queryResponse, sp, spResponse } from "../core/mysq_sp";

@entity()
export default class AdminModel {
    @sp()
    getUser(): spResponse {
        return {
            createProcedure: ``,
            query: `
      SELECT * FROM taptwointeract.user;
      `
        }
    }
    @sp()
    getUserDetails():spResponse{
        const data:spResponse={
            createProcedure:`
            IN f_email text,
            IN f_user_id int(11)`,
            query:`select *
            from user u
            where 
            (case 
                when f_user_id is not null then u.id = f_user_id
                else u.email = f_email
            end);`
        };
        return data
    }

    @query()
    testQuery():any{
        return {
            query:"select * from user where id=?"
        }
    }
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)

