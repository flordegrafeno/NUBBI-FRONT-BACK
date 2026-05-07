import { Router } from "express";
import {authMiddleware} from "../../middlewares/authMiddleware"
import { roleMiddleware } from "../../middlewares/roleMiddleware";
import { InteraccionesController } from "./interacciones.controller";

export const router = Router();

router.post("/", authMiddleware, roleMiddleware(["familia"]), InteraccionesController.create);
router.patch("/:id", authMiddleware, roleMiddleware(["familia"]), InteraccionesController.update);

router.get("/mi-historial", authMiddleware, InteraccionesController.miHistorial);
router.get("/actividad/:actividadId", authMiddleware, roleMiddleware(["gestor"]), InteraccionesController.listByActividad);
router.get("/:id", authMiddleware, InteraccionesController.getById);

export default router;
