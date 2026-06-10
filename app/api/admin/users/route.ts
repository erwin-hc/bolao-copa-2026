import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

// Função melhorada para verificar admin
async function verifyAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Token não fornecido");
    return false;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token decodificado:", {
      userId: decoded.userId,
      is_admin: decoded.is_admin,
    });

    // Verificar no banco também para garantir
    const user = db
      .prepare("SELECT is_admin FROM users WHERE id = ?")
      .get(decoded.userId) as any;
    if (user && user.is_admin === 1) {
      console.log("Usuário é admin confirmado");
      return true;
    }
    console.log("Usuário NÃO é admin");
    return false;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return false;
  }
}

// GET - Listar todos os usuários
export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 },
      );
    }

    const users = db
      .prepare(
        `
      SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
             COALESCE(r.total_points, 0) as total_points
      FROM users u
      LEFT JOIN ranking r ON u.id = r.user_id
      ORDER BY u.id ASC
    `,
      )
      .all();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 },
      );
    }

    const { name, email, password, is_admin } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 },
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const result = db
      .prepare(
        `
      INSERT INTO users (name, email, password, is_admin)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(name, email, hashedPassword, is_admin ? 1 : 0);

    db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (?, 0)").run(
      result.lastInsertRowid,
    );

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      user: { id: result.lastInsertRowid, name, email, is_admin },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Atualizar usuário
export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 },
      );
    }

    const { id, name, email, password, is_admin } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "ID, nome e email são obrigatórios" },
        { status: 400 },
      );
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const emailExists = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, id);
    if (emailExists) {
      return NextResponse.json(
        { error: "Email já está em uso por outro usuário" },
        { status: 400 },
      );
    }

    let query = "UPDATE users SET name = ?, email = ?, is_admin = ?";
    let params: any[] = [name, email, is_admin ? 1 : 0];

    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      query += ", password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(id);

    db.prepare(query).run(...params);

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Remover usuário
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const user = db
      .prepare("SELECT id, is_admin FROM users WHERE id = ?")
      .get(id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o admin está tentando se remover
    const authHeader = request.headers.get("authorization");
    const token = authHeader!.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.userId === parseInt(id)) {
      return NextResponse.json(
        { error: "Você não pode remover seu próprio usuário" },
        { status: 403 },
      );
    }

    db.prepare("DELETE FROM bets WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM ranking WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      message: "Usuário removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
