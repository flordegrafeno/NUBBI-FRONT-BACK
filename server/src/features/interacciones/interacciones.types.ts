export interface Interaccion {
  id: string;
  actividad_id: string;
  profile_id: string;
  atencion: boolean;
  interes: boolean;
  deseo: boolean;
  accion: boolean;
  puntos_ganados: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInteraccionDTO {
  actividad_id: string;
  atencion?: boolean;
  interes?: boolean;
  deseo?: boolean;
  accion?: boolean;
}

export interface UpdateInteraccionDTO {
  atencion?: boolean;
  interes?: boolean;
  deseo?: boolean;
  accion?: boolean;
}
