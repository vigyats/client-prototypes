import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { UploadUrlResponse } from "@shared/schema";
import { parseWithLogging } from "./_parse";

export function useRequestUploadUrl() {
  return useMutation({
    mutationFn: async (input: { name: string; size?: number; contentType?: string }): Promise<UploadUrlResponse> => {
      const validated = api.uploads.requestUrl.input.parse({
        ...input,
        size: input.size,
      });
      const res = await fetch(api.uploads.requestUrl.path, {
        method: api.uploads.requestUrl.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (res.status === 400) {
        const e = parseWithLogging(api.uploads.requestUrl.responses[400], await res.json(), "uploads.requestUrl 400");
        throw new Error(e.message);
      }
      if (res.status === 401) throw new Error("401: Unauthorized");
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return parseWithLogging(api.uploads.requestUrl.responses[200], await res.json(), "uploads.requestUrl 200");
    },
  });
}

export async function uploadToPresignedUrl(file: File, uploadURL: string) {
  const res = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}
