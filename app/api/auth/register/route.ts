import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Registro - Dados recebidos:", body);

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se usuário já existe
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 },
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Senha hasheada com sucesso");

    // Inserir usuário
    const result = db
      .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name, email, hashedPassword);

    console.log("Usuário inserido, ID:", result.lastInsertRowid);

    // Inicializar ranking
    db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (?, 0)").run(
      result.lastInsertRowid,
    );

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro detalhado no registro:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar usuário" },
      { status: 500 },
    );
  }
}
