import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const TextType = ({
  text,
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorBlinkDuration = 500, // ms
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  reverseMode = false,
  style,
  cursorStyle,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const cursorOpacity = useRef(new Animated.Value(1)).current;

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return '#ffffff';
    return textColors[currentTextIndex % textColors.length];
  };

  // Cursor parpadeante
  useEffect(() => {
    if (showCursor) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: cursorBlinkDuration,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: cursorBlinkDuration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showCursor, cursorBlinkDuration, cursorOpacity]);

  // Efecto typing
  useEffect(() => {
    let timeout;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split('').reverse().join('')
      : currentText;

    const executeTyping = () => {
      if (isDeleting) {
        if (displayedText === '') {
          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }
          const nextIndex = (currentTextIndex + 1) % textArray.length;
          timeout = setTimeout(() => {
            setIsDeleting(false);
            setCurrentCharIndex(0);
            setCurrentTextIndex(nextIndex);
          }, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText(prev => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(() => {
            setDisplayedText(prev => prev + processedText[currentCharIndex]);
            setCurrentCharIndex(prev => prev + 1);
          }, variableSpeed ? getRandomSpeed() : typingSpeed);
        } else {
          if (textArray.length > 1 || loop) {
            timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(executeTyping, initialDelay);
    } else {
      executeTyping();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { color: getCurrentTextColor() }]}>
        {displayedText}
      </Text>
      {showCursor && !shouldHideCursor && (
        <Animated.Text
          style={[
            styles.cursor,
            cursorStyle,
            { opacity: cursorOpacity, color: getCurrentTextColor() },
          ]}
        >
          {cursorCharacter}
        </Animated.Text>
      )}
    </View>
  );
};

export default TextType;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  text: {
    fontSize: 18,
  },
  cursor: {
    fontSize: 18,
    marginLeft: 2,
  },
});

