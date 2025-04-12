import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onCheck: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: any;
  labelStyle?: any;
}

const Checkbox = ({
  checked,
  onCheck,
  label,
  disabled = false,
  style,
  labelStyle,
}: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={() => !disabled && onCheck(!checked)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked ? styles.checked : styles.unchecked,
          disabled && styles.disabledCheckbox,
        ]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  unchecked: {
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  disabledCheckbox: {
    borderColor: '#e5e7eb',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
});

export default Checkbox;
