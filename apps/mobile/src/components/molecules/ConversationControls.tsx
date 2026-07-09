import React, { useEffect, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Check, Mars, Venus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const BRAND = '#E51C44';
const BRAND_LIGHT = '#FF4D6D';
const AMBER = '#F59E0B';

/* ───────────────────────── Progress thread ───────────────────────── */
export const ProgressThread: React.FC<{ progress: number }> = ({ progress }) => {
  const w = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.spring(w, { toValue: progress, useNativeDriver: false, friction: 10, tension: 60 }).start();
  }, [progress]);
  const width = w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return (
    <View style={pt.track}>
      <Animated.View style={[pt.fillWrap, { width }]}>
        <LinearGradient colors={[BRAND, BRAND_LIGHT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
};

/* ───────────────────────── Segmented gender ───────────────────────── */
export const SegmentedGender: React.FC<{ value?: 'M' | 'F'; onChange: (v: 'M' | 'F') => void }> = ({ value, onChange }) => {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(value === 'F' ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(x, { toValue: value === 'F' ? 1 : 0, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [value]);
  const tx = x.interpolate({ inputRange: [0, 1], outputRange: [0, w / 2] });
  const options: { l: string; v: 'M' | 'F'; Icon: typeof Mars }[] = [
    { l: 'Masculino', v: 'M', Icon: Mars },
    { l: 'Feminino', v: 'F', Icon: Venus },
  ];
  return (
    <View style={sg.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {!!value && w > 0 && (
        <Animated.View style={[sg.thumb, { width: w / 2 - 4, transform: [{ translateX: tx }] }]}>
          <LinearGradient colors={[BRAND, BRAND_LIGHT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      {options.map((o) => {
        const active = value === o.v;
        return (
          <Pressable key={o.v} style={sg.half} onPress={() => { Haptics.selectionAsync(); onChange(o.v); }}>
            <o.Icon size={17} color={active ? '#fff' : '#94A3B8'} />
            <RNText style={[sg.label, active && sg.labelActive]}>{o.l}</RNText>
          </Pressable>
        );
      })}
    </View>
  );
};

/* ───────────────────────── Minor badge ───────────────────────── */
export const MinorBadge: React.FC<{ age: number }> = ({ age }) => {
  const s = useRef(new Animated.Value(0.8)).current;
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(s, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(o, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  return (
    <Animated.View style={[mb.badge, { opacity: o, transform: [{ scale: s }] }]}>
      <Heart size={18} color={AMBER} fill={AMBER} />
      <RNText style={mb.text}>Você tem {age} — mais pra frente vamos pedir os dados de um responsável 💛</RNText>
    </Animated.View>
  );
};

/* ───────────────────────── Success overlay ───────────────────────── */
export const SuccessOverlay: React.FC<{ firstName?: string }> = ({ firstName }) => {
  const s = useRef(new Animated.Value(0.5)).current;
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(s, { toValue: 1, useNativeDriver: true, friction: 5, tension: 60 }),
      Animated.timing(o, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  return (
    <View style={so.overlay}>
      <Animated.View style={{ opacity: o, alignItems: 'center', transform: [{ scale: s }] }}>
        <View style={so.ring}>
          <LinearGradient colors={[BRAND, BRAND_LIGHT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 60 }]} />
          <Check size={56} color="#fff" strokeWidth={3} />
        </View>
        <RNText style={so.title}>Bem-vindo à família{firstName ? `, ${firstName}` : ''}! 🎉</RNText>
        <RNText style={so.sub}>Estamos preparando sua conta...</RNText>
      </Animated.View>
    </View>
  );
};

/* ───────────────────────── styles ───────────────────────── */
const pt = StyleSheet.create({
  track: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fillWrap: { height: '100%', borderRadius: 3, overflow: 'hidden' },
});

const sg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 14, overflow: 'hidden' },
  half: { flex: 1, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
  labelActive: { color: '#fff' },
});

const mb = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  text: { flex: 1, color: '#FCD9A0', fontSize: 13.5, lineHeight: 19 },
});

const so = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,12,22,0.96)', alignItems: 'center', justifyContent: 'center', padding: 32, zIndex: 50 },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  title: { color: '#F8FAFC', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginTop: 10 },
});
