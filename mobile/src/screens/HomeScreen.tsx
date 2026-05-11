import React, { useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import { useApi } from '../hooks/useApi';
import { api } from '../config';
import GlassCard     from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';
import {
  getTodayWorkout, getDaysToRace, getCurrentWeek,
  WORKOUT_COLORS, WORKOUT_ICONS,
} from '../utils/trainingPlan';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeatherData {
  temp: number; feels_like: number; humidity: number;
  wind: number; icon: string; desc: string;
  hourly: { time: string; icon: string; temp: number; pop: number }[];
  forecast: { name: string; icon: string; hi: number; lo: number }[];
}
interface SpotifyData {
  playing: boolean; track: { name: string; artist: string; image: string | null } | null;
  recent: { name: string; artist: string; playedAt: string }[];
}
interface GmailData {
  emails: { id: string; subject: string; from: string; date: string; snippet: string }[];
}
interface CalendarData {
  events: { id: string; title: string; start: string; end: string }[];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const weather  = useApi<WeatherData>(api.weather, 10 * 60 * 1000);
  const spotify  = useApi<SpotifyData>(api.spotify, 30 * 1000);
  const gmail    = useApi<GmailData>(api.gmail, 5 * 60 * 1000);
  const calendar = useApi<CalendarData>(api.calendar, 5 * 60 * 1000);

  const todayWorkout = getTodayWorkout();
  const daysToRace   = getDaysToRace();
  const currentWeek  = getCurrentWeek();

  const refreshing = weather.loading || spotify.loading;
  const onRefresh  = useCallback(() => {
    weather.refresh(); spotify.refresh(); gmail.refresh(); calendar.refresh();
  }, [weather, spotify, gmail, calendar]);

  const now   = new Date();
  const hour  = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
            />
          }
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}, Martin 👋</Text>
              <Text style={styles.dateStr}>
                {now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
              </Text>
            </View>
            {daysToRace > 0 && (
              <View style={styles.raceBadge}>
                <Text style={styles.raceBadgeNum}>{daysToRace}</Text>
                <Text style={styles.raceBadgeLabel}>days</Text>
              </View>
            )}
          </View>

          {/* ── Weather ──────────────────────────────────────────────────── */}
          <GlassCard accent={colors.weather} style={styles.card}>
            <SectionHeader title="Weather · Rajec" accent={colors.weather} />
            {weather.loading && <ActivityIndicator color={colors.weather} style={{ paddingVertical: 20 }} />}
            {weather.error  && <Text style={styles.errorText}>Unable to load weather</Text>}
            {weather.data && (
              <>
                <View style={styles.weatherMain}>
                  <Text style={styles.weatherIcon}>{weather.data.icon}</Text>
                  <View>
                    <Text style={styles.weatherTemp}>{weather.data.temp}°C</Text>
                    <Text style={styles.weatherDesc}>{weather.data.desc}</Text>
                    <Text style={styles.weatherMeta}>
                      Feels {weather.data.feels_like}° · {weather.data.humidity}% · 💨 {weather.data.wind}km/h
                    </Text>
                  </View>
                </View>
                {/* Hourly */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyRow}>
                  {weather.data.hourly.map((h, i) => (
                    <View key={i} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{h.time}</Text>
                      <Text style={styles.hourlyIcon}>{h.icon}</Text>
                      <Text style={styles.hourlyTemp}>{h.temp}°</Text>
                      {h.pop > 20 && <Text style={styles.hourlyPop}>{h.pop}%</Text>}
                    </View>
                  ))}
                </ScrollView>
                {/* 3-day forecast */}
                <View style={styles.forecastRow}>
                  {weather.data.forecast.map((f, i) => (
                    <View key={i} style={styles.forecastItem}>
                      <Text style={styles.forecastDay}>{f.name}</Text>
                      <Text style={styles.forecastIcon}>{f.icon}</Text>
                      <Text style={styles.forecastHi}>{f.hi}°</Text>
                      <Text style={styles.forecastLo}>{f.lo}°</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </GlassCard>

          {/* ── Today's Workout ──────────────────────────────────────────── */}
          {todayWorkout && (
            <GlassCard
              accent={WORKOUT_COLORS[todayWorkout.type]}
              style={styles.card}
              gradient
            >
              <SectionHeader
                title="Today's Training"
                accent={WORKOUT_COLORS[todayWorkout.type]}
                subtitle={`Week ${currentWeek} · ${daysToRace}d to race`}
              />
              <View style={styles.workoutRow}>
                <Text style={styles.workoutIcon}>{WORKOUT_ICONS[todayWorkout.type]}</Text>
                <View style={styles.workoutInfo}>
                  <Text style={[styles.workoutLabel, { color: WORKOUT_COLORS[todayWorkout.type] }]}>
                    {todayWorkout.label}
                  </Text>
                  <Text style={styles.workoutDesc}>{todayWorkout.description}</Text>
                  {todayWorkout.distanceKm > 0 && (
                    <View style={styles.workoutMeta}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>{todayWorkout.distanceKm}km</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>~{todayWorkout.durationMin}min</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              {todayWorkout.tips.slice(0, 2).map((tip, i) => (
                <Text key={i} style={styles.workoutTip}>💡 {tip}</Text>
              ))}
            </GlassCard>
          )}

          {/* ── Calendar ─────────────────────────────────────────────────── */}
          <GlassCard accent={colors.calendar} style={styles.card}>
            <SectionHeader title="Today's Events" accent={colors.calendar} />
            {calendar.loading && <ActivityIndicator color={colors.calendar} style={{ paddingVertical: 12 }} />}
            {calendar.data?.events?.length === 0 && (
              <Text style={styles.emptyText}>No events today — clear schedule ✓</Text>
            )}
            {calendar.data?.events?.slice(0, 4).map(ev => (
              <View key={ev.id} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: colors.calendar }]} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventTime}>
                    {ev.start ? new Date(ev.start).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : 'All day'}
                  </Text>
                </View>
              </View>
            ))}
          </GlassCard>

          {/* ── Gmail ────────────────────────────────────────────────────── */}
          <GlassCard accent={colors.gmail} style={styles.card}>
            <SectionHeader
              title="Inbox"
              accent={colors.gmail}
              subtitle={gmail.data?.emails?.length ? `${gmail.data.emails.length} unread` : undefined}
            />
            {gmail.loading && <ActivityIndicator color={colors.gmail} style={{ paddingVertical: 12 }} />}
            {gmail.data?.emails?.slice(0, 3).map(email => (
              <View key={email.id} style={styles.emailRow}>
                <View style={[styles.emailDot, { backgroundColor: colors.gmail }]} />
                <View style={styles.emailInfo}>
                  <Text style={styles.emailFrom} numberOfLines={1}>{email.from}</Text>
                  <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                </View>
              </View>
            ))}
            {gmail.data?.emails?.length === 0 && (
              <Text style={styles.emptyText}>Inbox zero! 🎉</Text>
            )}
          </GlassCard>

          {/* ── Spotify ──────────────────────────────────────────────────── */}
          <GlassCard accent={colors.spotify} style={styles.card}>
            <SectionHeader title="Spotify" accent={colors.spotify} />
            {spotify.loading && <ActivityIndicator color={colors.spotify} style={{ paddingVertical: 12 }} />}
            {spotify.data && (
              <>
                {spotify.data.playing && spotify.data.track ? (
                  <View style={styles.trackRow}>
                    <Text style={styles.nowPlaying}>▶  Now Playing</Text>
                    <Text style={styles.trackName}>{spotify.data.track.name}</Text>
                    <Text style={styles.trackArtist}>{spotify.data.track.artist}</Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.notPlaying}>Not playing right now</Text>
                    {spotify.data.recent?.slice(0, 2).map((t, i) => (
                      <Text key={i} style={styles.recentTrack}>
                        ↩  {t.name} – {t.artist}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </GlassCard>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1 },
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },

  header:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.lg },
  greeting:     { ...typography.h2, color: colors.textPrimary },
  dateStr:      { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  raceBadge:    { alignItems:'center', backgroundColor:'rgba(0,255,136,0.12)', borderRadius: radius.md, padding: spacing.sm, borderWidth:1, borderColor: colors.fitness },
  raceBadgeNum: { fontSize: 22, fontWeight:'700', color: colors.fitness },
  raceBadgeLabel:{ ...typography.tiny, color: colors.fitness },

  card: { marginBottom: spacing.md },

  // Weather
  weatherMain:  { flexDirection:'row', alignItems:'center', gap: spacing.md, marginBottom: spacing.md },
  weatherIcon:  { fontSize: 52 },
  weatherTemp:  { ...typography.h1, color: colors.textPrimary },
  weatherDesc:  { ...typography.body, color: colors.textSecondary, textTransform:'capitalize', marginTop: 2 },
  weatherMeta:  { ...typography.small, color: colors.textMuted, marginTop: 4 },
  hourlyRow:    { marginBottom: spacing.sm },
  hourlyItem:   { alignItems:'center', marginRight: spacing.md, minWidth: 44 },
  hourlyTime:   { ...typography.tiny, color: colors.textMuted },
  hourlyIcon:   { fontSize: 20, marginVertical: 2 },
  hourlyTemp:   { ...typography.small, color: colors.textPrimary, fontWeight:'600' },
  hourlyPop:    { ...typography.tiny, color: colors.calendar },
  forecastRow:  { flexDirection:'row', justifyContent:'space-between', marginTop: 4 },
  forecastItem: { alignItems:'center', flex:1 },
  forecastDay:  { ...typography.tiny, color: colors.textMuted },
  forecastIcon: { fontSize: 22, marginVertical: 2 },
  forecastHi:   { ...typography.small, color: colors.textPrimary, fontWeight:'600' },
  forecastLo:   { ...typography.tiny, color: colors.textMuted },

  // Workout
  workoutRow:   { flexDirection:'row', gap: spacing.md, marginBottom: spacing.sm },
  workoutIcon:  { fontSize: 36 },
  workoutInfo:  { flex: 1 },
  workoutLabel: { ...typography.h3, marginBottom: 2 },
  workoutDesc:  { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
  workoutMeta:  { flexDirection:'row', gap: spacing.xs, marginTop: 8 },
  metaChip:     { backgroundColor:'rgba(255,255,255,0.08)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  metaChipText: { ...typography.tiny, color: colors.textSecondary },
  workoutTip:   { ...typography.small, color: colors.textMuted, marginTop: 4, paddingLeft: spacing.xs },

  // Calendar
  eventRow:   { flexDirection:'row', alignItems:'center', gap: spacing.sm, marginBottom: spacing.sm },
  eventDot:   { width: 6, height: 6, borderRadius: 3 },
  eventInfo:  { flex: 1 },
  eventTitle: { ...typography.body, color: colors.textPrimary, fontWeight:'500' },
  eventTime:  { ...typography.small, color: colors.textSecondary },

  // Gmail
  emailRow:     { flexDirection:'row', alignItems:'center', gap: spacing.sm, marginBottom: spacing.sm },
  emailDot:     { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  emailInfo:    { flex: 1 },
  emailFrom:    { ...typography.small, color: colors.textSecondary, fontWeight:'600' },
  emailSubject: { ...typography.body, color: colors.textPrimary, fontWeight:'500' },

  // Spotify
  trackRow:    { gap: 2 },
  nowPlaying:  { ...typography.tiny, color: colors.spotify, letterSpacing: 0.5 },
  trackName:   { ...typography.h3, color: colors.textPrimary, marginTop: 4 },
  trackArtist: { ...typography.body, color: colors.textSecondary },
  notPlaying:  { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  recentTrack: { ...typography.small, color: colors.textSecondary, marginTop: 4 },

  emptyText: { ...typography.body, color: colors.textMuted, textAlign:'center', paddingVertical: spacing.sm },
  errorText: { ...typography.small, color: colors.error, paddingVertical: spacing.sm },

  bottomPad: { height: 90 },
});
