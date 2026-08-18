import { Link } from 'expo-router';
import { StyleSheet, StatusBar } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      <ThemedText type="title" style={styles.title}>
        This is a modal
      </ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link" style={styles.linkText}>
          Go to home screen
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0A0A0C',
  },
  title: {
    color: '#F4F4F5',
    fontWeight: '800',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#EAB308',
    fontWeight: '700',
  },
});