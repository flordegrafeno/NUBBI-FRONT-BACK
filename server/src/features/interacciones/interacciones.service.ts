import { supabase } from "../../config/supabase";
import { pool } from "../../config/database";
import { getActividadByIdService } from "../actividades/actividades.service";
import Boom from "@hapi/boom";
import {
  CreateInteraccionDTO,
  Interaccion,
  UpdateInteraccionDTO,
} from "./interacciones.types";

const calcularPuntos = (
  flags: { atencion: boolean; interes: boolean; deseo: boolean; accion: boolean },
  puntosActividad: number
): number => {
  const etapas = [flags.atencion, flags.interes, flags.deseo, flags.accion].filter(
    Boolean
  ).length;
  return Math.floor((etapas / 4) * puntosActividad);
};

export const createInteraccionService = async (
  data: CreateInteraccionDTO,
  profileId: string
): Promise<Interaccion> => {
  const { actividad_id, atencion = false, interes = false, deseo = false, accion = false } = data;

  const actividad = await getActividadByIdService(actividad_id);

  const { data: existing } = await supabase
    .from("interacciones")
    .select("id")
    .eq("actividad_id", actividad_id)
    .eq("profile_id", profileId)
    .single();

  if (existing) {
    throw Boom.conflict("Ya existe una interacción para esta actividad");
  }

  const puntos_ganados = calcularPuntos({ atencion, interes, deseo, accion }, actividad.puntos);

  const { data: interaccion, error } = await supabase
    .from("interacciones")
    .insert({ actividad_id, profile_id: profileId, atencion, interes, deseo, accion, puntos_ganados })
    .select()
    .single();

  if (error) {
    throw Boom.internal(error.message);
  }

  if (puntos_ganados > 0) {
    await pool.query(
      `INSERT INTO public.puntos_balance (user_id, total)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET total = puntos_balance.total + $2`,
      [profileId, puntos_ganados]
    );
  }

  return interaccion;
};

export const updateInteraccionService = async (
  id: string,
  data: UpdateInteraccionDTO,
  profileId: string
): Promise<Interaccion> => {
  const existing = await getInteraccionByIdService(id);

  if (existing.profile_id !== profileId) {
    throw Boom.forbidden("No autorizado");
  }

  const actividad = await getActividadByIdService(existing.actividad_id);

  const updatedFlags = {
    atencion: data.atencion ?? existing.atencion,
    interes: data.interes ?? existing.interes,
    deseo: data.deseo ?? existing.deseo,
    accion: data.accion ?? existing.accion,
  };

  const nuevos_puntos = calcularPuntos(updatedFlags, actividad.puntos);
  const delta = nuevos_puntos - existing.puntos_ganados;

  const { data: updated, error } = await supabase
    .from("interacciones")
    .update({ ...updatedFlags, puntos_ganados: nuevos_puntos })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw Boom.internal(error.message);
  }

  if (delta !== 0) {
    await pool.query(
      `INSERT INTO public.puntos_balance (user_id, total)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET total = GREATEST(0, puntos_balance.total + $2)`,
      [profileId, delta]
    );
  }

  return updated;
};

export const getInteraccionByIdService = async (id: string): Promise<Interaccion> => {
  const { data, error } = await supabase
    .from("interacciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw Boom.notFound("Interacción no encontrada");
  }
  return data;
};

export const getInteraccionesByActividadService = async (
  actividadId: string
): Promise<Interaccion[]> => {
  const { data, error } = await supabase
    .from("interacciones")
    .select("*")
    .eq("actividad_id", actividadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw Boom.internal(error.message);
  }
  return data || [];
};

export const getInteraccionesByProfileService = async (
  profileId: string
): Promise<Interaccion[]> => {
  const { data, error } = await supabase
    .from("interacciones")
    .select("*, actividades(titulo, fecha, puntos)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw Boom.internal(error.message);
  }
  return data || [];
};
