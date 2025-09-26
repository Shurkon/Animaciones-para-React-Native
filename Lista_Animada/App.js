import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AnimatedList from './AnimatedList';

export default function App() {
  // Lista de ejemplo
  const items = Array.from({ length: 20 }, (_, i) => `Elemento ${i + 1}`);

  // Callback al seleccionar
  const handleSelect = (item, index) => {
    console.log('Seleccionado:', item, 'en índice', index);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedList
          items={items}
          onItemSelect={handleSelect}
          showGradients={true}
          initialSelectedIndex={2}
          listWidth={500}
          listHeight={700}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

