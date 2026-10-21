import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { logout } from '../lib/auth';
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
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <>
          <Text style={styles.primaryButtonText}>{label}</Text>
          {icon ? <Ionicons name={icon} size={20} color={colors.surface} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={colors.ink} /> : null}
          <Text style={styles.secondaryButtonText}>{label}</Text>
        </>
      )}
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
  error,
  ...props
}: TextInputProps & { label: string; icon?: IconName; right?: ReactNode; error?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, error ? styles.fieldBoxError : null]}>
        {icon ? <Ionicons name={icon} size={20} color={error ? colors.danger : colors.inkSoft} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#A79B9D"
          selectionColor={colors.primary}
          style={styles.fieldInput}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Notice({
  text,
  tone = 'danger',
  icon,
}: {
  text: string;
  tone?: 'danger' | 'warning' | 'success';
  icon?: IconName;
}) {
  const tones = {
    danger: { backgroundColor: colors.dangerSoft, color: colors.danger, icon: 'alert-circle' as IconName },
    warning: { backgroundColor: colors.warningSoft, color: colors.warning, icon: 'time' as IconName },
    success: { backgroundColor: colors.successSoft, color: colors.success, icon: 'checkmark-circle' as IconName },
  }[tone];

  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: tones.backgroundColor }]}>
      <Ionicons name={icon ?? tones.icon} size={20} color={tones.color} />
      <Text style={[styles.noticeText, { color: tones.color }]}>{text}</Text>
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

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function FloatingButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.buttonPressed]}
    >
      <Ionicons name={icon} size={22} color={colors.surface} />
      <Text style={styles.fabText}>{label}</Text>
    </Pressable>
  );
}

export function LoadingState({ text = 'Carregando...' }: { text?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

export function ErrorState({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={34} color={colors.danger} />
      </View>
      <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
      <Text style={styles.emptyText}>{text}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}>
        <Ionicons name="refresh" size={18} color={colors.surface} />
        <Text style={styles.retryText}>Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

export function ScreenHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <View style={styles.screenHeader}>
      <BackButton onPress={onBack} />
      <Text style={styles.screenHeaderTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.screenHeaderRight}>{right}</View>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Avatar({ initials, size = 42 }: { initials: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 3 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

// Linha "rótulo ... valor" dos resumos de pagamento (valor do turno, taxa, total).
export function ValueRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.valueRow}>
      <Text style={[styles.valueRowLabel, strong && styles.valueRowStrong]}>{label}</Text>
      <Text style={[styles.valueRowValue, strong && styles.valueRowStrong]}>{value}</Text>
    </View>
  );
}

// Estrelas de 1 a 5. Com onChange vira o seletor de nota da avaliação.
export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (nota: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((nota) => {
        const icon = <Ionicons name={nota <= value ? 'star' : 'star-outline'} size={size} color={colors.star} />;
        return onChange ? (
          <Pressable key={nota} onPress={() => onChange(nota)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Nota ${nota}`}>
            {icon}
          </Pressable>
        ) : (
          <View key={nota}>{icon}</View>
        );
      })}
    </View>
  );
}

// Logout com confirmação. Ao limpar a sessão, o layout raiz volta para a tela de boas-vindas.
export function confirmarSaida() {
  Alert.alert('Sair da conta?', 'Você precisará entrar de novo para acessar o Chama.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: () => void logout() },
  ]);
}

// Para botões cujo recurso ainda não existe (chat, mapa, saque...). Ver docs/roadmap.md.
export function avisarEmBreve(recurso: string) {
  Alert.alert('Em breve', `${recurso} ainda não está disponível nesta versão do Chama.`);
}

export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.tabInactive,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  tabBarStyle: {
    height: 82,
    paddingTop: 9,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
} as const;

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
  fieldBoxError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: radius.md, padding: 14 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, letterSpacing: -0.4 },
  sectionAction: { fontSize: 14, fontWeight: '800', color: colors.primary },
  pill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 12, fontWeight: '800' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.wine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  fabText: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 75, paddingHorizontal: 30 },
  emptyIcon: { width: 70, height: 70, borderRadius: 25, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 20, textAlign: 'center' },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 7 },
  loading: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 11, marginTop: 18 },
  retryText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  screenHeaderTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontSize: 16, fontWeight: '900' },
  screenHeaderRight: { width: 44, alignItems: 'flex-end' },
  segment: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 16, padding: 4 },
  segmentItem: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  segmentTextActive: { color: colors.ink },
  avatar: { backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.surface, fontWeight: '900' },
  stars: { flexDirection: 'row', gap: 3 },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  valueRowLabel: { color: colors.inkSoft, fontSize: 13 },
  valueRowValue: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  valueRowStrong: { color: colors.ink, fontSize: 15, fontWeight: '900' },
});
