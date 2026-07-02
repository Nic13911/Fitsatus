// Capa de Negocio de FitSatus
// Contiene las reglas de negocio descritas en la Entrega 2: cálculo de IMC/TDEE,
// generación de planes de entrenamiento y alimenticios, y evaluación de logros.
// Se mantiene aislada de la persistencia (no importa supabaseClient) para
// respetar el bajo acoplamiento entre capas.

export function calcularIMC(pesoKg, estaturaCm) {
  if (!pesoKg || !estaturaCm) return null
  const estaturaM = estaturaCm / 100
  const imc = pesoKg / (estaturaM * estaturaM)
  return Math.round(imc * 10) / 10
}

export function clasificarIMC(imc) {
  if (imc == null) return '—'
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  return 'Obesidad'
}

// Fórmula de Mifflin-St Jeor para tasa metabólica basal, con factor de
// actividad para obtener el TDEE (Total Daily Energy Expenditure).
export function calcularTDEE({ pesoKg, estaturaCm, edad, sexo = 'otro', nivelActividad = 'moderado' }) {
  if (!pesoKg || !estaturaCm || !edad) return null

  let tmb
  if (sexo === 'masculino') {
    tmb = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad + 5
  } else if (sexo === 'femenino') {
    tmb = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad - 161
  } else {
    // promedio entre ambas fórmulas cuando no se especifica el sexo
    tmb = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad - 78
  }

  const factores = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725
  }
  const factor = factores[nivelActividad] ?? 1.55
  return Math.round(tmb * factor)
}

// ---- Generador de Planes: Entrenamiento -----------------------------------
// Cada objetivo define sesiones (día + foco) y un "pool" de ejercicios
// posibles para ese foco. Al generar/regenerar el plan se eligen ejercicios
// al azar desde el pool, así cada generación entrega variedad real y no
// siempre el mismo resultado.

const POOLS_EJERCICIOS = {
  fullbody_cardio: ['sentadillas', 'flexiones', 'plancha', 'saltos_cuerda', 'burpees', 'mountain_climbers'],
  inferior_core: ['zancadas', 'puente_gluteo', 'plancha', 'burpees', 'sentadillas', 'mountain_climbers'],
  superior: ['flexiones', 'remo_banda', 'press_hombro_mancuerna', 'plancha'],
  inferior: ['sentadillas', 'zancadas', 'puente_gluteo']
}

const RUTINAS_BASE = {
  bajar_peso: [
    { dia: 'Lunes', foco: 'Full body + cardio', pool: 'fullbody_cardio', cantidad: 4 },
    { dia: 'Miércoles', foco: 'Tren inferior + core', pool: 'inferior_core', cantidad: 4 },
    { dia: 'Viernes', foco: 'Full body + cardio', pool: 'fullbody_cardio', cantidad: 4 }
  ],
  ganar_musculo: [
    { dia: 'Lunes', foco: 'Tren superior', pool: 'superior', cantidad: 3 },
    { dia: 'Martes', foco: 'Tren inferior', pool: 'inferior', cantidad: 3 },
    { dia: 'Jueves', foco: 'Tren superior', pool: 'superior', cantidad: 3 },
    { dia: 'Viernes', foco: 'Tren inferior + core', pool: 'inferior_core', cantidad: 3 }
  ],
  mantenimiento: [
    { dia: 'Lunes', foco: 'Full body', pool: 'fullbody_cardio', cantidad: 3 },
    { dia: 'Jueves', foco: 'Full body + cardio', pool: 'fullbody_cardio', cantidad: 3 }
  ]
}

const NIVEL_DIFICULTAD = {
  principiante: { series: 3, repeticiones: '10-12', descanso: '60 seg' },
  intermedio: { series: 4, repeticiones: '10-15', descanso: '45 seg' },
  experimentado: { series: 5, repeticiones: '12-20', descanso: '30 seg' }
}

// Elige `cantidad` elementos al azar sin repetir desde un arreglo.
function elegirAlAzar(lista, cantidad) {
  const copia = [...lista]
  const resultado = []
  while (copia.length && resultado.length < cantidad) {
    const indice = Math.floor(Math.random() * copia.length)
    resultado.push(copia.splice(indice, 1)[0])
  }
  return resultado
}

export function generarPlanEntrenamiento({ tipoObjetivo = 'mantenimiento', nivelExperiencia = 'principiante' }) {
  const rutina = RUTINAS_BASE[tipoObjetivo] ?? RUTINAS_BASE.mantenimiento
  const parametros = NIVEL_DIFICULTAD[nivelExperiencia] ?? NIVEL_DIFICULTAD.principiante

  return {
    nivelDificultad: nivelExperiencia,
    frecuenciaSemanal: rutina.length,
    fechaGeneracion: new Date().toISOString(),
    contenido: rutina.map((sesion) => ({
      dia: sesion.dia,
      foco: sesion.foco,
      ejercicios: elegirAlAzar(POOLS_EJERCICIOS[sesion.pool], sesion.cantidad),
      series: parametros.series,
      repeticiones: parametros.repeticiones,
      descanso: parametros.descanso
    }))
  }
}

// ---- Generador de Planes: Alimenticio --------------------------------------

const AJUSTE_CALORICO = {
  bajar_peso: -0.15,
  ganar_musculo: 0.12,
  mantenimiento: 0
}

const MACROS_OBJETIVO = {
  bajar_peso: { proteina: 0.35, carbohidratos: 0.35, grasas: 0.3 },
  ganar_musculo: { proteina: 0.3, carbohidratos: 0.45, grasas: 0.25 },
  mantenimiento: { proteina: 0.3, carbohidratos: 0.4, grasas: 0.3 }
}

const OPCIONES_COMIDAS = {
  bajar_peso: {
    desayuno: ['Avena con fruta y claras de huevo', 'Yogur descremado con frutos rojos', 'Tostadas integrales con palta y tomate'],
    almuerzo: ['Pechuga de pollo, ensalada y quinoa', 'Pescado a la plancha con vegetales salteados', 'Ensalada de legumbres con atún'],
    cena: ['Pescado al horno con vegetales al vapor', 'Crema de verduras con pollo desmenuzado', 'Tortilla de claras con espinaca']
  },
  ganar_musculo: {
    desayuno: ['Huevos completos, pan integral y palta', 'Yogur griego con avena y plátano', 'Batido de proteína con avena y maní'],
    almuerzo: ['Carne o legumbres, arroz y ensalada', 'Pollo con papas y vegetales salteados', 'Salmón con arroz integral'],
    cena: ['Pasta integral con pollo y vegetales', 'Arroz con carne y ensalada', 'Wrap integral con pavo y queso']
  },
  mantenimiento: {
    desayuno: ['Yogur, avena y frutos secos', 'Pan integral con huevo y palta', 'Fruta con yogur natural'],
    almuerzo: ['Proteína a elección, arroz o papas y ensalada', 'Pollo al horno con vegetales', 'Legumbres guisadas con arroz'],
    cena: ['Sopa de verduras con proteína ligera', 'Ensalada completa con huevo', 'Sándwich integral con pavo y vegetales']
  }
}

function elegirUno(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

function generarSugerencias(tipoObjetivo) {
  const opciones = OPCIONES_COMIDAS[tipoObjetivo] ?? OPCIONES_COMIDAS.mantenimiento
  return [
    `Desayuno: ${elegirUno(opciones.desayuno)}`,
    `Almuerzo: ${elegirUno(opciones.almuerzo)}`,
    `Cena: ${elegirUno(opciones.cena)}`
  ]
}

export function generarPlanAlimenticio({ tdee, tipoObjetivo = 'mantenimiento' }) {
  if (!tdee) return null
  const ajuste = AJUSTE_CALORICO[tipoObjetivo] ?? 0
  const caloriasObjetivo = Math.round(tdee * (1 + ajuste))
  const macros = MACROS_OBJETIVO[tipoObjetivo] ?? MACROS_OBJETIVO.mantenimiento

  return {
    caloriasObjetivo,
    distribucionMacros: {
      proteinaG: Math.round((caloriasObjetivo * macros.proteina) / 4),
      carbohidratosG: Math.round((caloriasObjetivo * macros.carbohidratos) / 4),
      grasasG: Math.round((caloriasObjetivo * macros.grasas) / 9)
    },
    sugerencias: generarSugerencias(tipoObjetivo),
    fechaGeneracion: new Date().toISOString()
  }
}

// ---- Sistema de logros ------------------------------------------------------

export const CATALOGO_LOGROS = [
  {
    codigo: 'primer_registro_peso',
    nombre: 'Primer paso',
    descripcion: 'Registraste tu peso por primera vez.'
  },
  {
    codigo: 'primer_plan_generado',
    nombre: 'Con rumbo claro',
    descripcion: 'Generaste tu primer plan de entrenamiento.'
  },
  {
    codigo: 'racha_7_dias',
    nombre: 'Semana completa',
    descripcion: 'Registraste tus calorías durante 7 días distintos.'
  },
  {
    codigo: 'meta_alcanzada',
    nombre: 'Meta cumplida',
    descripcion: 'Alcanzaste el peso objetivo que definiste.'
  }
]

export function evaluarLogros({ registrosDiarios = [], progreso = [], planesGenerados = 0, objetivo = null }) {
  const desbloqueados = new Set()

  if (progreso.length >= 1) desbloqueados.add('primer_registro_peso')
  if (planesGenerados >= 1) desbloqueados.add('primer_plan_generado')

  const diasUnicos = new Set(registrosDiarios.map((r) => r.fecha))
  if (diasUnicos.size >= 7) desbloqueados.add('racha_7_dias')

  if (objetivo?.metaPeso && progreso.length) {
    const ultimoPeso = [...progreso].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]?.peso
    if (ultimoPeso != null) {
      const diferencia = Math.abs(ultimoPeso - objetivo.metaPeso)
      if (diferencia <= 0.5) desbloqueados.add('meta_alcanzada')
    }
  }

  return CATALOGO_LOGROS.filter((logro) => desbloqueados.has(logro.codigo))
}
