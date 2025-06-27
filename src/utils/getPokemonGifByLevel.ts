export function getPokemonGifByLevel(tipo: string, nivel: number): string {
  let gifFile = `${tipo}.gif`;

  if (nivel >= 10 && nivel < 20) {
    gifFile = `${tipo}-1.gif`;
  } else if (nivel >= 20) {
    gifFile = `${tipo}-2.gif`;
  }

  return `/assets/gifs/${tipo.toLowerCase()}/${gifFile}`;
} 