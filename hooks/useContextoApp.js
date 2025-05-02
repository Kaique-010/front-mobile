import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useContextoApp() {
  const [contexto, setContexto] = useState({
    usuarioId: null,
    empresaId: null,
    filialId: null,
    carregando: true,
  });

  useEffect(() => {
    const carregar = async () => {
      try {
        const [usuarioRaw, empresaId, filialId] = await Promise.all([
          AsyncStorage.getItem("usuario"),
          AsyncStorage.getItem("empresaId"),
          AsyncStorage.getItem("filialId"),
        ]);

        const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null;
        const usuarioId = usuarioObj?.usuario_id ?? null;

        setContexto({
          usuarioId,
          empresaId,
          filialId,
          carregando: false,
        });
      } catch (err) {
        console.error("❌ Erro ao carregar contexto do app:", err);
        setContexto((prev) => ({ ...prev, carregando: false }));
      }
    };

    carregar();
  }, []);

  return contexto;
}
