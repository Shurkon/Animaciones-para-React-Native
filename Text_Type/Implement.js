import TextType from './TextType';
import { SafeAreaView } from 'react-native-safe-area-context';

// ...

<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1e' }}>
  <TextType
	text={['Hola mundo!', 'Esto es React Native', 'Animación tipo máquina de escribir']}
	typingSpeed={100}
	deletingSpeed={50}
	pauseDuration={1500}
	textColors={['#ff4d4d', '#4dff4d', '#4d4dff']}
	loop
	/>
</SafeAreaView>
