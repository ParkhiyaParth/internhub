import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

//Define schema for validation 
const userSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export async function GET(req: Request) {
    
    return NextResponse.json({message: "User fetched successfully"}, { status: 200 });
}

export async function POST(req: Request) {
    const { email, password } = await req.json();
    if(!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    if(!password) {
        return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if(existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }
    
     const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });
    return NextResponse.json({message: "User created successfully", data:user}, { status: 201 });
}