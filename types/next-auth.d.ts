import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id:string;
        email:string;
        role:string;
    }
    interface Session {
        user: User & {
            id:string;
            email:string;
            role:string;
        }
        token:{
            id:string;
            email:string;
            role:string;
        };
    }
}