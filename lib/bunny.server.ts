const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_CDN_HOST = process.env.BUNNY_CDN_HOST!;
const BUNNY_BASE_HOSTNAME = process.env.BUNNY_BASE_HOSTNAME!;

export async function uploadToBunny(
  file: File,
  folder: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(
    `https://${BUNNY_BASE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${fileName}`,
    {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: buffer,
    }
  );

  if (!response.ok) {
    throw new Error(`Bunny upload failed: ${response.statusText}`);
  }

  return `${BUNNY_CDN_HOST}/${fileName}`;
}
