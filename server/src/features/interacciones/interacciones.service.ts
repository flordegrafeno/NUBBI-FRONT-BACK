import { pool } from "../../config/database";
import Boom from "@hapi/boom";
import { CreateInteraccionDTO, Interaccion, UpdateInteraccionDTO } from "./interacciones.types";
import { supabase } from "../../config/supabase";

const broadcastInteraccion = async (interaccion: Interaccion) => {
  const channel = supabase.channel('interacciones');
  await channel.httpSend('interaccion-updated', interaccion);
  supabase.removeChannel(channel);
};

export const createInteraccionService = async (
  data: CreateInteraccionDTO,
  profileId: string
): Promise<Interaccion> => {
  const { actividad_id, atencion = false, interes = false, deseo = false, accion = false } = data;

  const existing = await pool.query<Interaccion>(
    `SELECT * FROM interacciones WHERE actividad_id = $1 AND profile_id = $2 LIMIT 1`,
    [actividad_id, profileId]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    const row = existing.rows[0];
    const result = await pool.query<Interaccion>(
      `UPDATE interacciones
       SET atencion = atencion OR $1,
           interes  = interes  OR $2,
           deseo    = deseo    OR $3,
           accion   = accion   OR $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [atencion, interes, deseo, accion, row.id]
    );
    const interaccion = result.rows[0];
    broadcastInteraccion(interaccion);
    return interaccion;
  }

  const result = await pool.query<Interaccion>(
    `INSERT INTO interacciones (actividad_id, profile_id, atencion, interes, deseo, accion)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [actividad_id, profileId, atencion, interes, deseo, accion]
  );

  const interaccion = result.rows[0];
  broadcastInteraccion(interaccion);
  return interaccion;
};

export const updateInteraccionService = async (
  id: string,
  data: UpdateInteraccionDTO,
  profileId: string
): Promise<Interaccion> => {
  const existing = await getInteraccionByIdService(id);

  if (existing.profile_id !== profileId) throw Boom.forbidden("No autorizado");

  const updatedFlags = {
    atencion: data.atencion ?? existing.atencion,
    interes: data.interes ?? existing.interes,
    deseo: data.deseo ?? existing.deseo,
    accion: data.accion ?? existing.accion,
  };

  const result = await pool.query<Interaccion>(
    `UPDATE interacciones
     SET atencion = $1, interes = $2, deseo = $3, accion = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [updatedFlags.atencion, updatedFlags.interes, updatedFlags.deseo, updatedFlags.accion, id]
  );

  const interaccion = result.rows[0];
  broadcastInteraccion(interaccion);
  return interaccion;
};

export const getInteraccionByIdService = async (id: string): Promise<Interaccion> => {
  const result = await pool.query<Interaccion>(
    `SELECT * FROM interacciones WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (result.rowCount === 0) throw Boom.notFound("Interacción no encontrada");
  return result.rows[0];
};

export const getInteraccionesByActividadService = async (
  actividadId: string
): Promise<Interaccion[]> => {
  const result = await pool.query<Interaccion>(
    `SELECT * FROM interacciones WHERE actividad_id = $1 ORDER BY created_at DESC`,
    [actividadId]
  );

  return result.rows;
};

export const getInteraccionesByProfileService = async (
  profileId: string
): Promise<Interaccion[]> => {
  const result = await pool.query<Interaccion>(
    `SELECT i.*, act.titulo, act.fecha_inicio, act.fecha_fin
     FROM interacciones i
     JOIN actividades act ON act.id = i.actividad_id
     WHERE i.profile_id = $1
     ORDER BY i.created_at DESC`,
    [profileId]
  );

  return result.rows;
};
