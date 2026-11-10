// component list ra các nút loại sản phẩm để nhúng vào các trang
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category } from './database';

interface Props {
  categories: Category[];
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

const CategorySelector = ({ categories, selectedId, onSelect }: Props) => {
  return (
    <View style={styles.container}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.button,
            cat.id === selectedId && styles.selectedButton, // selectedId so sánh với cat.id để tô màu nút đang chọn
          ]}
          onPress={() => {
            console.log('Pressed category:', cat);
            onSelect(cat.id);
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              cat.id === selectedId && styles.selectedText,
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    margin: 4,
  },
  selectedButton: {
    backgroundColor: '#28a745',
  },
  text: {
    color: '#000',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategorySelector;
