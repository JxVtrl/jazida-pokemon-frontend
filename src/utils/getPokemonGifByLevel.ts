export function getPokemonGifByLevel(tipo: string, nivel: number): string {
  if (!tipo) {
    return "/assets/gifs/spinner.gif";
  }

  let gifFile = `${tipo}.gif`;

  if (nivel >= 10 && nivel < 20) {
    gifFile = `${tipo}-1.gif`;
  } else if (nivel >= 20) {
    gifFile = `${tipo}-2.gif`;
  }

  const gifPath = `/assets/gifs/${tipo.toLowerCase()}/${gifFile}`;

  return gifPath;
}
