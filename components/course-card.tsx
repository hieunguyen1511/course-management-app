import { Image, Text, TouchableOpacity, View } from "react-native"

import "../global.css"


interface CourseCardProps {
  title: string
  instructor: string
  progress: number
  image: string
  duration: string
  isRecommended?: boolean
}

export default function CourseCard({
  title,
  instructor,
  progress,
  image,
  duration,
  isRecommended = false,
}: CourseCardProps) {
  return (
    <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row">
        <Image source={{ uri: image }} className="h-20 w-20 rounded-lg" />
        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <Text className="text-gray-500">by {instructor}</Text>
          </View>
          <Text className="text-indigo-600">{duration}</Text>
        </View>
      </View>

      {progress > 0 && (
        <View className="mt-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500">Progress</Text>
            <Text className="text-gray-700 font-medium">{progress}%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
          </View>
        </View>
      )}

      {isRecommended && (
        <View className="absolute top-2 right-2 bg-amber-100 px-2 py-1 rounded-full">
          <Text className="text-amber-800 text-xs font-medium">Recommended</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

