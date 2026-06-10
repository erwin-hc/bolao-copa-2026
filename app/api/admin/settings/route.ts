import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

async function verifyAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db
      .prepare("SELECT is_admin FROM users WHERE id = ?")
      .get(decoded.userId) as any;
    return user && user.is_admin === 1;
  } catch {
    return false;
  }
}

// GET - Buscar configurações
export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar ou criar configurações padrão
    let settings = db
      .prepare("SELECT * FROM settings WHERE key = ?")
      .get("participation_fee");

    if (!settings) {
      // Criar configuração padrão
      db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
        "participation_fee",
        "50",
      );
      settings = { key: "participation_fee", value: "50" };
    }

    return NextResponse.json({
      participationFee: parseInt(settings.value),
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Atualizar configurações
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { participationFee } = await request.json();

    if (!participationFee || participationFee < 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Atualizar ou inserir configuração
    db.prepare(
      `
      INSERT INTO settings (key, value) VALUES ('participation_fee', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    ).run(String(participationFee));

    return NextResponse.json({
      success: true,
      message: "Taxa atualizada com sucesso",
      participationFee,
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
