import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AccessibilityInfo,
} from 'react-native';
// Opcional para degradados más suaves:
// yarn add react-native-linear-gradient
// import LinearGradient from 'react-native-linear-gradient';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedItem = ({
  item,
  index,
  isVisible,
  delay = 0,
  onPress,
  itemClassName, // placeholder para compatibilidad con API web
  selected,
}) => {
  // Animated values
  const scale = useRef(new Animated.Value(isVisible ? 1 : 0.7)).current;
  const opacity = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: isVisible ? 1 : 0.7,
      duration: 200,
      delay: delay ? delay * 1000 : 0,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      delay: delay ? delay * 1000 : 0,
      useNativeDriver: true,
    }).start();
  }, [isVisible, delay, scale, opacity]);

  return (
    <AnimatedTouchable
      activeOpacity={0.85}
      onPress={() => onPress(item, index)}
      style={[
        styles.itemWrapper,
        selected && styles.itemSelected,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${item}`}
    >
      <View>
        <Text style={styles.itemText}>{item}</Text>
      </View>
    </AnimatedTouchable>
  );
};

const AnimatedList = ({
  items = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`),
  onItemSelect = () => {},
  showGradients = true,
  enableArrowNavigation = false, // RN no tiene window.keydown en móvil; sirve para desktop/web si integras
  className = '',
  itemClassName = '',
  displayScrollbar = true, // FlatList maneja scrollbars por plataforma
  initialSelectedIndex = -1,
  listWidth = 500, // se puede usar para estilos
  listHeight = 400,
}) => {
  const flatListRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  // visible indices controlado por viewable items
  const [visibleMap, setVisibleMap] = useState({}); // { index: true }

  // Viewability config para FlatList
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // similar to amount: 0.5
  };

  // callback que FlatList llama cuando items cambian su visibilidad
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    // construir mapa rápido para chequear visibilidad
    const map = {};
    viewableItems.forEach(v => {
      if (typeof v.index === 'number') map[v.index] = true;
    });
    setVisibleMap(map);
  }).current;

  // manejar selección (tap)
  const handlePress = (item, index) => {
    setSelectedIndex(index);
    onItemSelect && onItemSelect(item, index);

    // scroll to the pressed item: normalizamos con scrollToIndex
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        viewPosition: 0.5, // centrar
        animated: true,
      });
    }

    // para accesibilidad: anunciar selección en plataformas que lo soporten
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility && AccessibilityInfo.announceForAccessibility(`${item} seleccionado`);
    }
  };

  // si initialSelectedIndex cambia, hacer scroll a ese index
  useEffect(() => {
    if (initialSelectedIndex >= 0 && flatListRef.current) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({
            index: initialSelectedIndex,
            viewPosition: 0.5,
            animated: false,
          });
          setSelectedIndex(initialSelectedIndex);
        } catch (err) {
          // ignore
        }
      }, 50);
    }
  }, [initialSelectedIndex]);

  // helper para scroll cuando se selecciona por código (o por "teclado" en plataformas desktop)
  const scrollTo = useCallback(
    index => {
      if (!flatListRef.current || index < 0 || index >= items.length) return;
      flatListRef.current.scrollToIndex({ index, viewPosition: 0.5, animated: true });
    },
    [items.length]
  );

  // Si quieres soporte de "arrow navigation" en plataformas que acepten eventos de teclado,
  // tendrías que conectar listeners nativos o usar react-native-web. Aquí dejo el hook vacío
  // para no romper en móviles; el usuario puede extenderlo si lo necesita.
  useEffect(() => {
    if (!enableArrowNavigation) return;
    // Implementación específica a plataforma (react-native-web o TV) requerida.
    // Por ahora: no hacemos nada para evitar errores en móviles.
    return () => {};
  }, [enableArrowNavigation]);

  // FlatList requiere keyExtractor
  const keyExtractor = (item, index) => index.toString();

  // handle fallback cuando scrollToIndex lanza (índice fuera de rango)
  const getItemLayout = (data, index) => {
    // Asumimos altura constante por item (p.e. 72) para scrollToIndex eficiente.
    const ITEM_HEIGHT = 72; // si cambias el padding/height actualiza esto
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
  };

  // render de cada fila
  const renderItem = ({ item, index }) => {
    const isVisible = !!visibleMap[index];
    return (
      <AnimatedItem
        item={item}
        index={index}
        isVisible={isVisible}
        delay={0.1}
        onPress={handlePress}
        itemClassName={itemClassName}
        selected={selectedIndex === index}
      />
    );
  };

  return (
    <View style={[styles.container, { width: listWidth }]}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={[{ maxHeight: listHeight }, displayScrollbar ? {} : { scrollbarWidth: 'none' }]}
        showsVerticalScrollIndicator={displayScrollbar}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
      />

      {showGradients && (
        <>
          {/* Si tienes react-native-linear-gradient instalada, sustituye View por LinearGradient para mejores degradados */}
          <View pointerEvents="none" style={[styles.topGradient, { opacity: visibleMap && Object.keys(visibleMap).length ? 0.0 : 0.0 }]} />
          <View pointerEvents="none" style={styles.topGradientFallback} />
          <View pointerEvents="none" style={styles.bottomGradientFallback} />
        </>
      )}
    </View>
  );
};

export default AnimatedList;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  itemWrapper: {
    padding: 16,
    backgroundColor: '#111111',
    marginBottom: 12,
    borderRadius: 12,
    // altura aproximada para getItemLayout
    minHeight: 56,
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: '#222222',
  },
  itemText: {
    color: '#FFFFFF',
    margin: 0,
    fontSize: 16,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    // si usas LinearGradient, reemplaza esto
    backgroundColor: 'rgba(6,0,16,0.9)',
  },
  topGradientFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#060010',
    opacity: 0.6,
  },
  bottomGradientFallback: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#060010',
    opacity: 0.85,
  },
});
