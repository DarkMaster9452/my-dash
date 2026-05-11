import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import GlassCard     from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';
import {
  TRAINING_PLAN, getTodayWorkout, getDaysToRace,
  getCompletedWorkouts, getCurrentWeek, getWeekSummary,
  getTotalKmPlanned, WORKOUT_COLORS, WORKOUT_ICONS,
  Workout, WorkoutType,
} from '../utils/trainingPlan';

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ progress, size, color }: { progress: number; size: number; color: string }) {
  const r  = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress, 1);
  return (
    <View style={{ width: size, height: size, alignItems:'center', justifyContent:'center' }}>
      {/* Background circle drawn with a border */}
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 4, borderColor: 'rgba(255,255,255,0.06)',
        position:'absolute',
      }} />
      {/* Filled arc approximation using gradient clipping trick */}
      <View style={{
        width: size - 8, height: size - 8, borderRadius: (size - 8) / 2,
        borderWidth: 4,
        borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: progress > 0.25 ? color : 'transparent',
        borderBottomColor: progress > 0.5  ? color : 'transparent',
        borderLeftColor:   progress > 0.75 ? color : 'transparent',
        position:'absolute',
        transform: [{ rotate: '-45deg' }],
      }} />
    </View>
  );
}

// ── Workout Card ──────────────────────────────────────────────────────────────
function WorkoutCard({ workout, isToday }: { workout: Workout; isToday: boolean }) {
  const [expanded, setExpanded] = useState(isToday);
  const isPast = workout.date < new Date().toISOString().slice(0, 10);
  const accentColor = WORKOUT_COLORS[workout.type];

  return (
    <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
      <GlassCard
        accent={isToday ? accentColor : undefined}
        style={[styles.workoutCard, isPast && styles.pastCard]}
        padding={spacing.sm + 4}
      >
        {/* Row */}
        <View style={styles.wcRow}>
          <Text style={styles.wcIcon}>{WORKOUT_ICONS[workout.type]}</Text>
          <View style={styles.wcInfo}>
            <View style={styles.wcTitleRow}>
              <Text style={[styles.wcLabel, { color: isToday ? accentColor : (isPast ? colors.textMuted : colors.textSecondary) }]}>
                {workout.label}
              </Text>
              {isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>TODAY</Text></View>}
              {isPast && workout.type !== 'rest' && <Ionicons name="checkmark-circle" size={16} color={colors.textMuted} />}
            </View>
            <Text style={styles.wcDate}>
              {new Date(workout.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })}
            </Text>
            {workout.distanceKm > 0 && (
              <Text style={[styles.wcMeta, { color: isToday ? accentColor : colors.textMuted }]}>
                {workout.distanceKm}km · ~{workout.durationMin}min
              </Text>
            )}
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>

        {expanded && (
          <View style={styles.wcExpanded}>
            <Text style={styles.wcDesc}>{workout.description}</Text>
            {workout.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function FitnessScreen() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek() || 1);

  const daysToRace     = getDaysToRace();
  const todayWorkout   = getTodayWorkout();
  const completedRuns  = getCompletedWorkouts();
  const totalRuns      = TRAINING_PLAN.filter(w => w.type !== 'rest' && w.type !== 'cross').length;
  const progressPct    = completedRuns / totalRuns;
  const totalKm        = getTotalKmPlanned();
  const weekSummary    = getWeekSummary(selectedWeek);
  const today          = new Date().toISOString().slice(0, 10);

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <GlassCard accent={colors.fitness} style={styles.card} gradient>
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>10km RACE</Text>
                <Text style={styles.heroTitle}>June 13, 2026</Text>
                <Text style={styles.heroLocation}>📍 Rajec, Slovakia</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeNum}>{daysToRace}</Text>
                  <Text style={styles.heroBadgeLabel}> days to go</Text>
                </View>
              </View>

              {/* Progress ring */}
              <View style={styles.ringWrap}>
                <ProgressRing progress={progressPct} size={96} color={colors.fitness} />
                <View style={styles.ringCenter}>
                  <Text style={styles.ringPct}>{Math.round(progressPct * 100)}%</Text>
                  <Text style={styles.ringLabel}>done</Text>
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { label:'Runs done',  value: String(completedRuns),              unit: `/${totalRuns}` },
                { label:'Total km',   value: String(Math.round(totalKm)),         unit: 'km plan'  },
                { label:'Week',       value: String(getCurrentWeek() || '-'),      unit: 'of 5'     },
              ].map((s, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statValue}>{s.value}<Text style={styles.statUnit}>{s.unit}</Text></Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* ── Today's session ──────────────────────────────────────────── */}
          {todayWorkout && (
            <GlassCard accent={WORKOUT_COLORS[todayWorkout.type]} style={styles.card} gradient>
              <SectionHeader title="Today's Session" accent={WORKOUT_COLORS[todayWorkout.type]} />
              <View style={styles.todayHero}>
                <Text style={styles.todayIcon}>{WORKOUT_ICONS[todayWorkout.type]}</Text>
                <View style={styles.todayContent}>
                  <Text style={[styles.todayLabel, { color: WORKOUT_COLORS[todayWorkout.type] }]}>
                    {todayWorkout.label}
                  </Text>
                  <Text style={styles.todayDesc}>{todayWorkout.description}</Text>
                  {todayWorkout.distanceKm > 0 && (
                    <View style={styles.todayMetaRow}>
                      <View style={[styles.metaChip, { borderColor: WORKOUT_COLORS[todayWorkout.type] + '40' }]}>
                        <Text style={[styles.metaChipText, { color: WORKOUT_COLORS[todayWorkout.type] }]}>
                          {todayWorkout.distanceKm} km
                        </Text>
                      </View>
                      <View style={[styles.metaChip, { borderColor: WORKOUT_COLORS[todayWorkout.type] + '40' }]}>
                        <Text style={[styles.metaChipText, { color: WORKOUT_COLORS[todayWorkout.type] }]}>
                          ~{todayWorkout.durationMin} min
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.tipsBox}>
                {todayWorkout.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={[styles.tipDot, { color: WORKOUT_COLORS[todayWorkout.type] }]}>▸</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}

          {/* ── Week selector + plan ──────────────────────────────────────── */}
          <GlassCard style={styles.card}>
            <SectionHeader title="Training Plan" accent={colors.fitness} subtitle="5-week program" />

            {/* Week tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekTabs}>
              {[1, 2, 3, 4, 5].map(w => (
                <TouchableOpacity
                  key={w}
                  onPress={() => setSelectedWeek(w)}
                  style={[
                    styles.weekTab,
                    selectedWeek === w && { backgroundColor: colors.fitness + '25', borderColor: colors.fitness },
                  ]}
                >
                  <Text style={[styles.weekTabText, selectedWeek === w && { color: colors.fitness }]}>
                    Week {w}
                  </Text>
                  {w === getCurrentWeek() && (
                    <View style={[styles.weekCurrent, { backgroundColor: colors.fitness }]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Week summary */}
            <View style={styles.weekSummary}>
              <Text style={styles.weekSummaryText}>
                {weekSummary.totalKm > 0
                  ? `${weekSummary.runs} runs · ${weekSummary.totalKm}km · ${weekSummary.restDays} rest days`
                  : 'Race week — taper and go!'}
              </Text>
            </View>

            {/* Workouts for selected week */}
            {TRAINING_PLAN.filter(w => w.week === selectedWeek).map((workout) => (
              <WorkoutCard
                key={workout.date}
                workout={workout}
                isToday={workout.date === today}
              />
            ))}
          </GlassCard>

          {/* ── Motivation ───────────────────────────────────────────────── */}
          <GlassCard accent="#ffd700" style={styles.card}>
            <Text style={styles.motivationIcon}>🏅</Text>
            <Text style={styles.motivationText}>
              {daysToRace <= 3
                ? "Race week! Taper, trust your training, and go get it."
                : daysToRace <= 7
                ? "Final push! The hay is in the barn — now you sharpen."
                : daysToRace <= 14
                ? "You're in the quality phase now. This is where champions are made."
                : "Consistency beats intensity. Every easy run builds your aerobic engine."}
            </Text>
          </GlassCard>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  card: { marginBottom: spacing.md },

  // Hero
  heroRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.md },
  heroLeft:   { flex: 1 },
  heroLabel:  { ...typography.label, color: colors.fitness },
  heroTitle:  { ...typography.h2, color: colors.textPrimary, marginTop: 2 },
  heroLocation:{ ...typography.small, color: colors.textSecondary, marginTop: 4 },
  heroBadge:  { flexDirection:'row', alignItems:'baseline', marginTop: 8 },
  heroBadgeNum:{ fontSize: 32, fontWeight:'800', color: colors.fitness },
  heroBadgeLabel:{ ...typography.body, color: colors.textSecondary },

  ringWrap:   { position:'relative', alignItems:'center', justifyContent:'center' },
  ringCenter: { position:'absolute', alignItems:'center' },
  ringPct:    { fontSize: 20, fontWeight:'700', color: colors.textPrimary },
  ringLabel:  { ...typography.tiny, color: colors.textMuted },

  statsRow:   { flexDirection:'row', justifyContent:'space-between', borderTopWidth:1, borderTopColor:colors.border, paddingTop: spacing.md },
  statItem:   { alignItems:'center', flex:1 },
  statValue:  { fontSize: 22, fontWeight:'700', color: colors.textPrimary },
  statUnit:   { fontSize: 12, fontWeight:'400', color: colors.textMuted },
  statLabel:  { ...typography.tiny, color: colors.textMuted, marginTop: 2 },

  // Today
  todayHero:    { flexDirection:'row', gap: spacing.md, marginBottom: spacing.sm },
  todayIcon:    { fontSize: 44 },
  todayContent: { flex: 1 },
  todayLabel:   { ...typography.h3, fontWeight:'700' },
  todayDesc:    { ...typography.small, color: colors.textSecondary, lineHeight: 18, marginTop: 4 },
  todayMetaRow: { flexDirection:'row', gap: spacing.xs, marginTop: 8 },
  metaChip:     { borderWidth:1, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  metaChipText: { ...typography.tiny },
  tipsBox:      { backgroundColor:'rgba(255,255,255,0.04)', borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.sm },
  tipRow:       { flexDirection:'row', gap: spacing.xs, marginBottom: 4 },
  tipDot:       { color: colors.textMuted, fontWeight:'700' },
  tipText:      { ...typography.small, color: colors.textSecondary, flex:1, lineHeight: 18 },

  // Week tabs
  weekTabs:      { marginBottom: spacing.sm },
  weekTab:       { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.xs, borderRadius: radius.full, borderWidth:1, borderColor: colors.border, position:'relative' },
  weekTabText:   { ...typography.small, color: colors.textMuted, fontWeight:'600' },
  weekCurrent:   { position:'absolute', bottom: 2, right: 2, width: 5, height: 5, borderRadius: 3 },
  weekSummary:   { marginBottom: spacing.sm },
  weekSummaryText:{ ...typography.small, color: colors.textSecondary },

  // Workout cards
  workoutCard:   { marginBottom: spacing.xs },
  pastCard:      { opacity: 0.6 },
  wcRow:         { flexDirection:'row', alignItems:'center', gap: spacing.sm },
  wcIcon:        { fontSize: 24, width: 32, textAlign:'center' },
  wcInfo:        { flex: 1 },
  wcTitleRow:    { flexDirection:'row', alignItems:'center', gap: spacing.xs },
  wcLabel:       { ...typography.body, fontWeight:'600' },
  todayBadge:    { backgroundColor: colors.fitness + '30', borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  todayBadgeText:{ ...typography.tiny, color: colors.fitness },
  wcDate:        { ...typography.tiny, color: colors.textMuted, marginTop: 1 },
  wcMeta:        { ...typography.tiny, marginTop: 2 },
  wcExpanded:    { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth:1, borderTopColor:colors.border },
  wcDesc:        { ...typography.small, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.xs },

  // Motivation
  motivationIcon: { fontSize: 28, marginBottom: spacing.sm },
  motivationText: { ...typography.body, color: colors.textSecondary, lineHeight: 22, fontStyle:'italic' },

  bottomPad: { height: 90 },
});
