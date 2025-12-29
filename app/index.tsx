import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Splash screen'i manuel olarak gizleyeceğiz
SplashScreen.preventAutoHideAsync();

const WEBSITE_URL = 'https://www.meshur.co/';

// Tema renkleri
const COLORS = {
    light: {
        background: '#ffffff',
        spinner: '#000000',
        statusBar: 'dark-content' as const,
    },
    dark: {
        background: '#121212',
        spinner: '#ffffff',
        statusBar: 'light-content' as const,
    },
};

export default function App() {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canGoBack, setCanGoBack] = useState(false);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();

    // Tema renklerini al
    const theme = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

    // Android geri tuşu desteği
    useEffect(() => {
        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                    return true;
                }
                return false;
            });

            return () => backHandler.remove();
        }
    }, [canGoBack]);

    const handleLoadEnd = () => {
        setIsLoading(false);
        SplashScreen.hideAsync();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
            <WebView
                ref={webViewRef}
                source={{ uri: WEBSITE_URL }}
                style={styles.webview}
                onLoadEnd={handleLoadEnd}
                onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
                // Performans ve UX iyileştirmeleri
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                        <ActivityIndicator size="large" color={theme.spinner} />
                    </View>
                )}
                // Web özellikleri
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsBackForwardNavigationGestures={true} // iOS swipe navigation
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                // Cache ve performans
                cacheEnabled={true}
                cacheMode="LOAD_DEFAULT"
                // Scroll ve zoom
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={true}
                // Güvenlik
                originWhitelist={['https://*', 'http://*']}
            />
            {isLoading && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.spinner} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
