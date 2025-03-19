import { Text, TouchableOpacity, View } from "react-native"


interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
      {title ? (
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
      ) : (
        <View className="h-10 w-10 rounded-full bg-indigo-600 items-center justify-center">
          <Text className="text-white font-bold">A</Text>
        </View>
      )}

      <View className="flex-row">
        <TouchableOpacity className="mr-4">
          {/* <Search size={24} color="#4b5563" /> */}
        </TouchableOpacity>
        <TouchableOpacity>
          <View className="relative">
            {/* <Bell size={24} color="#4b5563" /> */}
            <View className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 items-center justify-center">
              <Text className="text-white text-xs">3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

