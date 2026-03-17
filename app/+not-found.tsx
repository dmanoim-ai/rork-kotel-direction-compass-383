import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Compass } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <LinearGradient
      colors={[Colors.compass.backgroundGradientStart, Colors.compass.backgroundGradientEnd]}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.content}>
        <Compass size={64} color={Colors.compass.gold} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This screen does not exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Compass</Text>
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.compass.text,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.compass.textSecondary,
    marginTop: 8,
  },
  link: {
    marginTop: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.compass.gold,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.compass.background,
  },
});
