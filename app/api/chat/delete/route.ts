import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({code:-1})
  }

  // 删除message
  const deleteMessage = prisma.message.deleteMany({
    where:{
      chatId:id
    }
  })

  // 删除 chat
  const deleteChat =  prisma.chat.delete({
    where:{id}
  })

  await prisma.$transaction([deleteMessage,deleteChat])
  
  return NextResponse.json({code:0})
}