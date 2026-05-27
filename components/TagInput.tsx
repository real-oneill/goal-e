import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  color?: string;
}

export default function TagInput({ label, tags, onChange, placeholder, color }: TagInputProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;
  const [text, setText] = useState('');

  function addTag() {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange([...tags, trimmed]);
    }
    setText('');
  }

  function removeTag(tag: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(tags.filter(t => t !== tag));
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: colors.input, backgroundColor: colors.muted }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={addTag}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground }]}
          returnKeyType="done"
        />
        {text.length > 0 && (
          <Pressable onPress={addTag} style={[styles.addBtn, { backgroundColor: accentColor }]}>
            <Ionicons name="add" size={16} color="#fff" />
          </Pressable>
        )}
      </View>
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map(tag => (
            <Pressable
              key={tag}
              onPress={() => removeTag(tag)}
              style={[styles.tag, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}
            >
              <Text style={[styles.tagText, { color: accentColor }]}>{tag}</Text>
              <Ionicons name="close" size={12} color={accentColor} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
