import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { PolicyView } from './PolicyView';
import Constants from 'expo-constants';
import { deleteAccount } from '@/services/authService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type PolicyModalType = 'privacy' | 'terms' | null;

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { user, logout } = useAuth();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [policyType, setPolicyType] = useState<PolicyModalType>(null);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onClose();
            } catch (error) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n\n• 팀 멤버십 및 생성한 팀\n• 공과금, 루틴, 물품 기록\n• 채팅 및 알림 기록\n\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '계속',
          style: 'destructive',
          onPress: () => {
            // 비밀번호 입력 프롬프트
            Alert.prompt(
              '비밀번호 확인',
              '계정 삭제를 위해 비밀번호를 입력해주세요.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: async (password) => {
                    if (!password || password.trim().length === 0) {
                      Alert.alert('오류', '비밀번호를 입력해주세요.');
                      return;
                    }

                    try {
                      await deleteAccount(password);
                      Alert.alert(
                        '계정 삭제 완료',
                        '계정이 성공적으로 삭제되었습니다.',
                        [{ text: '확인', onPress: () => onClose() }]
                      );
                    } catch (error: any) {
                      Alert.alert('오류', error.message || '계정 삭제에 실패했습니다.');
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ]
    );
  };

  const handleOpenPolicy = (type: 'privacy' | 'terms') => {
    setPolicyType(type);
    setPolicyModalVisible(true);
  };

  const handleClosePolicy = () => {
    setPolicyModalVisible(false);
    setPolicyType(null);
  };

  const handleClose = () => {
    setShowNotificationSettings(false);
    onClose();
  };

  // 알림 설정 상세 화면
  if (showNotificationSettings) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <NotificationSettingsScreen onBack={() => setShowNotificationSettings(false)} />
      </Modal>
    );
  }

  // 메인 설정 화면
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 프로필 섹션 */}
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={60} color={Colors.light.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              </View>
            </View>
          </View>

          {/* 알림 설정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알림</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowNotificationSettings(true)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>알림 설정</Text>
                <Text style={styles.menuDescription}>알림 수신 여부 및 상세 설정</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          {/* 법적 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>법적 정보</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOpenPolicy('privacy')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>개인정보 처리방침</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
            </TouchableOpacity>

            <View style={{ height: 8 }} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOpenPolicy('terms')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="document-text-outline" size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>서비스 이용약관</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          {/* 앱 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 정보</Text>
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="information-circle-outline" size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>버전</Text>
              </View>
              <Text style={styles.versionText}>{appVersion}</Text>
            </View>
          </View>

          {/* 계정 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.errorColor + '20' }]}>
                <Ionicons name="log-out-outline" size={24} color={Colors.light.errorColor} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: Colors.light.errorColor }]}>로그아웃</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 8 }} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.errorColor + '20' }]}>
                <Ionicons name="trash-outline" size={24} color={Colors.light.errorColor} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: Colors.light.errorColor }]}>계정 삭제</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 정책 뷰 모달 */}
      <Modal
        visible={policyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePolicy}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClosePolicy} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {policyType === 'privacy' ? '개인정보 처리방침' : '서비스 이용약관'}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          {policyType && <PolicyView type={policyType} />}
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.light.mutedText,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.mutedText,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
});
