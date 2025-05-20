import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for getting trial data (if needed)
  app.get('/api/trial-data', (req, res) => {
    res.json({
      standardOfCare: {
        diseaseBurdenScore: 4.81
      },
      trialComplexity: {
        inclusionCriteria: true,
        sequence: {
          min: 5,
          max: 15,
          default: 10
        },
        lifestyleAdjustments: {
          min: 3,
          max: 7,
          default: 5
        },
        otherParameter: {
          min: 0,
          max: 100,
          default: 50
        }
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
