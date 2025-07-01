import RequireAuth from "./RequireAuth";
import { useState, useEffect } from "react";

export default function BattleLoading() {
  const [loadingBg, setLoadingBg] = useState("/assets/gifs/loading.gif");

  useEffect(() => {
    const updateBg = () => {
      if (typeof window !== "undefined") {
        setLoadingBg(
          window.innerWidth <= 768
            ? "/assets/gifs/loading_mobile.gif"
            : "/assets/gifs/loading.gif",
        );
      }
    };
    updateBg();
    window.addEventListener("resize", updateBg);
    return () => window.removeEventListener("resize", updateBg);
  }, []);

  return (
    <RequireAuth>
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: `url(${loadingBg}) center center / cover no-repeat, linear-gradient(to bottom right, #1e3a8a, #6d28d9, #b91c1c)`,
        }}
      >
        <div className="absolute inset-0" />
        <div className="text-center text-white z-10 w-full">
          <p className="text-2xl font-bold drop-shadow-lg">
            Aguardando o adversário escolher...
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}
