export interface Photo {
  id: string;
  url: string;
}

export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const response = await fetch(
      "https://dog.ceo/api/breeds/image/random/50"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { message: photoUrls } = await response.json();

    const photos: Photo[] = photoUrls.map((url: string, index: number) => ({
      id: `${index}-${Date.now()}`,
      url,
    }));

    return photos;
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    return [];
  }
};
