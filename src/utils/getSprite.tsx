import { getPokemonGifByLevel } from "./getPokemonGifByLevel";
import Image from "next/image";

export function getSprite(tipo: string, nivel: number, back = false) {
  // Se back, mostra o GIF de costas (ex: tipo-back.gif), senão o normal
  const gifPath = getPokemonGifByLevel(tipo, nivel);
  if (back) {
    // Tenta buscar um gif de costas, se existir
    const backGif = gifPath.replace(".gif", "-back.gif");
    // Se existir o arquivo, usa ele. Caso contrário, usa o normal.
    // Como não temos verificação de existência, sempre retorna o backGif (adicione os arquivos ou ajuste se necessário)
    return (
      <Image
        src={backGif}
        alt={tipo + " costas"}
        width={128}
        height={128}
        className="w-32 h-32 object-contain mx-auto"
        unoptimized
      />
    );
  }
  return (
    <Image
      src={gifPath}
      alt={tipo}
      width={128}
      height={128}
      className="w-32 h-32 object-contain mx-auto"
      unoptimized
    />
  );
}
