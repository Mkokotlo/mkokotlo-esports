import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlayerSchema, 
  insertFixtureSchema, 
  insertResultSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Player routes
  router.get("/players", async (_req: Request, res: Response) => {
    try {
      const players = await storage.getPlayers();
      return res.json(players);
    } catch (error) {
      console.error("Error getting players:", error);
      return res.status(500).json({ message: "Failed to retrieve players" });
    }
  });
  
  router.post("/players", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      return res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      console.error("Error creating player:", error);
      return res.status(500).json({ message: "Failed to create player" });
    }
  });
  
  router.get("/players/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }
      
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      return res.json(player);
    } catch (error) {
      console.error("Error getting player:", error);
      return res.status(500).json({ message: "Failed to retrieve player" });
    }
  });
  
  // Fixture routes
  router.get("/fixtures", async (_req: Request, res: Response) => {
    try {
      const fixtures = await storage.getFixtures();
      return res.json(fixtures);
    } catch (error) {
      console.error("Error getting fixtures:", error);
      return res.status(500).json({ message: "Failed to retrieve fixtures" });
    }
  });
  
  router.post("/fixtures", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFixtureSchema.parse(req.body);
      const fixture = await storage.createFixture(validatedData);
      return res.status(201).json(fixture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fixture data", errors: error.errors });
      }
      console.error("Error creating fixture:", error);
      return res.status(500).json({ message: "Failed to create fixture" });
    }
  });
  
  router.post("/fixtures/generate", async (req: Request, res: Response) => {
    try {
      const schema = z.object({ playerIds: z.array(z.number()) });
      const { playerIds } = schema.parse(req.body);
      
      if (playerIds.length < 2) {
        return res.status(400).json({ message: "At least 2 players are required to generate fixtures" });
      }
      
      const fixtures = await storage.generateFixtures(playerIds);
      return res.status(201).json(fixtures);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error generating fixtures:", error);
      return res.status(500).json({ message: "Failed to generate fixtures" });
    }
  });
  
  router.get("/fixtures/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fixture ID" });
      }
      
      const fixture = await storage.getFixture(id);
      if (!fixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      return res.json(fixture);
    } catch (error) {
      console.error("Error getting fixture:", error);
      return res.status(500).json({ message: "Failed to retrieve fixture" });
    }
  });
  
  // Result routes
  router.get("/results", async (_req: Request, res: Response) => {
    try {
      const results = await storage.getResults();
      return res.json(results);
    } catch (error) {
      console.error("Error getting results:", error);
      return res.status(500).json({ message: "Failed to retrieve results" });
    }
  });
  
  router.post("/results", async (req: Request, res: Response) => {
    try {
      const validatedData = insertResultSchema.parse(req.body);
      
      // Check if the fixture exists
      const fixture = await storage.getFixture(validatedData.fixtureId);
      if (!fixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      // Check if result already exists for this fixture
      const existingResult = await storage.getResultByFixtureId(validatedData.fixtureId);
      if (existingResult) {
        return res.status(409).json({ message: "Result already exists for this fixture" });
      }
      
      // Validate that the winner is one of the players in the fixture
      if (validatedData.winnerId !== fixture.player1Id && validatedData.winnerId !== fixture.player2Id) {
        return res.status(400).json({ message: "Winner must be one of the players in the fixture" });
      }
      
      const result = await storage.createResult(validatedData);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid result data", errors: error.errors });
      }
      console.error("Error creating result:", error);
      return res.status(500).json({ message: "Failed to create result" });
    }
  });
  
  router.get("/results/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      const result = await storage.getResult(id);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Error getting result:", error);
      return res.status(500).json({ message: "Failed to retrieve result" });
    }
  });
  
  // Register all routes with /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  
  return httpServer;
}
