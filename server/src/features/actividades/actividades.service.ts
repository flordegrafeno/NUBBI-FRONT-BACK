import { randomUUID } from "crypto";
import { pool } from "../../config/database";
import Boom from "@hapi/boom";
import { Actividad, CreateActividadDTO, UpdateActividadDTO } from "./actividades.types";
// Importar la función de emisión del gateway
import { emitNuevaActividad } from "../chat/chat.gateway";

console.log("CREATE SERVICE HIT");

export const createActividadService = async (
  data: CreateActividadDTO,
  gestorId: string
): Promise<Actividad> => {
  const { titulo, descripcion, fecha_inicio, ubicacion, imagen_url } = data;

  try {
    const result = await pool.query<Actividad>(
      `INSERT INTO actividades (
        titulo, descripcion, fecha_inicio,
        ubicacion, imagen_url, qr_payload, creada_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        titulo,
        descripcion ?? null,
        fecha_inicio,
        ubicacion ?? null,
        imagen_url ?? null,
        randomUUID(),
        gestorId,
      ]
    );

    const actividad = result.rows[0];

    // Emitir la nueva actividad a todos los clientes conectados via WebSocket
    // Esto hace que aparezca en tiempo real en la pantalla de Actividades
    // de las familias sin que tengan que recargar la página
    emitNuevaActividad(actividad);

    return actividad;
  } catch (err) {
    console.error("CREATE ACTIVIDAD ERROR:", err);
    throw err;
  }
};

// ... resto de funciones sin cambios ...
export const listActividadesService = async (
  soloActivas = false
): Promise<Actividad[]> => {
  const query = soloActivas
    ? `SELECT * FROM actividades WHERE fecha_inicio <= NOW() ORDER BY created_at DESC`
    : `SELECT * FROM actividades ORDER BY created_at DESC`;

  const result = await pool.query<Actividad>(query);
  return result.rows;
};

export const getActividadByIdService = async (
  id: string
): Promise<Actividad> => {
  const result = await pool.query<Actividad>(
    `SELECT * FROM actividades WHERE id = $1 LIMIT 1`,
    [id]
  );
  if (result.rowCount === 0) throw Boom.notFound("Actividad no encontrada");
  return result.rows[0];
};

export const updateActividadService = async (
  id: string,
  data: UpdateActividadDTO,
  gestorId: string
): Promise<Actividad> => {
  const existing = await getActividadByIdService(id);
  if (existing.creada_por !== gestorId) throw Boom.forbidden("No autorizado");

  const fields = Object.entries(data).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return existing;

  const setClauses = fields.map(([k], i) => `${k} = $${i + 1}`).join(", ");
  const values = fields.map(([, v]) => v);

  const result = await pool.query<Actividad>(
    `UPDATE actividades SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

export const deleteActividadService = async (
  id: string,
  gestorId: string
): Promise<void> => {
  const existing = await getActividadByIdService(id);
  if (existing.creada_por !== gestorId) throw Boom.forbidden("No autorizado");
  await pool.query(`DELETE FROM actividades WHERE id = $1`, [id]);
};

export const getActividadByQrPayloadService = async (
  qr_payload: string
): Promise<Actividad | null> => {
  const result = await pool.query<Actividad>(
    `SELECT * FROM actividades WHERE qr_payload = $1 LIMIT 1`,
    [qr_payload]
  );
  return result.rows[0] ?? null;
};