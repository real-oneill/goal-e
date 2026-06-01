import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { WorkoutExercise } from '@/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

interface Props {
  onImport: (exercises: WorkoutExercise[]) => void;
}

export default function WorkoutImageImport({ onImport }: Props) {
  const colors = useColors();
  const accent = colors.workout;
  const [images, setImages] = useState<{ uri: string; base64: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to import workout images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.7,
      selectionLimit: 10,
    });

    if (result.canceled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const picked = result.assets
      .filter(a => a.base64)
      .map(a => ({ uri: a.uri, base64: a.base64! }));
    setImages(prev => [...prev, ...picked].slice(0, 10));
  }

  function removeImage(idx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  async function parseImages() {
    if (images.length === 0) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const b64Images = images.map(img =>
        img.base64.startsWith('data:')
          ? img.base64
          : `data:image/jpeg;base64,${img.base64}`
      );

      const resp = await fetch(`${API_BASE}/api/workout/parse-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: b64Images }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `Server error ${resp.status}`);
      }

      const data = await resp.json();
      if (!data.exercises?.length) {
        Alert.alert('No exercises found', 'Could not detect any exercises in these images. Try clearer screenshots.');
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onImport(data.exercises);
      setImages([]);
      Alert.alert(
        `${data.exercises.length} exercise${data.exercises.length === 1 ? '' : 's'} imported`,
        'Review and adjust them in the exercise list below.',
      );
    } catch (err: any) {
      Alert.alert('Import failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { borderColor: accent + '50', backgroundColor: accent + '08' }]}>
      <View style={styles.headerRow}>
        <Ionicons name="camera-outline" size={16} color={accent} />
        <Text style={[styles.title, { color: accent }]}>Import from photos</Text>
      </View>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        Upload screenshots from any workout app — exercises, sets, reps and weights will be logged automatically.
      </Text>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              <Pressable style={[styles.removeBtn, { backgroundColor: colors.destructive }]} onPress={() => removeImage(i)}>
                <Ionicons name="close" size={10} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.btnRow}>
        <Pressable
          onPress={pickImages}
          disabled={loading || images.length >= 10}
          style={[styles.btn, { borderColor: accent, backgroundColor: accent + '12', opacity: images.length >= 10 ? 0.4 : 1 }]}
        >
          <Ionicons name="images-outline" size={16} color={accent} />
          <Text style={[styles.btnText, { color: accent }]}>
            {images.length === 0 ? 'Choose photos' : `Add more (${images.length}/10)`}
          </Text>
        </Pressable>

        {images.length > 0 && (
          <Pressable
            onPress={parseImages}
            disabled={loading}
            style={[styles.btn, styles.importBtn, { backgroundColor: accent }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={16} color="#fff" />
                <Text style={[styles.btnText, { color: '#fff' }]}>Log exercises</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  thumbRow: {
    flexDirection: 'row',
  },
  thumbWrap: {
    position: 'relative',
    marginRight: 8,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderStyle: 'dashed',
  },
  importBtn: {
    borderStyle: 'solid',
    borderWidth: 0,
    flex: 1,
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});
