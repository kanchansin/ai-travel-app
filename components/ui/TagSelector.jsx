import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Check } from 'lucide-react-native';

const TagSelector = ({ 
  items = [], 
  selectedItems = [], 
  onSelectItem,
  maxSelection = 10,
  disabled = false
}) => {
  const { theme } = useTheme();

  const handleSelect = (item) => {
    if (disabled) return;
    
    const isSelected = selectedItems.includes(item);
    
    // If item is already selected, remove it
    if (isSelected) {
      onSelectItem(item);
      return;
    }
    
    // If max items already selected, alert user
    if (selectedItems.length >= maxSelection && !isSelected) {
      // You could show an alert here if you want
      return;
    }
    
    // Otherwise select the item
    onSelectItem(item);
  };
  
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item);
        
        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.tag,
              isSelected && styles.tagSelected,
              disabled && styles.tagDisabled
            ]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            {isSelected && (
              <Check 
                size={14} 
                color={theme.colors.white} 
                style={styles.checkIcon} 
              />
            )}
            <Text 
              style={[
                styles.tagText,
                isSelected && styles.tagTextSelected
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagSelected: {
    backgroundColor: theme.colors.primary,
  },
  tagDisabled: {
    opacity: 0.6,
  },
  checkIcon: {
    marginRight: 4,
  },
  tagText: {
    color: theme.colors.gray[700],
    fontWeight: '500',
  },
  tagTextSelected: {
    color: theme.colors.white,
  },
});

export default TagSelector;