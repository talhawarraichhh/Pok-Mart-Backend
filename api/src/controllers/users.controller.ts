import { RequestHandler } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { seller: true, customer: true, admin: true },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { seller: true, customer: true, admin: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, role } = req.body as {
      username: string;
      email: string;
      password: string;
      role?: "seller" | "customer" | "admin";
    };
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        seller: role === "seller" ? { create: {} } : undefined,
        customer: role === "customer" ? { create: {} } : undefined,
        admin: role === "admin" ? { create: {} } : undefined,
      },
      include: { seller: true, customer: true, admin: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  const { username, email, password, role } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    role?: "seller" | "customer" | "admin" | null;
  };

  try {
    await prisma.$transaction(async (tx) => {
      const userData: Prisma.UserUpdateInput = {};
      if (username !== undefined) userData.username = username;
      if (email !== undefined) userData.email = email;
      if (password !== undefined) userData.password = password;
      await tx.user.update({ where: { id }, data: userData });

      if (role !== undefined) {
        await Promise.all([
          tx.seller.deleteMany({ where: { userId: id } }),
          tx.customer.deleteMany({ where: { userId: id } }),
          tx.admin.deleteMany({ where: { userId: id } }),
        ]);

        if (role === "seller")
          await tx.seller.upsert({
            where: { userId: id },
            update: {},
            create: { userId: id },
          });
        if (role === "customer")
          await tx.customer.upsert({
            where: { userId: id },
            update: {},
            create: { userId: id },
          });
        if (role === "admin")
          await tx.admin.upsert({
            where: { userId: id },
            update: {},
            create: { userId: id },
          });
      }
    });

    const user = await prisma.user.findUnique({
      where: { id },
      include: { seller: true, customer: true, admin: true },
    });
    res.json(user);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email, password } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.json({ message: "Signed in", userId: user.id });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
