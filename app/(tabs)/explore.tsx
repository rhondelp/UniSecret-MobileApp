import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#16161A', dark: '#16161A' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#EAB308"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            color: '#F4F4F5',
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.descriptionText}>
        This app includes example code to help you get started.
      </ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText style={styles.bodyText}>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            app/(tabs)/index.tsx
          </ThemedText>{' '}
          and{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            app/(tabs)/explore.tsx
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.bodyText}>
          The layout file in{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            app/(tabs)/_layout.tsx
          </ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link" style={styles.linkText}>
            Learn more
          </ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText style={styles.bodyText}>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            w
          </ThemedText>{' '}
          in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText style={styles.bodyText}>
          For static images, you can use the{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            @2x
          </ThemedText>{' '}
          and{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            @3x
          </ThemedText>{' '}
          suffixes to provide files for different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 12 }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link" style={styles.linkText}>
            Learn more
          </ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText style={styles.bodyText}>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            useColorScheme()
          </ThemedText>{' '}
          hook lets you inspect what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link" style={styles.linkText}>
            Learn more
          </ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText style={styles.bodyText}>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold" style={styles.highlightText}>
            components/HelloWave.tsx
          </ThemedText>{' '}
          component uses the powerful{' '}
          <ThemedText
            type="defaultSemiBold"
            style={[styles.highlightText, { fontFamily: Fonts.mono }]}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText style={styles.bodyText}>
              The{' '}
              <ThemedText type="defaultSemiBold" style={styles.highlightText}>
                components/ParallaxScrollView.tsx
              </ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#EAB308',
    bottom: -90,
    left: -35,
    position: 'absolute',
    opacity: 0.85,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 8,
  },
  bodyText: {
    color: '#D4D4D8',
    lineHeight: 22,
  },
  highlightText: {
    color: '#EAB308',
  },
  linkText: {
    color: '#EAB308',
    fontWeight: '700',
    marginTop: 6,
  },
});