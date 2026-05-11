import React, { useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  ActivityIndicator, StatusBar, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import { useApi } from '../hooks/useApi';
import { api } from '../config';
import GlassCard     from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';

interface NotionTask {
  id: string; title: string; status: string | null;
  priority: string | null; project: string | null; url: string;
}
interface NotionData {
  tasks: NotionTask[];
  projects: { id: string; title: string; status: string | null; url: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  'Done':        colors.success,
  'In Progress': colors.calendar,
  'Not started': colors.textMuted,
  'Blocked':     colors.error,
  'Review':      colors.warning,
};

const PRIORITY_COLORS: Record<string, string> = {
  'High':   colors.error,
  'Medium': colors.warning,
  'Low':    colors.textMuted,
};

export default function TasksScreen() {
  const notion = useApi<NotionData>(api.notion, 5 * 60 * 1000);
  const calendar = useApi<{ events: { id:string; title:string; start:string; end:string }[] }>(api.calendar, 5 * 60 * 1000);

  const onRefresh = useCallback(() => { notion.refresh(); calendar.refresh(); }, [notion, calendar]);

  const todoTasks = notion.data?.tasks?.filter(t =>
    t.status !== 'Done' && t.status !== 'Cancelled'
  ) ?? [];

  const inProgress = todoTasks.filter(t => t.status === 'In Progress');
  const todo       = todoTasks.filter(t => t.status !== 'In Progress');

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={notion.loading || calendar.loading}
              onRefresh={onRefresh}
              tintColor={colors.notion}
            />
          }
        >
          <Text style={styles.pageTitle}>Tasks & Events</Text>

          {/* ── Today's calendar events ──────────────────────────────────── */}
          <GlassCard accent={colors.calendar} style={styles.card}>
            <SectionHeader title="Today's Schedule" accent={colors.calendar} />
            {calendar.loading && <ActivityIndicator color={colors.calendar} style={{ paddingVertical: 16 }} />}
            {calendar.data?.events?.length === 0 && (
              <View style={styles.emptyBlock}>
                <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>Free day!</Text>
              </View>
            )}
            {calendar.data?.events?.map(ev => {
              const start = ev.start ? new Date(ev.start) : null;
              const end   = ev.end   ? new Date(ev.end)   : null;
              const now   = new Date();
              const isNow = start && end && start <= now && now <= end;
              return (
                <View key={ev.id} style={[styles.eventRow, isNow && styles.eventRowActive]}>
                  {isNow && <View style={[styles.activeBar, { backgroundColor: colors.calendar }]} />}
                  <View style={styles.eventTimeBlock}>
                    <Text style={styles.eventTime}>
                      {start?.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) ?? 'All day'}
                    </Text>
                    {end && <Text style={styles.eventTimeEnd}>
                      {end.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
                    </Text>}
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTitle, isNow && { color: colors.calendar }]}>{ev.title}</Text>
                    {isNow && <Text style={styles.nowLabel}>● Happening now</Text>}
                  </View>
                </View>
              );
            })}
          </GlassCard>

          {/* ── Notion: In Progress ──────────────────────────────────────── */}
          {inProgress.length > 0 && (
            <GlassCard accent={colors.notion} gradient style={styles.card}>
              <SectionHeader title="In Progress" accent={colors.notion} subtitle={`${inProgress.length} tasks`} />
              {inProgress.map(task => <TaskRow key={task.id} task={task} />)}
            </GlassCard>
          )}

          {/* ── Notion: To Do ────────────────────────────────────────────── */}
          <GlassCard accent={colors.notion} style={styles.card}>
            <SectionHeader
              title="Notion Tasks"
              accent={colors.notion}
              subtitle={todoTasks.length > 0 ? `${todoTasks.length} open` : undefined}
            />
            {notion.loading && <ActivityIndicator color={colors.notion} style={{ paddingVertical: 16 }} />}
            {notion.error && <Text style={styles.errorText}>Failed to load tasks</Text>}
            {notion.data && todoTasks.length === 0 && (
              <View style={styles.emptyBlock}>
                <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.notion} />
                <Text style={styles.emptyText}>All caught up! 🎉</Text>
              </View>
            )}
            {todo.slice(0, 8).map(task => <TaskRow key={task.id} task={task} />)}
          </GlassCard>

          {/* ── Notion: Projects ─────────────────────────────────────────── */}
          {notion.data?.projects && notion.data.projects.length > 0 && (
            <GlassCard accent={colors.notion} style={styles.card}>
              <SectionHeader title="Projects" accent={colors.notion} />
              {notion.data.projects.slice(0, 5).map(p => (
                <View key={p.id} style={styles.projectRow}>
                  <View style={[styles.projectDot, { backgroundColor: STATUS_COLORS[p.status ?? ''] ?? colors.textMuted }]} />
                  <Text style={styles.projectName}>{p.title}</Text>
                  {p.status && (
                    <Text style={[styles.projectStatus, { color: STATUS_COLORS[p.status] ?? colors.textMuted }]}>
                      {p.status}
                    </Text>
                  )}
                </View>
              ))}
            </GlassCard>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function TaskRow({ task }: { task: NotionTask }) {
  const statusColor   = STATUS_COLORS[task.status ?? '']   ?? colors.textMuted;
  const priorityColor = PRIORITY_COLORS[task.priority ?? ''] ?? colors.textMuted;

  return (
    <View style={styles.taskRow}>
      <View style={[styles.taskStatusDot, { backgroundColor: statusColor }]} />
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
        <View style={styles.taskMeta}>
          {task.project && <Text style={styles.taskProject}>{task.project}</Text>}
          {task.priority && (
            <Text style={[styles.taskPriority, { color: priorityColor }]}>
              {task.priority}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  card: { marginBottom: spacing.md },
  pageTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  errorText: { ...typography.small, color: colors.error },

  // Events
  eventRow:       { flexDirection:'row', gap: spacing.sm, marginBottom: spacing.md, paddingLeft: 4 },
  eventRowActive: { backgroundColor:'rgba(66,133,244,0.08)', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  activeBar:      { position:'absolute', left: 0, top: 4, bottom: 4, width: 3, borderRadius:2 },
  eventTimeBlock: { minWidth: 46 },
  eventTime:      { ...typography.small, color: colors.textPrimary, fontWeight:'600' },
  eventTimeEnd:   { ...typography.tiny, color: colors.textMuted },
  eventContent:   { flex: 1 },
  eventTitle:     { ...typography.body, color: colors.textPrimary, fontWeight:'500' },
  nowLabel:       { ...typography.tiny, color: colors.calendar, marginTop: 2 },

  // Tasks
  taskRow:       { flexDirection:'row', gap: spacing.sm, alignItems:'flex-start', marginBottom: spacing.sm, paddingVertical: 2 },
  taskStatusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  taskContent:   { flex: 1 },
  taskTitle:     { ...typography.body, color: colors.textPrimary, fontWeight:'500', lineHeight: 20 },
  taskMeta:      { flexDirection:'row', gap: spacing.sm, marginTop: 2 },
  taskProject:   { ...typography.tiny, color: colors.textMuted },
  taskPriority:  { ...typography.tiny, fontWeight:'600' },

  // Projects
  projectRow:    { flexDirection:'row', alignItems:'center', gap: spacing.sm, marginBottom: spacing.sm },
  projectDot:    { width: 8, height: 8, borderRadius: 4 },
  projectName:   { ...typography.body, color: colors.textPrimary, flex:1 },
  projectStatus: { ...typography.tiny, fontWeight:'600' },

  emptyBlock: { alignItems:'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyText:  { ...typography.body, color: colors.textMuted },
  bottomPad: { height: 90 },
});
