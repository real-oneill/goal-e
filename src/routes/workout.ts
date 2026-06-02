import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/api/workout/parse-images", async (req, res) => {
  try {
    const { images } = req.body as { images: string[] };

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: "images array required" });
      return;
    }

    if (images.length > 10) {
      res.status(400).json({ error: "Maximum 10 images per request" });
      return;
    }

    const imageContent = images.map((b64: string) => ({
      type: "image_url" as const,
      image_url: {
        url: b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`,
        detail: "high" as const,
      },
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a workout logging assistant. Analyze these workout screenshots and extract all exercises with their sets, reps, and weights.

Return a JSON object with this exact shape:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": [
        { "reps": 10, "weight": 95, "unit": "lbs" }
      ]
    }
  ]
}

Rules:
- Extract every exercise visible across all images
- For each set, extract reps and weight. If weight is in kg, keep it as kg.
- If reps shows something like "10/ 8+" treat it as 10 reps
- If no weight shown (bodyweight), use weight: 0
- Deduplicate: if the same exercise appears in multiple images with the same sets, only include it once
- Return ONLY valid JSON, no markdown, no explanation`,
            },
            ...imageContent,
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";

    let parsed: { exercises: { name: string; sets: { reps: number; weight: number; unit: string }[] }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        req.log.error({ raw }, "Failed to parse OpenAI response as JSON");
        res.status(500).json({ error: "Failed to parse workout data from images" });
        return;
      }
    }

    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      res.status(500).json({ error: "Unexpected response shape from AI" });
      return;
    }

    const exercises = parsed.exercises.map((ex, i: number) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      name: ex.name ?? "",
      sets: (ex.sets ?? []).map((s) => ({
        reps: Number(s.reps) || 0,
        weight: Number(s.weight) || 0,
        unit: s.unit === "kg" ? "kg" : "lbs",
      })),
    }));

    res.json({ exercises });
  } catch (err) {
    req.log.error(err, "parse-images error");
    res.status(500).json({ error: "Failed to process images" });
  }
});

export default router;
