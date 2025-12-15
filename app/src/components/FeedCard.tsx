import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/theme/ThemeProvider';
import { LikeButton, DoubleTapHeart } from './LikeButton';
import { toggleLike } from '@/services/likesApi';

interface CommentPreview {
  id: string;
  username: string;
  content: string;
}

interface FeedCardProps {
  shareId: string;
  ownerId: string;
  ownerUsername: string;
  workoutTitle: string;
  exerciseCount: number;
  setCount: number;
  createdAt: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  currentUserId: string;
  comments?: CommentPreview[];
  commentCount?: number;
  onProfilePress?: () => void;
  onDuplicate?: () => void;
  onCommentPress?: () => void;
  onHide?: (shareId: string) => void;
  onReport?: (shareId: string) => void;
  onWorkoutPress?: (shareId: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  shareId,
  ownerId,
  ownerUsername,
  workoutTitle,
  exerciseCount,
  setCount,
  createdAt,
  initialLiked = false,
  initialLikeCount = 0,
  currentUserId,
  comments = [],
  commentCount = 0,
  onProfilePress,
  onDuplicate,
  onCommentPress,
  onHide,
  onReport,
  onWorkoutPress,
}) => {
  const { theme } = useAppTheme();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [menuVisible, setMenuVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  // Gestion du double-tap
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap détecté!
      if (!liked) {
        handleLike();
        setShowDoubleTapHeart(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
    lastTapRef.current = now;
  }, [liked]);

  const handleLike = async () => {
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await toggleLike(shareId, currentUserId);
      setLiked(response.liked);
      setLikeCount(response.like_count);
    } catch (error) {
      // Rollback on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleHide = () => {
    setMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setHidden(true);
    onHide?.(shareId);
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert(
      '🚨 Signaler ce post',
      'Pourquoi signales-tu ce post ?',
      [
        { text: 'Contenu inapproprié', onPress: () => submitReport('inappropriate') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Harcèlement', onPress: () => submitReport('harassment') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const submitReport = (reason: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('✅ Merci', 'Ton signalement a été envoyé. Nous allons examiner ce post.');
    onReport?.(shareId);
  };

  // Si le post est masqué, ne pas l'afficher
  if (hidden) {
    return null;
  }

  return (
    <Pressable onPress={handleDoubleTap}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            transform: [{ scale: cardScaleAnim }],
          },
        ]}
      >
        {/* Double tap heart animation */}
        <DoubleTapHeart
          visible={showDoubleTapHeart}
          onAnimationEnd={() => setShowDoubleTapHeart(false)}
        />

        {/* Header - Avatar & Username */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={onProfilePress}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.accent }]}>
                {ownerUsername.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.username, { color: theme.colors.textPrimary }]}>
                {ownerUsername}
              </Text>
              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                {formattedDate}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleReport}
              >
                <Ionicons name="flag-outline" size={22} color="#FF6B6B" />
                <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Signaler</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={handleHide}
              >
                <Ionicons name="eye-off-outline" size={22} color={theme.colors.textPrimary} />
                <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>Masquer</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close-outline" size={22} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.textSecondary }]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Content - Workout preview (cliquable) */}
        <TouchableOpacity 
          style={[styles.workoutPreview, { backgroundColor: theme.colors.surfaceMuted }]}
          onPress={() => onWorkoutPress?.(shareId)}
          activeOpacity={0.7}
        >
          <View style={styles.workoutIcon}>
            <Ionicons name="barbell" size={32} color={theme.colors.accent} />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={[styles.workoutTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
              {workoutTitle}
            </Text>
            <View style={styles.workoutStats}>
              <View style={styles.stat}>
                <Ionicons name="fitness" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  {exerciseCount} exercices
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="layers" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  {setCount} séries
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Actions - Like, Comment, Save */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <LikeButton liked={liked} likeCount={likeCount} onToggle={handleLike} />
            <TouchableOpacity style={styles.commentButton} onPress={onCommentPress}>
              <Ionicons name="chatbubble-outline" size={22} color={theme.colors.textSecondary} />
              {commentCount > 0 && (
                <Text style={[styles.commentCountText, { color: theme.colors.textSecondary }]}>
                  {commentCount}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.accent }]}
            onPress={onDuplicate}
          >
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        {/* Like count text */}
        {likeCount > 0 && (
          <Text style={[styles.likeCountText, { color: theme.colors.textPrimary }]}>
            {likeCount} J'aime{likeCount > 1 ? 's' : ''}
          </Text>
        )}

        {/* Caption */}
        <View style={styles.caption}>
          <Text style={{ color: theme.colors.textPrimary }}>
            <Text style={styles.captionUsername}>{ownerUsername}</Text>
            {' '}a partagé sa séance 💪
          </Text>
        </View>

        {/* Comments preview */}
        {comments.length > 0 && (
          <View style={styles.commentsPreview}>
            {comments.slice(0, 2).map((comment) => (
              <View key={comment.id} style={styles.commentPreviewItem}>
                <Text style={{ color: theme.colors.textPrimary }} numberOfLines={2}>
                  <Text style={styles.commentPreviewUsername}>{comment.username}</Text>
                  {' '}{comment.content}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* View all comments link */}
        <TouchableOpacity onPress={onCommentPress} style={styles.viewCommentsBtn}>
          {commentCount > 0 ? (
            <Text style={[styles.viewComments, { color: theme.colors.textSecondary }]}>
              Voir les {commentCount} commentaire{commentCount > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={[styles.viewComments, { color: theme.colors.textSecondary }]}>
              Ajouter un commentaire...
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 280,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  workoutPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  workoutIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    gap: 6,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  commentCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  likeCountText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  caption: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  captionUsername: {
    fontWeight: '700',
  },
  commentsPreview: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  commentPreviewItem: {
    flexDirection: 'row',
  },
  commentPreviewUsername: {
    fontWeight: '700',
  },
  viewCommentsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  viewComments: {
    fontSize: 13,
  },
});


