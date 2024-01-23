import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const badges = await prisma.badge.findMany();
        return NextResponse.json({ badges }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
