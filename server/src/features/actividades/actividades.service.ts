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

export const updateActividadService = async (// Función asíncrona para actualizar una actividad por su ID, lo que permite a esta función realizar operaciones de manera asíncrona (como consultas a la base de datos) sin bloquear el hilo de ejecución principal, mejorando el rendimiento y la capacidad de respuesta de la aplicación al permitir que otras operaciones se ejecuten mientras se espera la finalización de las operaciones relacionadas con la actualización de una actividad específica
  id: string,// Parámetro para recibir el ID de la actividad que se desea actualizar, lo que permite a esta función identificar la actividad específica que se desea actualizar en la aplicación, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores actualizar una actividad específica según su ID
  data: UpdateActividadDTO,// Parámetro para recibir los datos que se desean actualizar en la actividad, lo que permite a esta función recibir la información necesaria para realizar la operación de actualización de una actividad específica en la aplicación, mejorando la organización del código al definir claramente los datos que se pueden actualizar para esta operación y facilitando el desarrollo al proporcionar una estructura clara para los datos relacionados con las actividades
  gestorId: string// Parámetro para recibir el ID del usuario autenticado que está actualizando la actividad, lo que permite a esta función verificar si el usuario tiene autorización para actualizar la actividad (por ejemplo, si es el creador de la actividad) y asociar la actualización con el usuario que la realizó, mejorando la gestión de datos al mantener un registro de quién actualizó cada actividad y facilitando la implementación de funcionalidades relacionadas con la gestión de actividades según el usuario que las actualizó
): Promise<Actividad> => {// Tipo de retorno para indicar que esta función devuelve una promesa que se resuelve con un objeto de tipo Actividad, lo que permite a esta función ser utilizada de manera asíncrona y proporcionar la información de la actividad actualizada una vez que la operación de actualización se ha completado exitosamente, mejorando la gestión de datos al permitir a los desarrolladores trabajar con la información de las actividades actualizadas de manera eficiente y clara
  const existing = await getActividadByIdService(id);// Obtención de la actividad existente utilizando su ID, lo que permite a esta función verificar si la actividad que se desea actualizar existe en la aplicación antes de intentar realizar la actualización, mejorando la gestión de errores al proporcionar información clara sobre la ausencia de la actividad solicitada y permitiendo a los desarrolladores manejar este caso de manera eficiente
  if (existing.creada_por !== gestorId) throw Boom.forbidden("No autorizado");//  

  const fields = Object.entries(data).filter(([, v]) => v !== undefined);// Creación de un array de campos a actualizar a partir de los datos recibidos, filtrando solo aquellos campos que tienen un valor definido (no undefined), lo que permite a esta función construir dinámicamente la consulta SQL para actualizar solo los campos que se desean actualizar en la actividad, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores actualizar solo los campos necesarios para esta operación específica
  if (fields.length === 0) return existing;// Verificación para determinar si hay campos que actualizar, lo que permite a esta función responder de manera adecuada en caso de que no se proporcionen campos para actualizar en la actividad, mejorando la gestión de errores al proporcionar información clara sobre la falta de campos para actualizar y permitiendo a los desarrolladores manejar este caso de manera eficiente

  const setClauses = fields.map(([k], i) => `${k} = $${i + 1}`).join(", ");// Construcción de la parte SET de la consulta SQL para actualizar los campos de la actividad, lo que permite a esta función construir dinámicamente la consulta SQL para actualizar solo los campos que se desean actualizar en la actividad, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores actualizar solo los campos necesarios para esta operación específica
  const values = fields.map(([, v]) => v);// Creación de un array de valores a partir de los campos a actualizar, lo que permite a esta función construir dinámicamente la lista de valores para la consulta SQL de actualización, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores actualizar solo los campos necesarios para esta operación específica

  const result = await pool.query<Actividad>(// Consulta a la base de datos para actualizar una actividad específica utilizando su ID y los campos a actualizar, lo que permite a esta función interactuar con la base de datos PostgreSQL para realizar la operación de actualización de una actividad específica en la aplicación, mejorando la organización del código al centralizar la lógica de acceso a la base de datos en este servicio y facilitando el mantenimiento y la escalabilidad de la aplicación al manejar las operaciones relacionadas con las actividades en servicios específicos  
    `UPDATE actividades SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,// Consulta SQL para actualizar una actividad en la tabla "actividades" de la base de datos utilizando su ID y los campos a actualizar, lo que permite a esta función realizar la operación de actualización de una actividad específica en la aplicación al interactuar con la base de datos PostgreSQL, mejorando la organización del código al centralizar la lógica de acceso a la base de datos en este servicio y facilitando el mantenimiento y la escalabilidad de la aplicación al manejar las operaciones relacionadas con las actividades en servicios específicos

    [...values, id]// Lista de valores para la consulta SQL de actualización, que incluye los valores de los campos a actualizar y el ID de la actividad al final, lo que permite a esta función ejecutar la consulta SQL con los valores específicos para actualizar la actividad deseada, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores actualizar solo los campos necesarios para esta operación específica
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

export const getActividadByQrPayloadService = async (// Función asíncrona para obtener una actividad por su payload de QR, lo que permite a esta función realizar operaciones de manera asíncrona (como consultas a la base de datos) sin bloquear el hilo de ejecución principal, mejorando el rendimiento y la capacidad de respuesta de la aplicación al permitir que otras operaciones se ejecuten mientras se espera la finalización de las operaciones relacionadas con la obtención de una actividad específica utilizando su payload de QR
  qr_payload: string// Parámetro para recibir el payload de QR de la actividad que se desea obtener, lo que permite a esta función identificar la actividad específica que se desea obtener en la aplicación utilizando su payload de QR, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores obtener una actividad específica según su payload de QR
): Promise<Actividad | null> => {// Tipo de retorno para indicar que esta función devuelve una promesa que se resuelve con un objeto de tipo Actividad o null, lo que permite a esta función ser utilizada de manera asíncrona y proporcionar la información de la actividad obtenida una vez que la operación de obtención se ha completado exitosamente, o null en caso de que no se encuentre una actividad con el payload de QR especificado, mejorando la gestión de datos al permitir a los desarrolladores trabajar con la información de las actividades obtenidas de manera eficiente y clara, y manejar el caso en que no se encuentra una actividad con el payload de QR proporcionado
  const result = await pool.query<Actividad>(// Consulta a la base de datos para obtener una actividad específica utilizando su payload de QR, lo que permite a esta función interactuar con la base de datos PostgreSQL para realizar la operación de obtención de una actividad específica en la aplicación utilizando su payload de QR, mejorando la organización del código al centralizar la lógica de acceso a la base de datos en este servicio y facilitando el mantenimiento y la escalabilidad de la aplicación al manejar las operaciones relacionadas con las actividades en servicios específicos
    `SELECT * FROM actividades WHERE qr_payload = $1 LIMIT 1`,// Consulta SQL para seleccionar una actividad de la tabla "actividades" de la base de datos utilizando su payload de QR, lo que permite a esta función obtener una actividad específica en la aplicación al interactuar con la base de datos PostgreSQL, mejorando la organización del código al centralizar la lógica de acceso a la base de datos en este servicio y facilitando el mantenimiento y la escalabilidad de la aplicación al manejar las operaciones relacionadas con las actividades en servicios específicos
    [qr_payload]// Parámetro para proporcionar el payload de QR de la actividad que se desea obtener, lo que permite a esta función ejecutar la consulta SQL con el payload de QR específico de la actividad que se desea obtener, mejorando la flexibilidad de la aplicación al permitir a los desarrolladores obtener una actividad específica según su payload de QR
  );
  return result.rows[0] ?? null;
};