import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useFeed } from '@/hooks/useFeed';
import { useAppTheme } from '@/theme/ThemeProvider';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { fetchStories } from '@/services/storiesApi';

const FeedScreen: React.FC = () => {
  const { items, load, nextCursor, isLoading, error, toggleFollow, duplicate } = useFeed();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [currentStory, setCurrentStory] = useState<any | null>(null);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  useEffect(() => {
    const fallbackStories = [
      {
        id: 'st-fb-1',
        title: 'Recette post-workout',
        username: 'CoachBot',
        avatar:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80',
        media:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        link: 'https://www.allrecipes.com/recipe/24074/black-bean-and-corn-salad-ii/',
      },
      {
        id: 'st-fb-2',
        title: 'Routine mobilité',
        username: 'CoachBot',
        avatar:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=200&q=80',
        media:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        link: 'https://www.youtube.com/results?search_query=mobility+routine',
      },
      {
        id: 'st-fb-3',
        title: 'Astuce récup',
        username: 'CoachBot',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        media:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        link: 'https://www.healthline.com/nutrition/post-workout-recovery',
      },
    ];

    setLoadingStories(true);
    fetchStories()
      .then((data) => {
        const mapped = (data || []).map((s) => ({
          id: String(s.id),
          title: s.title,
          username: s.owner_username,
          avatar: s.media_url,
          media: s.media_url,
          link: s.link,
        }));
        setStories(mapped.length ? mapped : fallbackStories);
      })
      .catch(() => {
        setStories(fallbackStories);
      })
      .finally(() => setLoadingStories(false));
  }, []);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Lien indisponible', "Impossible d'ouvrir ce lien.");
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Lien indisponible', "Impossible d'ouvrir ce lien.");
    }
  };

  const openStory = (story: any) => {
    setCurrentStory(story);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setCurrentStory(null);
      }
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrentStory(null), 5000);
  };

  useEffect(() => {
    load(true).catch(() => undefined);
  }, [load]);

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}
          onPress={() => router.push(`/profile/${item.owner_id || item.owner_username}`)}
        >
          <Text style={[styles.avatarInitials, { color: theme.colors.textPrimary }]}>
            {item.owner_username.slice(0, 2).toUpperCase()}
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.username, { color: theme.colors.textPrimary }]}>{item.owner_username}</Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </Text>
        </View>
        <TouchableOpacity style={styles.followPill} onPress={() => toggleFollow(item.owner_id, false)}>
          <Text style={styles.followText}>Abonné</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {item.workout_title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {item.exercise_count} exos · {item.set_count} séries
        </Text>
        <TouchableOpacity style={styles.duplicateButton} onPress={() => duplicate(item.share_id)}>
          <Text style={styles.duplicateText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Réseau</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Les séances récentes de tes abonnements
        </Text>
      </View>
      {loadingStories ? (
        <View style={styles.storyLoader}>
          <ActivityIndicator />
        </View>
      ) : (
        <StoriesCarousel stories={stories} onOpen={openStory} />
      )}
      {isLoading && !items.length ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.share_id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            nextCursor ? (
              <TouchableOpacity style={styles.loadMore} onPress={() => load(false)}>
                <Text>Charger plus</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Modal visible={!!currentStory} transparent animationType="fade" onRequestClose={() => setCurrentStory(null)}>
        <TouchableWithoutFeedback onPress={() => setCurrentStory(null)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        {currentStory && (
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: theme.colors.accent,
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <Text style={[styles.storyTitle, { color: theme.colors.textPrimary }]}>{currentStory.title}</Text>
            <Text style={[styles.storySubtitle, { color: theme.colors.textSecondary }]}>
              {currentStory.username}
            </Text>
            <View style={styles.storyMedia}>
              <Text style={{ color: theme.colors.textSecondary }}>Image/vidéo : {currentStory.media}</Text>
            </View>
            <TouchableOpacity
              style={[styles.storyCta, { backgroundColor: theme.colors.accent }]}
              onPress={() => currentStory?.link && openLink(currentStory.link)}
            >
              <Text style={styles.storyCtaText}>Voir la recette / astuce</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 3,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontWeight: '600',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  followPill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 14,
  },
  duplicateButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  duplicateText: {
    color: 'white',
    fontWeight: '600',
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#00000088',
  },
  modalContent: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 4,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  storySubtitle: {
    fontSize: 14,
  },
  storyMedia: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    padding: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCta: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  storyCtaText: {
    color: '#fff',
    fontWeight: '700',
  },
  storyLoader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadMore: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  error: {
    textAlign: 'center',
    padding: 16,
  },
});
