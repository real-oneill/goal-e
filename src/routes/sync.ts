import { Router } from "express";
import { db, sessionsTable, goalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/sync/pull", async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }
  try {
    const [sessions, goals] = await Promise.all([
      db.select().from(sessionsTable).where(eq(sessionsTable.deviceToken, token)),
      db.select().from(goalsTable).where(eq(goalsTable.deviceToken, token)),
    ]);
    res.json({
      sessions: sessions.map((r) => r.data),
      goals: goals.map((r) => r.data),
    });
  } catch (err) {
    req.log.error(err, "sync pull error");
    res.status(500).json({ error: "sync failed" });
  }
});

router.post("/sync/push", async (req, res) => {
  const { token, sessions, goals } = req.body as {
    token: string;
    sessions: Array<{ id: string; [key: string]: unknown }>;
    goals: Array<{ id: string; [key: string]: unknown }>;
  };

  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(sessionsTable).where(eq(sessionsTable.deviceToken, token));
      if (Array.isArray(sessions) && sessions.length > 0) {
        await tx.insert(sessionsTable).values(
          sessions.map((s) => ({ id: s.id, deviceToken: token, data: s })),
        );
      }

      await tx.delete(goalsTable).where(eq(goalsTable.deviceToken, token));
      if (Array.isArray(goals) && goals.length > 0) {
        await tx.insert(goalsTable).values(
          goals.map((g) => ({ id: g.id, deviceToken: token, data: g })),
        );
      }
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "sync push error");
    res.status(500).json({ error: "sync failed" });
  }
});

export default router;
