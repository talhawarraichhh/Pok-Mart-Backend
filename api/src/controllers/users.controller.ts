import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        client: {
          include: { seller: true, customer: true },
        },
        admin: true,
      },
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
      include: {
        client: {
          include: { seller: true, customer: true },
        },
        admin: true,
      },
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
    const { username, email, password, role } = req.body;
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        client: role === "client" ? { create: {} } : undefined,
        admin: role === "admin" ? { create: {} } : undefined,
      },
      include: { client: true, admin: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, email, password } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { username, email, password },
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: "User not found" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "User not found" });
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
