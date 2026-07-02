// Catálogo de ejercicios usado por la Capa de Presentación para la user story
// "Visualización de ejercicios". Para el MVP se usa contenido descriptivo
// propio en vez de video embebido, evitando así depender de APIs externas de
// pago o con derechos de autor de terceros.
export const EJERCICIOS = {
  sentadillas: {
    nombre: 'Sentadillas',
    grupoMuscular: 'Piernas y glúteos',
    descripcion:
      'De pie, separa los pies al ancho de hombros y baja flexionando rodillas y caderas como si te sentaras en una silla, manteniendo la espalda recta.'
  },
  flexiones: {
    nombre: 'Flexiones de brazos',
    grupoMuscular: 'Pecho, hombros y tríceps',
    descripcion:
      'Apoya manos y puntas de pies en el suelo, cuerpo en línea recta, y baja el pecho doblando los codos cerca del cuerpo.'
  },
  plancha: {
    nombre: 'Plancha abdominal',
    grupoMuscular: 'Core',
    descripcion: 'Apoya antebrazos y puntas de pies en el suelo manteniendo el cuerpo alineado y el abdomen contraído.'
  },
  saltos_cuerda: {
    nombre: 'Saltos de cuerda (o simulados)',
    grupoMuscular: 'Cardiovascular',
    descripcion: 'Salta de forma continua y liviana, aterrizando en la punta de los pies, con o sin cuerda física.'
  },
  zancadas: {
    nombre: 'Zancadas',
    grupoMuscular: 'Piernas y glúteos',
    descripcion: 'Da un paso largo hacia adelante y baja hasta que ambas rodillas formen un ángulo cercano a 90°.'
  },
  puente_gluteo: {
    nombre: 'Puente de glúteos',
    grupoMuscular: 'Glúteos y core',
    descripcion: 'Acostado boca arriba con rodillas flexionadas, eleva la cadera contrayendo los glúteos.'
  },
  burpees: {
    nombre: 'Burpees',
    grupoMuscular: 'Full body / cardio',
    descripcion: 'Combina una sentadilla, una plancha y un salto vertical en un solo movimiento fluido.'
  },
  remo_banda: {
    nombre: 'Remo con banda elástica',
    grupoMuscular: 'Espalda',
    descripcion: 'Sujeta la banda con ambas manos y tira hacia el torso juntando los omóplatos.'
  },
  mountain_climbers: {
    nombre: 'Mountain climbers',
    grupoMuscular: 'Core / cardio',
    descripcion: 'En posición de plancha, lleva las rodillas al pecho de forma alternada y rápida.'
  },
  press_hombro_mancuerna: {
    nombre: 'Press de hombro',
    grupoMuscular: 'Hombros',
    descripcion: 'Con mancuernas o botellas con peso, empuja desde la altura de los hombros hacia arriba.'
  }
}
