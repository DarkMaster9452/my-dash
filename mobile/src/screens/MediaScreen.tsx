import React, { useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  ActivityIndicator, StatusBar, Image, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import { useApi } from '../hooks/useApi';
import { api } from '../config';
import GlassCard     from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';

interface SpotifyData {
  playing: boolean;
  progress?: number;
  track: {
    name: string; artist: string; album: string;
    image: string | null; url: string; duration: number;
  } | null;
  recent: { name: string; artist: string; album: string; image: string | null; url: string; playedAt: string }[];
}

export default function MediaScreen() {
  const spotify = useApi<SpotifyData>(api.spotify, 15 * 1000);

  const onRefresh = useCallback(() => spotify.refresh(), [spotify]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const progressPct = spotify.data?.playing && spotify.data.track && spotify.data.progress !== undefined
    ? (spotify.data.progress / spotify.data.track.duration) * 100
    : 0;

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={spotify.loading}
              onRefresh={onRefresh}
              tintColor={colors.spotify}
            />
          }
        >
          <Text style={styles.pageTitle}>Media</Text>

          {/* ── Now Playing ──────────────────────────────────────────────── */}
          <GlassCard accent={colors.spotify} gradient style={styles.card}>
            <SectionHeader title="Spotify" accent={colors.spotify} subtitle="Now Playing" />

            {spotify.loading && <ActivityIndicator color={colors.spotify} style={{ paddingVertical: 32 }} />}

            {spotify.data && !spotify.loading && (
              <>
                {spotify.data.playing && spotify.data.track ? (
                  <View style={styles.nowPlayingBlock}>
                    {/* Album art */}
                    {spotify.data.track.image ? (
                      <Image source={{ uri: spotify.data.track.image }} style={styles.albumArt} />
                    ) : (
                      <View style={[styles.albumArt, styles.albumPlaceholder]}>
                        <Ionicons name="musical-notes" size={48} color={colors.textMuted} />
                      </View>
                    )}
                    <Text style={styles.trackName}>{spotify.data.track.name}</Text>
                    <Text style={styles.trackArtist}>{spotify.data.track.artist}</Text>
                    <Text style={styles.trackAlbum}>{spotify.data.track.album}</Text>

                    {/* Progress bar */}
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                    </View>
                    <View style={styles.progressTimes}>
                      <Text style={styles.progressTime}>
                        {spotify.data.progress !== undefined ? formatTime(spotify.data.progress) : '0:00'}
                      </Text>
                      <Text style={styles.progressTime}>{formatTime(spotify.data.track.duration)}</Text>
                    </View>

                    {/* Open in Spotify button */}
                    <TouchableOpacity
                      style={styles.openBtn}
                      onPress={() => Linking.openURL(spotify.data!.track!.url)}
                    >
                      <Ionicons name="logo-google-playstore" size={16} color={colors.spotify} />
                      <Text style={styles.openBtnText}>Open in Spotify</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.notPlayingBlock}>
                    <Ionicons name="pause-circle-outline" size={56} color={colors.textMuted} />
                    <Text style={styles.notPlayingText}>Nothing playing right now</Text>
                  </View>
                )}
              </>
            )}
          </GlassCard>

          {/* ── Recently Played ───────────────────────────────────────────── */}
          {spotify.data?.recent && spotify.data.recent.length > 0 && (
            <GlassCard accent={colors.spotify} style={styles.card}>
              <SectionHeader title="Recently Played" accent={colors.spotify} />
              {spotify.data.recent.map((track, i) => (
                <View key={i} style={styles.recentRow}>
                  {track.image ? (
                    <Image source={{ uri: track.image }} style={styles.recentArt} />
                  ) : (
                    <View style={[styles.recentArt, styles.albumPlaceholder]}>
                      <Ionicons name="musical-note" size={16} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>{track.name}</Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <Text style={styles.recentTime}>
                    {track.playedAt
                      ? new Date(track.playedAt).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
                      : ''}
                  </Text>
                </View>
              ))}
            </GlassCard>
          )}

          {/* ── Running Playlists Tip ─────────────────────────────────────── */}
          <GlassCard accent={colors.fitness} style={styles.card}>
            <SectionHeader title="Run Tip" accent={colors.fitness} />
            <Text style={styles.tipText}>
              🎵 For interval sessions, try 150–170 BPM tracks — they naturally match your stride cadence
              and keep you on pace.
            </Text>
          </GlassCard>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  card: { marginBottom: spacing.md },
  pageTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },

  // Now Playing
  nowPlayingBlock:  { alignItems:'center', paddingTop: spacing.sm },
  albumArt:         { width: 180, height: 180, borderRadius: radius.lg, marginBottom: spacing.md },
  albumPlaceholder: { backgroundColor:'rgba(255,255,255,0.06)', alignItems:'center', justifyContent:'center' },
  trackName:        { ...typography.h2, color: colors.textPrimary, textAlign:'center', marginBottom: 4 },
  trackArtist:      { ...typography.body, color: colors.spotify, fontWeight:'600', textAlign:'center' },
  trackAlbum:       { ...typography.small, color: colors.textMuted, textAlign:'center', marginTop: 2 },
  progressBar:      { width:'100%', height: 3, backgroundColor:'rgba(255,255,255,0.08)', borderRadius:2, marginTop: spacing.md, overflow:'hidden' },
  progressFill:     { height: '100%', backgroundColor: colors.spotify, borderRadius:2 },
  progressTimes:    { flexDirection:'row', justifyContent:'space-between', marginTop: 4 },
  progressTime:     { ...typography.tiny, color: colors.textMuted },
  openBtn:          { flexDirection:'row', alignItems:'center', gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth:1, borderColor: colors.spotify + '60' },
  openBtnText:      { ...typography.small, color: colors.spotify, fontWeight:'600' },

  notPlayingBlock:  { alignItems:'center', paddingVertical: spacing.xl, gap: spacing.sm },
  notPlayingText:   { ...typography.body, color: colors.textMuted },

  // Recent
  recentRow:    { flexDirection:'row', alignItems:'center', gap: spacing.sm, marginBottom: spacing.sm },
  recentArt:    { width: 44, height: 44, borderRadius: radius.sm },
  recentInfo:   { flex: 1 },
  recentName:   { ...typography.body, color: colors.textPrimary, fontWeight:'500' },
  recentArtist: { ...typography.small, color: colors.textSecondary },
  recentTime:   { ...typography.tiny, color: colors.textMuted },

  tipText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  bottomPad: { height: 90 },
});
