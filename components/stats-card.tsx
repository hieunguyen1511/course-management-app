import { Text, View } from "react-native"

interface StatsCardProps {
  title: string
  value: string
  color: string
  textColor: string
}

export default function StatsCard({ title, value, color, textColor }: StatsCardProps) {
  return (
    <View className={`${color} p-4 rounded-xl w-[31%]`}>
      <Text className={`${textColor} text-2xl font-bold`}>{value}</Text>
      <Text className={`${textColor} opacity-80`}>{title}</Text>
    </View>
  )
}

