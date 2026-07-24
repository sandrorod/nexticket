import { api } from "./client";

export const uploadEventImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<{ url: string }>("/uploads-event-image", formData)
    .then((r) => r.data.url);
};
