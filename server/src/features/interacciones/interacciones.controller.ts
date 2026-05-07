import { Response } from "express";
import Boom from "@hapi/boom";
import { AuthRequest } from "../../middlewares/authMiddleware";
import {
  createInteraccionService,
  getInteraccionByIdService,
  getInteraccionesByActividadService,
  getInteraccionesByProfileService,
  updateInteraccionService,
} from "./interacciones.service";

const getErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) return error.message;
  return defaultMessage;
};

const getStatusCode = (error: unknown, defaultStatus: number) => {
  if (Boom.isBoom(error)) return error.output.statusCode;
  return defaultStatus;
};

export class InteraccionesController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const interaccion = await createInteraccionService(req.body, req.user!.id);
      res.status(201).json(interaccion);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al crear interacción") });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const interaccion = await updateInteraccionService(
        req.params["id"] as string,
        req.body,
        req.user!.id
      );
      res.status(200).json(interaccion);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al actualizar interacción") });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const interaccion = await getInteraccionByIdService(req.params["id"] as string);
      res.status(200).json(interaccion);
    } catch (error) {
      res
        .status(getStatusCode(error, 404))
        .json({ error: getErrorMessage(error, "Interacción no encontrada") });
    }
  }

  static async listByActividad(req: AuthRequest, res: Response) {
    try {
      const interacciones = await getInteraccionesByActividadService(
        req.params["actividadId"] as string
      );
      res.status(200).json(interacciones);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al listar interacciones") });
    }
  }

  static async miHistorial(req: AuthRequest, res: Response) {
    try {
      const interacciones = await getInteraccionesByProfileService(req.user!.id);
      res.status(200).json(interacciones);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al obtener historial") });
    }
  }
}
