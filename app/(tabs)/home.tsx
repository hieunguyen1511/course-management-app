import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'

import Header from "../../components/header"
import StatsCard from "../../components/stats-card"
import CourseCard from "../../components/course-card"



// const home = () => {
//   return (
//     <SafeAreaView className="flex-1 bg-white">
//         <Header />
//         <ScrollView className="flex-1 px-4">
//           {/* Welcome Section */}
//           <View className="mt-4">
//             <Text className="text-2xl font-bold text-gray-800">Hello, Alex!</Text>
//             <Text className="text-gray-500">Let's continue your learning journey</Text>
//           </View>
  
//           {/* Stats Section */}
//           <View className="mt-6 flex-row justify-between">
//             <StatsCard title="Courses" value="12" color="bg-indigo-100" textColor="text-indigo-800" />
//             <StatsCard title="Hours" value="48" color="bg-green-100" textColor="text-green-800" />
//             <StatsCard title="Certificates" value="3" color="bg-amber-100" textColor="text-amber-800" />
//           </View>
  
//           {/* In Progress Section */}
//           <View className="mt-8">
//             <View className="flex-row justify-between items-center mb-4">
//               <Text className="text-lg font-bold text-gray-800">In Progress</Text>
//               <TouchableOpacity className="flex-row items-center">
//                 <Text className="text-indigo-600 mr-1">View All</Text>
//                 {/* <ChevronRight size={16} color="#4f46e5" /> */}
//               </TouchableOpacity>
//             </View>
  
//             <CourseCard
//               title="UI/UX Design Fundamentals"
//               instructor="Sarah Johnson"
//               progress={75}
//               image="/placeholder.svg?height=120&width=120"
//               duration="2h 15m remaining"
//             />
  
//             <CourseCard
//               title="React Native for Beginners"
//               instructor="Michael Chen"
//               progress={45}
//               image="/placeholder.svg?height=120&width=120"
//               duration="4h 30m remaining"
//             />
//           </View>
  
//           {/* Recommended Section */}
//           <View className="mt-8 mb-8">
//             <View className="flex-row justify-between items-center mb-4">
//               <Text className="text-lg font-bold text-gray-800">Recommended</Text>
//               <TouchableOpacity className="flex-row items-center">
//                 <Text className="text-indigo-600 mr-1">View All</Text>
//                 {/* <ChevronRight size={16} color="#4f46e5" /> */}
//               </TouchableOpacity>
//             </View>
  
//             <CourseCard
//               title="Advanced JavaScript Patterns"
//               instructor="David Wilson"
//               progress={0}
//               image="/placeholder.svg?height=120&width=120"
//               duration="8h total"
//               isRecommended={true}
//             />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//   )
// }


const home = () => {
  return (
    <View className='flex-1 bg-white'>
      <Text className='text-center'>home</Text>
    </View>
  )
}

export default home