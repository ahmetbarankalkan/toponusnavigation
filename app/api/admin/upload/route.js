import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    try {
      verifyJWTToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const { type, imageData, roomId } = await request.json();
    if (!type || !imageData) {
      return NextResponse.json({ error: "type ve imageData gerekli" }, { status: 400 });
    }

    if (!["products", "campaigns"].includes(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    // Base64 parse
    const match = imageData.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Geçersiz imageData" }, { status: 400 });
    }
    const mimeType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");
    const ext = mimeType.split("/")[1].replace("jpeg", "jpg").replace("svg+xml", "svg");

    const uploadDir = path.join(process.cwd(), "public", "images", type);
    if (roomId) {
      // If roomId is provided, organize by room
      const roomUploadDir = path.join(uploadDir, `room-${roomId}`);
      fs.mkdirSync(roomUploadDir, { recursive: true });
      
      const fileName = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
      const filePath = path.join(roomUploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      const publicPath = `/images/${type}/room-${roomId}/${fileName}`;
      return NextResponse.json({ success: true, path: publicPath });
    } else {
      fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      const publicPath = `/images/${type}/${fileName}`;
      return NextResponse.json({ success: true, path: publicPath });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
