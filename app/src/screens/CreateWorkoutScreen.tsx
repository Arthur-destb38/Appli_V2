import React from 'react';
import {
  GestureResponderEvent,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { EXERCISE_CATALOG } from '@/data/exercises';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAppTheme } from '@/theme/ThemeProvider';
import { MuscleDiagram } from '@/components/MuscleDiagram';

interface Props {
  workoutId?: number;
}

export const CreateWorkoutScreen: React.FC<Props> = ({ workoutId }) => {
  const { findWorkout, updateTitle, addExercise, removeExercise, updateExercisePlan } = useWorkouts();
  const { theme } = useAppTheme();
  const workout = workoutId ? findWorkout(workoutId) : undefined;
  const sortedExercises = React.useMemo(() => {
    return workout?.exercises.slice().sort((a, b) => a.order_index - b.order_index) ?? [];
  }, [workout?.exercises]);
  const [planDrafts, setPlanDrafts] = React.useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [muscleFilter, setMuscleFilter] = React.useState<string | null>(null);
  const [infoExercise, setInfoExercise] = React.useState<(typeof EXERCISE_CATALOG)[number] | null>(null);

  const catalogById = React.useMemo(() => {
    const map = new Map<string, (typeof EXERCISE_CATALOG)[number]>();
    for (const item of EXERCISE_CATALOG) {
      map.set(item.id, item);
    }
    return map;
  }, []);

  const muscleGroups = React.useMemo(() => {
    const groups = Array.from(new Set(EXERCISE_CATALOG.map((item) => item.muscleGroup)));
    groups.sort();
    return groups;
  }, []);

  const filteredCatalog = React.useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return EXERCISE_CATALOG.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(normalized);
      const matchesMuscle = muscleFilter ? item.muscleGroup === muscleFilter : true;
      return matchesSearch && matchesMuscle;
    });
  }, [searchTerm, muscleFilter]);

  React.useEffect(() => {
    setPlanDrafts((prev) => {
      const ids = new Set(sortedExercises.map((ex) => ex.id));
      const next: Record<number, string> = {};
      for (const id of ids) {
        if (prev[id] !== undefined) {
          next[id] = prev[id];
        }
      }
      return next;
    });
  }, [sortedExercises]);

  if (!workout) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Aucune séance sélectionnée</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Crée une séance depuis l’accueil pour commencer.
        </Text>
      </View>
    );
  }

  const handleTitleChange = (text: string) => {
    updateTitle(workout.workout.id, text);
  };

  const handleAddExercise = async (exerciseId: string) => {
    await addExercise(workout.workout.id, exerciseId);
  };

  const handlePlanChange = (exerciseId: number, text: string) => {
    setPlanDrafts((prev) => ({ ...prev, [exerciseId]: text }));
  };

  const handlePlanSubmit = (exerciseId: number, raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setPlanDrafts((prev) => ({ ...prev, [exerciseId]: '' }));
      updateExercisePlan(exerciseId, null);
      return;
    }
    const value = Number(trimmed);
    if (Number.isNaN(value)) {
      return;
    }
    const normalized = Math.max(0, Math.floor(value));
    setPlanDrafts((prev) => ({ ...prev, [exerciseId]: String(normalized) }));
    updateExercisePlan(exerciseId, normalized);
  };

  const handleSave = () => {
    // Si rien de particulier, on considère que la séance est déjà sauvegardée en local
    // On peut simplement informer l’utilisateur.
    alert('Séance enregistrée.');
  };

  const handleOpenInfo = (exerciseId: string, event?: GestureResponderEvent) => {
    event?.stopPropagation();
    const meta = catalogById.get(exerciseId);
    if (meta) {
      setInfoExercise(meta);
    }
  };

  const handleCloseInfo = () => setInfoExercise(null);

  const isYoutubeUrl = (value: string) => /youtube\.com|youtu\.be/.test(value);

  const handleOpenExternalVideo = () => {
    if (infoExercise?.videoUrl) {
      Linking.openURL(infoExercise.videoUrl).catch(() => null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Nom de la séance</Text>
        <TextInput
          defaultValue={workout.workout.title}
          onChangeText={handleTitleChange}
          placeholder="Titre de la séance"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceMuted,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
            },
          ]}
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Exercices sélectionnés</Text>
        <View
          style={[
            styles.selectedListContainer,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          {sortedExercises.length === 0 ? (
            <Text style={[styles.emptyList, { color: theme.colors.textSecondary }]}>Ajoute un premier exercice.</Text>
          ) : (
            sortedExercises.map((item) => {
              const meta = catalogById.get(item.exercise_id);
              const displayName = meta?.name ?? item.exercise_id;
              return (
                <View
                  key={item.id}
                  style={[styles.selectedCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.selectedInfo}>
                    <Text style={[styles.selectedName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {displayName}
                    </Text>
                    {meta?.muscleGroup || meta?.muscleGroupFr ? (
                      <Text style={[styles.catalogMeta, { color: theme.colors.textSecondary }]}>
                        {meta?.muscleGroupFr ?? meta?.muscleGroup}
                      </Text>
                    ) : null}
                    <View style={styles.planInputRow}>
                      <Text style={[styles.planInputLabel, { color: theme.colors.textSecondary }]}>
                        Séries (optionnel)
                      </Text>
                      <TextInput
                        value={planDrafts[item.id] ?? ''}
                        onChangeText={(text) => handlePlanChange(item.id, text)}
                        onBlur={() => handlePlanSubmit(item.id, planDrafts[item.id] ?? '')}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                        style={[
                          styles.planInput,
                          {
                            borderColor: theme.colors.border,
                            color: theme.colors.textPrimary,
                            backgroundColor: theme.colors.surfaceMuted,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(item.id)}>
                    <Text style={[styles.remove, { color: theme.colors.error }]}>Retirer</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Catalogue d’exercices</Text>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Rechercher un exercice"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.searchInput,
            {
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.muscleRow}
        >
          <TouchableOpacity
            onPress={() => setMuscleFilter(null)}
            style={[
              styles.muscleChip,
              {
                borderColor: muscleFilter ? theme.colors.border : theme.colors.primary,
                backgroundColor: muscleFilter ? theme.colors.surface : theme.colors.primaryMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.muscleChipText,
                { color: muscleFilter ? theme.colors.textPrimary : theme.colors.primary },
              ]}
            >
              Tout
            </Text>
          </TouchableOpacity>
          {muscleGroups.map((group) => {
            const isActive = muscleFilter === group;
            return (
              <TouchableOpacity
                key={group}
                onPress={() => setMuscleFilter(isActive ? null : group)}
                style={[
                  styles.muscleChip,
                  {
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    backgroundColor: isActive ? theme.colors.primaryMuted : theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.muscleChipText,
                    { color: isActive ? theme.colors.primary : theme.colors.textPrimary },
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
            <View
          style={styles.catalogList}
        >
          {filteredCatalog.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.catalogCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleAddExercise(item.id)}
            >
              <View style={styles.catalogRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catalogName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.catalogMeta, { color: theme.colors.textSecondary }]}>
                    {item.muscleGroupFr ?? item.muscleGroup}
                  </Text>
                </View>
                <TouchableOpacity onPress={(event) => handleOpenInfo(item.id, event)} style={styles.infoButton}>
                  <Text style={[styles.infoButtonText, { color: theme.colors.textSecondary }]}>⋮</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {filteredCatalog.length === 0 ? (
            <Text style={[styles.emptyList, { color: theme.colors.textSecondary }]}>Aucun résultat.</Text>
          ) : null}
        </View>
      </View>
      <Modal visible={Boolean(infoExercise)} transparent animationType="fade" onRequestClose={handleCloseInfo}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{infoExercise?.name}</Text>
              <TouchableOpacity onPress={handleCloseInfo}>
                <Text style={[styles.modalClose, { color: theme.colors.textSecondary }]}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalChips}>
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[styles.metaChipText, { color: theme.colors.textPrimary }]}>
                  {infoExercise?.muscleGroupFr ?? infoExercise?.muscleGroup ?? 'Muscles variés'}
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[styles.metaChipText, { color: theme.colors.textPrimary }]}>
                  {infoExercise?.equipmentFr ?? infoExercise?.equipment?.join(', ') ?? 'Matériel libre'}
                </Text>
              </View>
            </View>
            <View style={styles.diagramWrapper}>
              <MuscleDiagram
                muscleGroup={infoExercise?.muscleGroupFr ?? infoExercise?.muscleGroup}
                accentColor={theme.colors.primary}
              />
            </View>
            {infoExercise?.imageUrl ? (
              <Image source={{ uri: infoExercise.imageUrl }} style={styles.modalImage} />
            ) : null}
            {infoExercise?.videoUrl ? (
              <TouchableOpacity
                style={[
                  styles.externalVideoButton,
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceMuted },
                ]}
                onPress={handleOpenExternalVideo}
              >
                <Text style={[styles.externalVideoText, { color: theme.colors.primary }]}>
                  Ouvrir la vidéo
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={[styles.descriptionCard, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Text style={[styles.modalDescription, { color: theme.colors.textPrimary }]}>
                {infoExercise?.descriptionFr ??
                  infoExercise?.cues ??
                  infoExercise?.commonErrors ??
                  'Pas encore de description enregistrée.'}
              </Text>
            </View>
            {infoExercise?.sourceUrl ? (
              <TouchableOpacity
                style={[
                  styles.externalVideoButton,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted },
                ]}
                onPress={() => infoExercise.sourceUrl && Linking.openURL(infoExercise.sourceUrl)}
              >
                <Text style={[styles.externalVideoText, { color: theme.colors.textPrimary }]}>
                  Ouvrir la fiche détaillée
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
      </ScrollView>
    <View style={[styles.footer, { backgroundColor: theme.colors.background }]}> 
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.colors.accent, shadowColor: theme.colors.accent }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>Enregistrer la séance</Text>
        <Text style={[styles.saveButtonCaption, { color: theme.colors.onPrimary }]}>Sauvegarde locale (brouillon)</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionCard: {
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  muscleRow: {
    gap: 8,
    paddingVertical: 8,
  },
  muscleChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  muscleChipText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyList: {
    color: '#6B7280',
    marginVertical: 8,
  },
  catalogList: {
    gap: 8,
    marginTop: 12,
  },
  catalogCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catalogName: {
    fontSize: 16,
    fontWeight: '500',
  },
  catalogMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoButtonText: {
    fontSize: 20,
  },
  selectedListContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    minHeight: 120,
  },
  selectedCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    gap: 12,
  },
  selectedName: {
    fontSize: 16,
    flex: 1,
  },
  selectedInfo: {
    flex: 1,
  },
  remove: {
    color: '#DC2626',
  },
  planInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  planInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  planInputLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  modalMeta: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  modalChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  descriptionCard: {
    padding: 12,
    borderRadius: 12,
  },
  modalClose: {
    fontSize: 15,
  },
  modalVideo: {
    width: '100%',
    height: 0,
  },
  modalImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginTop: 12,
  },
  diagramWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  externalVideoButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  externalVideoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  saveButtonCaption: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.85,
  },
});
