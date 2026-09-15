/**
 * Utilitário de compressão de imagens no navegador.
 * Reduz fotos pesadas de celulares (5 MB - 15 MB) para cerca de 200 KB - 500 KB,
 * mantendo excelente qualidade visual e evitando estourar os limites da Vercel/servidor.
 */

export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<File> {
  // Ignora arquivos que não sejam imagens comuns ou que já sejam muito leves
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // Se o arquivo for menor que 200 KB, já está leve o bastante
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve(file);
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== "string") {
          resolve(file);
          return;
        }

        const img = new Image();
        img.onerror = () => resolve(file);
        img.onload = () => {
          try {
            let { width, height } = img;

            // Calcula dimensões proporcionais
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(file);
              return;
            }

            // Fundo branco caso haja transparência em PNG convertida para JPEG
            if (file.type !== "image/webp") {
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0, width, height);

            const targetMime = file.type === "image/webp" ? "image/webp" : "image/jpeg";
            const targetExt = targetMime === "image/webp" ? ".webp" : ".jpg";

            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) {
                  // Se a conversão por algum motivo ficou maior ou nula, preserva o original
                  resolve(file);
                  return;
                }

                const baseName = file.name.replace(/\.[^/.]+$/, "");
                const compressedFile = new File([blob], `${baseName}${targetExt}`, {
                  type: targetMime,
                  lastModified: Date.now(),
                });

                resolve(compressedFile);
              },
              targetMime,
              quality
            );
          } catch {
            resolve(file);
          }
        };

        img.src = dataUrl;
      };

      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}
