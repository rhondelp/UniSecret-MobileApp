import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
} from "react-native";

type SweetAlertType = "success" | "error" | "warning" | "info";

type SweetAlertProps = {
  visible: boolean;
  type?: SweetAlertType;
  title: string;
  message?: string;
  buttonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  cancelButtonText?: string;
};

const { width } = Dimensions.get("window");

export default function SweetAlert({
  visible,
  type = "success",
  title,
  message,
  buttonText = "Continue",
  onConfirm,
  onCancel,
  showCancelButton = false,
  cancelButtonText = "Cancel",
}: SweetAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const iconConfig = {
    success: {
      icon: "✓",
      color: "#EAB308",
      background: "#211F16",
    },

    error: {
      icon: "×",
      color: "#EF4444",
      background: "#211517",
    },

    warning: {
      icon: "!",
      color: "#F59E0B",
      background: "#211D12",
    },

    info: {
      icon: "i",
      color: "#60A5FA",
      background: "#121A25",
    },
  };

  const config = iconConfig[type];

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),

      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onConfirm();
    });
  };

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),

      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCancel?.();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={
        showCancelButton ? handleCancel : undefined
      }
    >
      <View style={styles.overlay}>
        {/* BACKDROP */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.72],
              }),
            },
          ]}
        />

        {/* ALERT */}

        <Animated.View
          style={[
            styles.alert,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          {/* ICON */}

          <View style={styles.iconContainer}>
            <View
              style={[
                styles.icon,
                {
                  borderColor: config.color,
                  backgroundColor: config.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  {
                    color: config.color,
                  },
                ]}
              >
                {config.icon}
              </Text>
            </View>
          </View>

          {/* TITLE */}

          <Text style={styles.title}>
            {title}
          </Text>

          {/* MESSAGE */}

          {message ? (
            <Text style={styles.message}>
              {message}
            </Text>
          ) : null}

          {/* BUTTON */}

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.82}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {buttonText}
            </Text>
          </TouchableOpacity>

          {/* CANCEL */}

          {showCancelButton && (
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>
                {cancelButtonText}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  alert: {
    width: Math.min(width - 40, 390),

    borderRadius: 26,

    borderWidth: 1,
    borderColor: "#29292F",

    backgroundColor: "#101012",

    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,

    elevation: 20,
  },

  iconContainer: {
    alignItems: "center",
  },

  icon: {
    width: 68,
    height: 68,

    borderRadius: 34,

    borderWidth: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    fontSize: 30,
    fontWeight: "900",
  },

  title: {
    marginTop: 20,

    color: "#FAFAFA",

    fontSize: 21,
    fontWeight: "800",

    textAlign: "center",

    letterSpacing: -0.3,
  },

  message: {
    marginTop: 10,

    paddingHorizontal: 12,

    color: "#85858D",

    fontSize: 13,
    lineHeight: 20,

    textAlign: "center",
  },

  primaryButton: {
    height: 54,

    marginTop: 24,

    borderRadius: 16,

    backgroundColor: "#EAB308",

    justifyContent: "center",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#09090B",

    fontSize: 14,
    fontWeight: "800",

    letterSpacing: 0.2,
  },

  cancelButton: {
    height: 48,

    marginTop: 8,

    borderRadius: 15,

    backgroundColor: "#18181B",

    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#A1A1AA",

    fontSize: 13,
    fontWeight: "700",
  },
});