import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Sunrise, Sun, Clock, Sunset, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTargetLocation } from '@/context/TargetLocationContext';
import { useLanguage } from '@/context/LanguageContext';
import { calculateZmanim, ZmanimTimes } from '@/services/zmanim';
import Colors from '@/constants/colors';

interface ZmanCardProps {
  icon: React.ReactNode;
  label: string;
  hebrewName: string;
  time: Date | null;
  index: number;
  isPast: boolean;
  isNext: boolean;
}

function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function ZmanCard({ icon, label, hebrewName, time, index, isPast, isNext }: ZmanCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        isNext && styles.cardNext,
        isPast && styles.cardPast,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {isNext && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>NEXT</Text></View>}
      <View style={styles.cardIconRow}>
        <View style={[styles.iconCircle, isNext && styles.iconCircleNext]}>
          {icon}
        </View>
        <View style={styles.cardTextCol}>
          <Text style={[styles.cardHebrew, isPast && styles.textPast]}>{hebrewName}</Text>
          <Text style={[styles.cardLabel, isPast && styles.textPast]}>{label}</Text>
        </View>
        <Text style={[styles.cardTime, isNext && styles.cardTimeNext, isPast && styles.textPast]}>
          {time ? formatTime(time) : '--:--'}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ZmanimScreen() {
  const { targetLocation } = useTargetLocation();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [now] = useState(() => new Date());

  const zmanim = useMemo(() => {
    return calculateZmanim(now, targetLocation.latitude, targetLocation.longitude);
  }, [now, targetLocation.latitude, targetLocation.longitude]);

  const zmanimList = useMemo(() => {
    const items: { key: keyof ZmanimTimes; label: string; hebrew: string; icon: React.ReactNode; time: Date | null }[] = [
      {
        key: 'sunrise',
        label: t('zmanim.sunrise'),
        hebrew: 'הנץ החמה',
        icon: <Sunrise size={22} color="#FF9500" />,
        time: zmanim.sunrise,
      },
      {
        key: 'sofZmanShema',
        label: t('zmanim.sofZmanShema'),
        hebrew: 'סוף זמן ק״ש',
        icon: <Clock size={22} color="#5AC8FA" />,
        time: zmanim.sofZmanShema,
      },
      {
        key: 'chatzot',
        label: t('zmanim.chatzot'),
        hebrew: 'חצות היום',
        icon: <Sun size={22} color="#FFD60A" />,
        time: zmanim.chatzot,
      },
      {
        key: 'shkiah',
        label: t('zmanim.shkiah'),
        hebrew: 'שקיעה',
        icon: <Sunset size={22} color="#FF6B35" />,
        time: zmanim.shkiah,
      },
      {
        key: 'tzeit',
        label: t('zmanim.tzeit'),
        hebrew: 'צאת הכוכבים',
        icon: <Star size={22} color="#BF5AF2" />,
        time: zmanim.tzeit,
      },
    ];
    return items;
  }, [zmanim, t]);

  const nextIndex = useMemo(() => {
    const nowUtc = now.getTime();
    for (let i = 0; i < zmanimList.length; i++) {
      const time = zmanimList[i].time;
      if (time && time.getTime() > nowUtc) return i;
    }
    return -1;
  }, [zmanimList, now]);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('zmanim.title')}</Text>
        <Text style={styles.date}>{dateStr}</Text>

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>{t('zmanim.location')}</Text>
          <Text style={styles.locationName}>{targetLocation.name}</Text>
          <Text style={styles.locationCoords}>
            {targetLocation.latitude.toFixed(4)}°, {targetLocation.longitude.toFixed(4)}°
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>{t('zmanim.dailyTimes')}</Text>

        {zmanimList.map((item, i) => (
          <ZmanCard
            key={item.key}
            icon={item.icon}
            label={item.label}
            hebrewName={item.hebrew}
            time={item.time}
            index={i}
            isPast={nextIndex > i}
            isNext={nextIndex === i}
          />
        ))}

        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{t('zmanim.note')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.compass.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.compass.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.compass.textSecondary,
    marginBottom: 20,
  },
  locationCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.compass.border,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.compass.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.compass.text,
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 13,
    color: Colors.compass.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.compass.border,
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.compass.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardNext: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  cardPast: {
    opacity: 0.5,
  },
  nextBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 12,
    backgroundColor: '#FF9500',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  cardIconRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 14,
  },
  iconCircleNext: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  cardTextCol: {
    flex: 1,
  },
  cardHebrew: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.compass.text,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.compass.textSecondary,
  },
  cardTime: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.compass.text,
    fontVariant: ['tabular-nums'] as const,
  },
  cardTimeNext: {
    color: '#FF9500',
  },
  textPast: {
    color: 'rgba(255,255,255,0.35)',
  },
  noteContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  noteText: {
    fontSize: 12,
    color: Colors.compass.textSecondary,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
});
