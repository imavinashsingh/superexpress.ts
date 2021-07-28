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