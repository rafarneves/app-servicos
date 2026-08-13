import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius } from '../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, compact && styles.brandIconCompact]}>
        <Ionicons name="flame" size={compact ? 20 : 27} color={colors.surface} />
      </View>
      <Text style={[styles.brandText, compact && styles.brandTextCompact]}>chama</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      {icon ? <Ionicons name={icon} size={20} color={colors.surface} /> : null}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      {icon ? <Ionicons name={icon} size={20} color={colors.ink} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Voltar"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
    >
      <Ionicons name="arrow-back" size={23} color={colors.ink} />
    </Pressable>
  );
}

export function Field({
  label,
  icon,
  right,
  ...props
}: TextInputProps & { label: string; icon?: IconName; right?: ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        {icon ? <Ionicons name={icon} size={20} color={colors.inkSoft} /> : null}
        <TextInput
          placeholderTextColor="#A79B9D"
          selectionColor={colors.primary}
          style={styles.fieldInput}
          {...props}
        />
        {right}
      </View>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'primary';
}) {
  const toneStyle: Record<string, ViewStyle> = {
    neutral: { backgroundColor: colors.muted },
    success: { backgroundColor: colors.successSoft },
    warning: { backgroundColor: colors.warningSoft },
    primary: { backgroundColor: colors.primarySoft },
  };
  const textColor = {
    neutral: colors.inkSoft,
    success: colors.success,
    warning: colors.warning,
    primary: colors.primaryDark,
  }[tone];

  return (
    <View style={[styles.pill, toneStyle[tone]]}>
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  brandIconCompact: { width: 36, height: 36, borderRadius: 12 },
  brandText: { fontSize: 33, lineHeight: 38, fontWeight: '900', color: colors.wine, letterSpacing: -1.4 },
  brandTextCompact: { fontSize: 25, lineHeight: 29 },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: { color: colors.surface, fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryButtonText: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.45 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  fieldBox: {
    minHeight: 55,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  fieldInput: { flex: 1, color: colors.ink, fontSize: 16, paddingVertical: 14 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, letterSpacing: -0.4 },
  sectionAction: { fontSize: 14, fontWeight: '800', color: colors.primary },
  pill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 12, fontWeight: '800' },
});
