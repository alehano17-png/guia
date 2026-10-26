import { Buffer } from "buffer";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

// Bucket privado de fotos de perfil: cada usuario solo puede leer y
// escribir dentro de su carpeta <userId>/ (reglas del bucket en Supabase).
// "Eliminar cuenta" ya borra esa carpeta entera desde el servidor.
const AVATARS_BUCKET = "avatars";
const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.8;
// Vigencia de la URL firmada; se vuelve a pedir al abrir la pantalla.
const SIGNED_URL_SECONDS = 60 * 60;

export type AvatarMessage = "error" | "permission" | null;

function readMetadataString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

// Foto de perfil del usuario logueado: la ruta en Storage y su fecha viven
// en user_metadata (avatar_path / avatar_updated_at); la imagen se muestra
// con una URL firmada. La app sube y borra directo en Supabase Storage con
// la sesión del usuario (nunca con la llave secreta ni por nuestro
// servidor).
export function useAvatar() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const avatarPath = readMetadataString(user?.user_metadata?.avatar_path);
  const avatarUpdatedAt = readMetadataString(
    user?.user_metadata?.avatar_updated_at
  );

  // La URL firmada se guarda junto con la versión de la foto a la que
  // corresponde (ruta + avatar_updated_at): si la foto cambió o se quitó,
  // la URL vieja deja de usarse sola, sin esperar al pedido nuevo.
  const versionKey = avatarPath ? `${avatarPath}|${avatarUpdatedAt ?? ""}` : null;
  const [signed, setSigned] = useState<{ key: string; url: string | null } | null>(
    null
  );
  const avatarUrl = signed && signed.key === versionKey ? signed.url : null;

  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<AvatarMessage>(null);

  // URL firmada nueva cada vez que cambia la foto o se abre la pantalla.
  // Como trae un token distinto en cada pedido, la imagen nunca queda con
  // la versión vieja en caché.
  useEffect(() => {
    if (!avatarPath || !versionKey) return;
    let isCancelled = false;

    supabase.storage
      .from(AVATARS_BUCKET)
      .createSignedUrl(avatarPath, SIGNED_URL_SECONDS)
      .then(({ data, error }) => {
        // Si falla (por ejemplo, el archivo ya no existe), se muestra la
        // inicial.
        if (!isCancelled) {
          setSigned({ key: versionKey, url: error ? null : data.signedUrl });
        }
      })
      .catch(() => {
        if (!isCancelled) setSigned({ key: versionKey, url: null });
      });

    return () => {
      isCancelled = true;
    };
  }, [avatarPath, versionKey]);

  const pickAndUploadAvatar = useCallback(async () => {
    if (!userId || isBusy) return;
    setMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("permission");
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (picked.canceled || !picked.assets?.[0]?.uri) return;

    setIsBusy(true);
    try {
      // 512x512 en JPEG: muy por debajo del límite de 2 MB del bucket.
      const rendered = await ImageManipulator.manipulate(picked.assets[0].uri)
        .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE })
        .renderAsync();
      const saved = await rendered.saveAsync({
        compress: AVATAR_QUALITY,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!saved.base64) throw new Error("Sin datos de imagen");

      const path = `${userId}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, Buffer.from(saved.base64, "base64"), {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_path: path,
          avatar_updated_at: new Date().toISOString(),
        },
      });
      if (updateError) throw updateError;
    } catch {
      setMessage("error");
    } finally {
      setIsBusy(false);
    }
  }, [userId, isBusy]);

  const removeAvatar = useCallback(async () => {
    if (!avatarPath || isBusy) return;
    setMessage(null);
    setIsBusy(true);

    try {
      // Borrar un archivo que ya no existe no da error: quitar la foto se
      // puede repetir sin problema.
      const { error: removeError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .remove([avatarPath]);
      if (removeError) throw removeError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_path: null, avatar_updated_at: null },
      });
      if (updateError) throw updateError;
    } catch {
      setMessage("error");
    } finally {
      setIsBusy(false);
    }
  }, [avatarPath, isBusy]);

  return {
    avatarUrl,
    avatarUpdatedAt,
    hasAvatar: !!avatarPath,
    isBusy,
    message,
    pickAndUploadAvatar,
    removeAvatar,
  };
}
