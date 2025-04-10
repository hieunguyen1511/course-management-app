import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MyScreenProps } from '@/types/MyScreenProps';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: any, params: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
