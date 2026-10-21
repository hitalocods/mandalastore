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
  const fileName = (file.name || "").toLowerCase();

  // Fotos HEIC/HEIF de iPhones: o canvas do navegador não consegue decodificar nativamente.
  // Enviamos direto para o Cloudinary, que converte HEIC com perfeição na nuvem.
  if (
    file.type.includes("heic") ||
    file.type.includes("heif") ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif")
  ) {
    return file;
  }

  // Se o arquivo for menor que 200 KB ou não for imagem comum, já está leve o suficiente
  if (
    file.size < 200 * 1024 ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  return new Promise((resolve) => {
    let hasResolved = false;
    const safeResolve = (result: File) => {
      if (!hasResolved) {
        hasResolved = true;
        resolve(result);
      }
    };

    // Timeout de segurança de 4 segundos para nunca travar o upload no celular
    const timer = setTimeout(() => {
      safeResolve(file);
    }, 4000);

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        clearTimeout(timer);
        safeResolve(file);
      };
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== "string") {
          clearTimeout(timer);
          safeResolve(file);
          return;
        }

        const img = new Image();
        img.onerror = () => {
          clearTimeout(timer);
          safeResolve(file);
        };
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
              clearTimeout(timer);
              safeResolve(file);
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
                clearTimeout(timer);
                if (!blob || blob.size >= file.size) {
                  safeResolve(file);
                  return;
                }

                try {
                  const baseName = file.name.replace(/\.[^/.]+$/, "");
                  const compressedFile = new File([blob], `${baseName}${targetExt}`, {
                    type: targetMime,
                    lastModified: Date.now(),
                  });
                  safeResolve(compressedFile);
                } catch {
                  // Fallback se o navegador mobile não permitir construtor new File
                  safeResolve(file);
                }
              },
              targetMime,
              quality
            );
          } catch {
            clearTimeout(timer);
            safeResolve(file);
          }
        };

        img.src = dataUrl;
      };

      reader.readAsDataURL(file);
    } catch {
      clearTimeout(timer);
      safeResolve(file);
    }
  });
}
