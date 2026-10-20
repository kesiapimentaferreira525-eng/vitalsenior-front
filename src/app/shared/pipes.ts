import { Pipe, PipeTransform } from '@angular/core';

import { Perfil, TurnoMedicao } from '../core/models/api.models';
import { PERFIL_ROTULO, TURNO_ROTULO } from '../core/models/labels';

@Pipe({ name: 'turno', standalone: true })
export class TurnoPipe implements PipeTransform {
  transform(valor: TurnoMedicao | null | undefined): string {
    return valor ? (TURNO_ROTULO[valor] ?? valor) : '';
  }
}

@Pipe({ name: 'perfil', standalone: true })
export class PerfilPipe implements PipeTransform {
  transform(valor: Perfil | null | undefined): string {
    return valor ? (PERFIL_ROTULO[valor] ?? valor) : '';
  }
}

/** Converte o LocalDateTime do Java (sem fuso) em Date local. */
export function paraData(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

const FMT_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const FMT_DATA_LONGA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const FMT_HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/**
 * Data/hora legível:
 *  - 'completa' → 20/10/2026 às 08:30
 *  - 'longa'    → terça-feira, 20 de outubro, às 08:30
 *  - 'data'     → 20/10/2026
 *  - 'hora'     → 08:30
 */
@Pipe({ name: 'dataHora', standalone: true })
export class DataHoraPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined, formato: 'completa' | 'longa' | 'data' | 'hora' = 'completa'): string {
    const d = valor instanceof Date ? valor : paraData(valor);
    if (!d) return '—';
    switch (formato) {
      case 'data': return FMT_DATA.format(d);
      case 'hora': return FMT_HORA.format(d);
      case 'longa': return `${FMT_DATA_LONGA.format(d)}, às ${FMT_HORA.format(d)}`;
      default: return `${FMT_DATA.format(d)} às ${FMT_HORA.format(d)}`;
    }
  }
}

/** Número em pt-BR (vírgula decimal). */
@Pipe({ name: 'numero', standalone: true })
export class NumeroPipe implements PipeTransform {
  transform(valor: number | null | undefined, casas = 0): string {
    if (valor === null || valor === undefined || isNaN(valor)) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });
  }
}
