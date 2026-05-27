import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { pool } from "../../config/database";

export const router = Router();

// ── GET /api/chat/rooms ───────────────────────────────────────────────────────
// Devuelve todas las salas, ordenadas por fecha de creación descendente.
router.get("/rooms", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.full_name AS creator_name
       FROM rooms r
       LEFT JOIN profiles p ON p.id = r.created_by
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo salas" });
  }
});

// ── POST /api/chat/rooms ──────────────────────────────────────────────────────
// Crea una nueva sala. El profileId del creador viene del token JWT.
router.post("/rooms", authMiddleware, async (req: any, res: Response) => {
  const { name, description } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rooms (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), description?.trim() ?? null, req.user!.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error creando sala" });
  }
});

// ── GET /api/chat/rooms/:roomId/messages ──────────────────────────────────────
// Historial de mensajes de una sala (carga inicial antes de conectar el WebSocket).
// Se incluye el perfil del remitente via JOIN para mostrar nombre y avatar.
router.get(
  "/rooms/:roomId/messages",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100); // máximo 100

    try {
      const result = await pool.query(
        `SELECT m.*, 
                json_build_object('full_name', p.full_name, 'email', p.email) AS profiles
         FROM messages m
         LEFT JOIN profiles p ON p.id = m.profile_id
         WHERE m.room_id = $1
         ORDER BY m.created_at ASC
         LIMIT $2`,
        [roomId, limit]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Error obteniendo mensajes" });
    }
  }
);

// ── DELETE /api/chat/rooms/:roomId ────────────────────────────────────────────
// Solo el creador puede eliminar la sala.
router.delete(
  "/rooms/:roomId",
  authMiddleware,
  async (req: any, res: Response) => {
    const { roomId } = req.params;

    try {
      // Verificar que quien borra es el creador
      const check = await pool.query(
        "SELECT created_by FROM rooms WHERE id = $1",
        [roomId]
      );

      if (check.rowCount === 0) {
        return res.status(404).json({ error: "Sala no encontrada" });
      }

      if (check.rows[0].created_by !== req.user!.id) {
        return res.status(403).json({ error: "Solo el creador puede eliminar la sala" });
      }

      // ON DELETE CASCADE en messages se encarga de borrar los mensajes
      await pool.query("DELETE FROM rooms WHERE id = $1", [roomId]);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Error eliminando sala" });
    }
  }
);

export default router;