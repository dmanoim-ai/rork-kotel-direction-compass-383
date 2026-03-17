import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Smartphone,
  RotateCcw,
  Compass,
  MapPin,
  AlertTriangle,
  Wifi,
  Navigation,
  Shield,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { DistanceUnit } from '@/context/LanguageContext';
import { LANGUAGES } from '@/constants/translations';
import type { Language } from '@/constants/translations';

interface TipItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TipItem({ icon, title, description }: TipItemProps) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipIconContainer}>{icon}</View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, distanceUnit, setDistanceUnit, t } = useLanguage();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[Colors.compass.backgroundGradientStart, Colors.compass.backgroundGradientEnd]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.languageSection}>
          <Text style={styles.languageSectionTitle}>{t('language.title')}</Text>
          <View style={styles.languageRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageChip,
                  language === lang.code && styles.languageChipActive,
                ]}
                onPress={() => {
                  void setLanguage(lang.code as Language).then(() => {
                    router.navigate('/');
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageLabel,
                    language === lang.code && styles.languageLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.languageSectionTitle}>{t('units.title')}</Text>
          <View style={styles.languageRow}>
            {([{ code: 'km' as const, label: t('units.km'), icon: 'km' }, { code: 'mi' as const, label: t('units.mi'), icon: 'mi' }] as const).map((unit) => (
              <TouchableOpacity
                key={unit.code}
                style={[
                  styles.languageChip,
                  distanceUnit === unit.code && styles.languageChipActive,
                ]}
                onPress={() => {
                  void setDistanceUnit(unit.code as DistanceUnit);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.unitIcon}>{unit.icon}</Text>
                <Text
                  style={[
                    styles.languageLabel,
                    distanceUnit === unit.code && styles.languageLabelActive,
                  ]}
                >
                  {unit.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.title}>How to Use</Text>
        <Text style={styles.subtitle}>
          Get the most accurate compass readings with these tips
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <Text style={styles.sectionSubNote}>The compass automatically points to the Kotel on start up.</Text>

          <TipItem
            icon={<MapPin size={18} color={Colors.compass.gold} />}
            title="Set Your Target"
            description="Go to the Target tab to choose a destination. You can pick from nearby landmarks, search cities worldwide, tap on a map, or enter exact coordinates."
          />
          <TipItem
            icon={<Smartphone size={18} color={Colors.compass.gold} />}
            title="Hold Your Phone Flat"
            description='Place your phone flat in the palm of your hand, screen facing up. The compass works best when the device is parallel to the ground. If you see "Hold Flat", tilt your phone more level.'
          />
          <TipItem
            icon={<Compass size={18} color={Colors.compass.gold} />}
            title="Follow the Arrow"
            description="The RED arrow points toward your target. Rotate your body (not just the phone) until the arrow lines up with the red marker at the top of the compass ring."
          />
          <TipItem
            icon={<Navigation size={18} color={Colors.compass.gold} />}
            title="Read the Distance and Direction"
            description="The distance and direction to your target is shown below the compass. The device direction that the phone is pointing is also shown."
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Improving Accuracy</Text>

          <TipItem
            icon={<RotateCcw size={18} color="#4FC3F7" />}
            title="Calibrate Your Compass"
            description="If the arrow seems inaccurate, calibrate by slowly moving your phone in a figure-8 pattern several times. This resets the magnetometer and greatly improves accuracy."
          />
          <TipItem
            icon={<AlertTriangle size={18} color="#FFB74D" />}
            title="Avoid Magnetic Interference"
            description="Stay away from magnets, metal objects, electronic devices, speakers, and large steel structures. These create magnetic fields that confuse the compass sensor."
          />
          <TipItem
            icon={<Wifi size={18} color="#81C784" />}
            title="Enable Location Services"
            description="Make sure GPS / Location Services are turned on. The app needs your precise location to calculate the correct direction and distance to the target."
          />
          <TipItem
            icon={<Shield size={18} color="#CE93D8" />}
            title="Go Outdoors"
            description="Compass readings are most accurate outdoors, away from buildings and vehicles. Concrete walls and metal roofing can distort magnetic readings."
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.sectionTitle}>iPhone Tips</Text>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>iOS</Text>
            </View>
          </View>

          <View style={styles.platformTip}>
            <Text style={styles.platformTipNumber}>1</Text>
            <Text style={styles.platformTipText}>
              Go to Settings &gt; Privacy &amp; Security &gt; Location Services and make sure it is turned ON, and this app is set to "While Using".
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={styles.platformTipNumber}>2</Text>
            <Text style={styles.platformTipText}>
              Enable Compass Calibration: Settings &gt; Privacy &amp; Security &gt; Location Services &gt; System Services &gt; toggle ON "Compass Calibration".
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={styles.platformTipNumber}>3</Text>
            <Text style={styles.platformTipText}>
              If you have a MagSafe case or wallet attached, remove it. MagSafe magnets can interfere with the magnetometer and cause inaccurate readings.
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={styles.platformTipNumber}>4</Text>
            <Text style={styles.platformTipText}>
              If the compass seems stuck, open the built-in Apple Compass app and complete its calibration circle, then return to this app.
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={styles.platformTipNumber}>5</Text>
            <Text style={styles.platformTipText}>
              Make sure "Precise Location" is enabled for this app in Settings &gt; Privacy &amp; Security &gt; Location Services &gt; [This App].
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.sectionTitle}>Android Tips</Text>
            <View style={[styles.platformBadge, styles.androidBadge]}>
              <Text style={styles.platformBadgeText}>Android</Text>
            </View>
          </View>

          <View style={styles.platformTip}>
            <Text style={[styles.platformTipNumber, styles.androidNumber]}>1</Text>
            <Text style={styles.platformTipText}>
              Go to Settings &gt; Location and make sure Location is turned ON. Set the mode to "High Accuracy" (uses GPS, Wi-Fi, and mobile networks).
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={[styles.platformTipNumber, styles.androidNumber]}>2</Text>
            <Text style={styles.platformTipText}>
              Grant this app "Precise" location permission (not "Approximate"). Check under Settings &gt; Apps &gt; [This App] &gt; Permissions &gt; Location.
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={[styles.platformTipNumber, styles.androidNumber]}>3</Text>
            <Text style={styles.platformTipText}>
              Calibrate the compass by opening Google Maps, tapping the blue location dot, and following the figure-8 calibration prompt. Then return to this app.
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={[styles.platformTipNumber, styles.androidNumber]}>4</Text>
            <Text style={styles.platformTipText}>
              If readings are erratic, try restarting your phone. Some Android devices need a fresh sensor initialization after being near strong magnets.
            </Text>
          </View>
          <View style={styles.platformTip}>
            <Text style={[styles.platformTipNumber, styles.androidNumber]}>5</Text>
            <Text style={styles.platformTipText}>
              Ensure Google Play Services is up to date. Many sensor APIs rely on it for improved accuracy and faster location fixes.
            </Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <AlertTriangle size={14} color="rgba(255,255,255,0.35)" />
          <Text style={styles.footerNoteText}>
            Digital compasses use the magnetometer sensor and are inherently less precise than a dedicated compass. Accuracy can vary by device model and environmental conditions.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.compass.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.compass.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: Colors.compass.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.compass.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.compass.text,
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: 'row' as const,
    marginBottom: 16,
    gap: 12,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.compass.text,
    marginBottom: 3,
  },
  tipDescription: {
    fontSize: 13,
    color: Colors.compass.textSecondary,
    lineHeight: 19,
  },
  platformHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 14,
  },
  platformBadge: {
    backgroundColor: 'rgba(100,180,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  androidBadge: {
    backgroundColor: 'rgba(129,199,132,0.15)',
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.compass.textSecondary,
  },
  platformTip: {
    flexDirection: 'row' as const,
    marginBottom: 14,
    gap: 12,
  },
  platformTipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.2)',
    color: '#4FC3F7',
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: 24,
    overflow: 'hidden' as const,
  },
  androidNumber: {
    backgroundColor: 'rgba(129,199,132,0.2)',
    color: '#81C784',
  },
  platformTipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.compass.textSecondary,
    lineHeight: 19,
  },
  footerNote: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 17,
  },
  sectionSubNote: {
    fontSize: 13,
    color: Colors.compass.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
    fontStyle: 'italic' as const,
  },
  languageSection: {
    marginBottom: 24,
  },
  languageSectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.compass.text,
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  languageChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.compass.cardBackground,
    borderWidth: 1,
    borderColor: Colors.compass.border,
  },
  languageChipActive: {
    borderColor: Colors.compass.gold,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  languageFlag: {
    fontSize: 18,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.compass.textSecondary,
  },
  languageLabelActive: {
    color: Colors.compass.text,
    fontWeight: '600' as const,
  },
  unitIcon: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.compass.gold,
  },
});
