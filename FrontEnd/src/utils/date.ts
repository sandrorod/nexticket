export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

export function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}

export function formatarDataHora(dataHoraIso: string): string {
  const date = new Date(dataHoraIso);
  if (Number.isNaN(date.getTime())) return dataHoraIso;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
