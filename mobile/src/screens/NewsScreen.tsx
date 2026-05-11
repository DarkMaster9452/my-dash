import React, { useCallback, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  ActivityIndicator, StatusBar, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import { useApi } from '../hooks/useApi';
import { api } from '../config';
import GlassCard     from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';

interface NewsItem {
  title: string; link: string; pubDate: string;
  source: string; description: string;
}
interface NewsData {
  world: NewsItem[];
  ai:    NewsItem[];
  tech:  NewsItem[];
}

type NewsTab = 'world' | 'ai' | 'tech';

const TAB_LABELS: Record<NewsTab, { label: string; icon: string }> = {
  world: { label: 'World',  icon: '🌍' },
  ai:    { label: 'AI',     icon: '🤖' },
  tech:  { label: 'Tech',   icon: '💻' },
};

export default function NewsScreen() {
  const news = useApi<NewsData>(api.news, 15 * 60 * 1000);
  const [activeTab, setActiveTab] = useState<NewsTab>('world');

  const onRefresh = useCallback(() => news.refresh(), [news]);

  const articles = news.data?.[activeTab] ?? [];

  const formatDate = (str: string) => {
    try {
      return new Date(str).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
    } catch { return str; }
  };

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={news.loading}
              onRefresh={onRefresh}
              tintColor={colors.news}
            />
          }
        >
          <Text style={styles.pageTitle}>News</Text>

          {/* ── Category tabs ─────────────────────────────────────────────── */}
          <View style={styles.tabs}>
            {(Object.keys(TAB_LABELS) as NewsTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text style={styles.tabEmoji}>{TAB_LABELS[tab].icon}</Text>
                <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                  {TAB_LABELS[tab].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Articles ─────────────────────────────────────────────────── */}
          <GlassCard accent={colors.news} style={styles.card}>
            <SectionHeader title={TAB_LABELS[activeTab].label} accent={colors.news} />
            {news.loading && <ActivityIndicator color={colors.news} style={{ paddingVertical: 24 }} />}
            {news.error && (
              <View style={styles.errorBlock}>
                <Ionicons name="wifi-outline" size={32} color={colors.textMuted} />
                <Text style={styles.errorText}>Could not load news</Text>
              </View>
            )}
            {articles.map((article, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.articleRow, i > 0 && styles.articleBorder]}
                onPress={() => Linking.openURL(article.link).catch(() => {})}
                activeOpacity={0.7}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={3}>
                    {article.title}
                  </Text>
                  {article.description ? (
                    <Text style={styles.articleDesc} numberOfLines={2}>
                      {article.description.replace(/<[^>]+>/g, '').trim()}
                    </Text>
                  ) : null}
                  <View style={styles.articleMeta}>
                    <Text style={styles.articleSource}>{article.source}</Text>
                    {article.pubDate && (
                      <Text style={styles.articleDate}>{formatDate(article.pubDate)}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.articleChevron} />
              </TouchableOpacity>
            ))}
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

  tabs:       { flexDirection:'row', gap: spacing.sm, marginBottom: spacing.md },
  tab:        { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 6, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth:1, borderColor:colors.border, backgroundColor:'rgba(255,255,255,0.04)' },
  tabActive:  { backgroundColor: colors.news + '20', borderColor: colors.news },
  tabEmoji:   { fontSize: 16 },
  tabLabel:   { ...typography.small, color: colors.textMuted, fontWeight:'600' },
  tabLabelActive: { color: colors.news },

  articleRow:     { paddingVertical: spacing.md, flexDirection:'row', alignItems:'flex-start' },
  articleBorder:  { borderTopWidth:1, borderTopColor: colors.border },
  articleContent: { flex: 1 },
  articleTitle:   { ...typography.body, color: colors.textPrimary, fontWeight:'600', lineHeight: 21 },
  articleDesc:    { ...typography.small, color: colors.textSecondary, lineHeight: 18, marginTop: 4 },
  articleMeta:    { flexDirection:'row', justifyContent:'space-between', marginTop: 6 },
  articleSource:  { ...typography.tiny, color: colors.news, fontWeight:'600' },
  articleDate:    { ...typography.tiny, color: colors.textMuted },
  articleChevron: { marginLeft: spacing.xs, marginTop: 2 },

  errorBlock: { alignItems:'center', paddingVertical: spacing.xl, gap: spacing.sm },
  errorText:  { ...typography.body, color: colors.textMuted },
  bottomPad: { height: 90 },
});
