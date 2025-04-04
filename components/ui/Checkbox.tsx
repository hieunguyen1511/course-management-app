import { TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  onCheck: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

const Checkbox = ({
  checked,
  onCheck,
  label,
  disabled = false,
  className = '',
  labelClassName = '',
}: CheckboxProps) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={() => !disabled && onCheck(!checked)}
      activeOpacity={0.7}
    >
      <View
        className={`
        h-5 w-5 rounded border items-center justify-center
        ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}
        ${disabled ? 'border-gray-200' : ''}
      `}
      >
        {checked && <Check size={14} color="white" strokeWidth={3} />}
      </View>

      {label && <Text className={`ml-2 text-md text-gray-700 ${labelClassName}`}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Checkbox;
