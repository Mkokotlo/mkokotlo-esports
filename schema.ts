import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Player schema
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gamertag: text("gamertag").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  email: true,
  phone: true,
  gamertag: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Fixture schema
export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull().references(() => players.id),
  player2Id: integer("player2_id").notNull().references(() => players.id),
  round: text("round").notNull(), // e.g. "Quarter Final", "Semi Final", "Final"
  matchId: text("match_id").notNull(), // e.g. "QF-001", "SF-001", "F-001"
  status: text("status").notNull().default("pending"), // "pending", "completed"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFixtureSchema = createInsertSchema(fixtures).pick({
  player1Id: true,
  player2Id: true,
  round: true,
  matchId: true,
  status: true,
});

export type InsertFixture = z.infer<typeof insertFixtureSchema>;
export type Fixture = typeof fixtures.$inferSelect;

// Result schema
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  winnerId: integer("winner_id").notNull().references(() => players.id),
  winnerScore: integer("winner_score"),
  loserScore: integer("loser_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResultSchema = createInsertSchema(results).pick({
  fixtureId: true,
  winnerId: true,
  winnerScore: true,
  loserScore: true,
  notes: true,
});

export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;
