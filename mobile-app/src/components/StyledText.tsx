import { Text as DefaultText, TextProps } from "react-native";
import { useTheme } from "@react-navigation/native";

export function StyledText(props: TextProps) {
  const { colors } = useTheme();

  return (
    <DefaultText {...props} style={[{ color: colors.text }, props.style]} />
  );
}
