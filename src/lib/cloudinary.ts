import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Credenciais do Cloudinary ausentes nas variáveis de ambiente. Verifique CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mandala-prime/products",
        resource_type: "auto",
        transformation: [
          {
            width: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(
            new Error(
              error?.message || "Não foi possível enviar a foto para o Cloudinary."
            )
          );
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImageFromCloudinary(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return;
  }

  try {
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Erro ao deletar imagem do Cloudinary:", error);
  }
}
