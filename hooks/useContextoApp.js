import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useContextoApp() {
  const [contexto, setContexto] = useState({
    usuarioId: null,
    empresaId: null,
    filialId: null,
    carregando: true,
  });
  const [modulos, setModulos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [usuarioRaw, empresaId, filialId, modulosRaw] = await Promise.all([
          AsyncStorage.getItem("usuario"),
          AsyncStorage.getItem("empresaId"),
          AsyncStorage.getItem("filialId"),
          AsyncStorage.getItem("modulos"),
        ]);

        const usuarioObj = usuarioRaw ? JSON.parse(usuarioRaw) : null;
        const usuarioId = usuarioObj?.usuario_id ?? null;
        const modulosArray = modulosRaw ? JSON.parse(modulosRaw) : [];

        setContexto({
          usuarioId,
          empresaId,
          filialId,
          carregando: false,
        });
        setModulos(modulosArray);
      } catch (err) {
        console.error("❌ Erro ao carregar contexto do app:", err);
        setContexto((prev) => ({ ...prev, carregando: false }));
      }
    };

    carregar();
  }, []);

  const hasModulo = (mod) => modulos.includes(mod);

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'usuario',
        'empresaId', 
        'filialId',
        'modulos'
      ]);
      setContexto({
        usuarioId: null,
        empresaId: null,
        filialId: null,
        carregando: false,
      });
      setModulos([]);
    } catch (err) {
      console.error("❌ Erro ao fazer logout:", err);
    }
  };

  return {
    ...contexto,
    hasModulo,
    logout,
  };
}

export { useContextoApp };
