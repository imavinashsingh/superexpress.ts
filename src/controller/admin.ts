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