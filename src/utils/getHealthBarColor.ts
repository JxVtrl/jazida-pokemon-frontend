export function getHealthBarColor(vida: number, vidaMaxima: number) {
  const percentage = (vida / vidaMaxima) * 100;
  if (percentage > 60) return "bg-green-500";
  if (percentage > 30) return "bg-yellow-500";
  return "bg-red-500";
}
