import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTeam } from '@/contexts/TeamContext';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface TeamSelectionScreenProps {
  onTeamSelected?: () => void;
}

export default function TeamSelectionScreen({ onTeamSelected }: TeamSelectionScreenProps) {
  const { userTeams, isLoading, createTeam, joinTeam } = useTeam();
  const [selectedMode, setSelectedMode] = useState<'create' | 'join' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // 팀 생성 폼 상태
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  // 팀 참가 폼 상태
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('알림', '팀 이름을 입력해주세요.');
      return;
    }

    try {
      setIsCreating(true);
      await createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });
      
      Alert.alert('성공', '팀이 생성되었습니다!', [
        {
          text: '확인',
          onPress: () => onTeamSelected?.(),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '팀 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('알림', '초대 코드를 입력해주세요.');
      return;
    }

    try {
      setIsJoining(true);
      await joinTeam({ inviteCode: inviteCode.trim() });
      
      Alert.alert('성공', '팀에 참가했습니다!', [
        {
          text: '확인',
          onPress: () => onTeamSelected?.(),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '팀 참가에 실패했습니다. 초대 코드를 확인해주세요.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetForm = () => {
    setSelectedMode(null);
    setNewTeamName('');
    setNewTeamDescription('');
    setInviteCode('');
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={Colors.light.gradientPrimary}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Colors.light.gradientPrimary}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Roomie</Text>
          <Text style={styles.subtitle}>룸메이트와 함께하는 즐거운 생활</Text>
        </View>

        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          {selectedMode === null ? (
            // 초기 선택 화면
            <View style={styles.selectionContainer}>
              <View style={styles.welcomeSection}>
                <Ionicons name="people" size={80} color={Colors.light.mutedText} />
                <Text style={styles.welcomeTitle}>팀에 참가하세요</Text>
                <Text style={styles.welcomeSubtitle}>
                  룸메이트들과 함께 살림을 관리해보세요{'\n'}새로운 팀을 만들거나 기존 팀에 참가할 수 있습니다
                </Text>
              </View>

              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setSelectedMode('create')}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name="add-circle" size={32} color={Colors.light.primary} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>새 팀 만들기</Text>
                    <Text style={styles.optionDescription}>
                      새로운 팀을 만들고 초대 코드를 공유해서{'\n'}룸메이트들을 초대하세요
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setSelectedMode('join')}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name="enter" size={32} color={Colors.light.primary} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>팀에 참가하기</Text>
                    <Text style={styles.optionDescription}>
                      룸메이트에게 받은 초대 코드를 입력해서{'\n'}기존 팀에 참가하세요
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
                </TouchableOpacity>
              </View>
            </View>
          ) : selectedMode === 'create' ? (
            // 팀 만들기 폼
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={resetForm}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.formTitle}>새 팀 만들기</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>팀 이름 *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="우리 집"
                    value={newTeamName}
                    onChangeText={setNewTeamName}
                    maxLength={50}
                    placeholderTextColor={Colors.light.placeholderText}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>팀 설명 (선택사항)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="팀에 대한 간단한 설명을 입력해주세요"
                    value={newTeamDescription}
                    onChangeText={setNewTeamDescription}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    placeholderTextColor={Colors.light.placeholderText}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, isCreating && styles.disabledButton]}
                  onPress={handleCreateTeam}
                  disabled={isCreating}
                  activeOpacity={0.8}
                >
                  {isCreating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="add" size={20} color="white" />
                      <Text style={styles.actionButtonText}>팀 만들기</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // 팀 참가 폼
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={resetForm}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.formTitle}>팀에 참가하기</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.form}>
                <View style={styles.codeSection}>
                  <Ionicons name="qr-code" size={64} color={Colors.light.mutedText} />
                  <Text style={styles.codeTitle}>초대 코드를 입력하세요</Text>
                  <Text style={styles.codeSubtitle}>
                    팀장에게 받은 초대 코드를 입력해주세요
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>초대 코드</Text>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="ABC123"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="characters"
                    maxLength={20}
                    placeholderTextColor={Colors.light.placeholderText}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, isJoining && styles.disabledButton]}
                  onPress={handleJoinTeam}
                  disabled={isJoining}
                  activeOpacity={0.8}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="enter" size={20} color="white" />
                      <Text style={styles.actionButtonText}>팀 참가하기</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  selectionContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedText,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.mutedText,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
    gap: 24,
  },
  codeSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  codeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  codeSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: Colors.light.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 18,
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
});