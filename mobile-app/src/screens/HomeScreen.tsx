import { useEffect, useState } from "react";
import { FlatList, View, Image, ActivityIndicator } from "react-native";
import { getPhotos, Photo } from "@/shared/api";
import { Indents } from "@/shared/design-system";

export default function HomeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const fetchedPhotos = await getPhotos();
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Photo }) => (
    <View className="flex-1 max-w-[48%] mb-2.5 items-center border border-gray-300 rounded-lg p-1.5">
      <Image
        source={{ uri: item.url }}
        className="w-full h-[150px] rounded-lg"
        resizeMode="cover"
      />
    </View>
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: Indents.padding.p5,
        paddingTop: Indents.padding.p5,
      }}
      columnWrapperStyle={{
        flex: 1,
        justifyContent: "space-around",
      }}
    />
  );
}
