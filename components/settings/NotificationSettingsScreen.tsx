import React from 'react';
import { StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

export function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const { preferences, updatePreference, resetPreferences } = useNotificationPreferences();

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color={Colors.light.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderSettingItem = (
    label: string,
    description: string,
    key: keyof typeof preferences,
    disabled: boolean = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, disabled && styles.textDisabled]}>{label}</Text>
        <Text style={[styles.settingDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={preferences[key] as boolean}
        onValueChange={(value) => updatePreference(key, value)}
        trackColor={{ false: Colors.light.mutedText, true: Colors.light.primary }}
        thumbColor="#FFFFFF"
        disabled={disabled}
      />
    </View>
  );

  const allNotificationsDisabled = !preferences.enabled;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 전체 알림 설정 */}
        {renderSection('전체 알림', 'notifications', (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>모든 알림 받기</Text>
              <Text style={styles.settingDescription}>
                알림을 끄면 모든 알림을 받지 않습니다
              </Text>
            </View>
            <Switch
              value={preferences.enabled}
              onValueChange={(value) => updatePreference('enabled', value)}
              trackColor={{ false: Colors.light.mutedText, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

        {/* 카테고리별 알림 설정 */}
        {renderSection('카테고리별 알림', 'apps', (
          <>
            {renderSettingItem(
              '루틴 알림',
              '루틴 완료, 지연 등의 알림',
              'routines',
              allNotificationsDisabled
            )}
            {renderSettingItem(
              '공과금 알림',
              '공과금 등록, 납부 등의 알림',
              'bills',
              allNotificationsDisabled
            )}
            {renderSettingItem(
              '물품 알림',
              '물품 요청, 구매, 재고 등의 알림',
              'items',
              allNotificationsDisabled
            )}
            {renderSettingItem(
              '채팅 알림',
              '새 메시지 알림',
              'chat',
              allNotificationsDisabled
            )}
            {renderSettingItem(
              '투표 알림',
              '투표 생성, 종료 등의 알림',
              'polls',
              allNotificationsDisabled
            )}
            {renderSettingItem(
              '시스템 알림',
              '공지사항 및 시스템 알림',
              'system',
              allNotificationsDisabled
            )}
          </>
        ))}

        {/* 루틴 알림 상세 */}
        {renderSection('루틴 알림 상세', 'calendar', (
          <>
            {renderSettingItem(
              '루틴 완료 알림',
              '팀원이 루틴을 완료했을 때',
              'routine_completed',
              allNotificationsDisabled || !preferences.routines
            )}
            {renderSettingItem(
              '루틴 지연 알림',
              '루틴이 지연되었을 때',
              'routine_overdue',
              allNotificationsDisabled || !preferences.routines
            )}
          </>
        ))}

        {/* 공과금 알림 상세 */}
        {renderSection('공과금 알림 상세', 'calculator', (
          <>
            {renderSettingItem(
              '공과금 등록 알림',
              '새 공과금이 등록되었을 때',
              'bill_added',
              allNotificationsDisabled || !preferences.bills
            )}
            {renderSettingItem(
              '납부 마감 알림',
              '공과금 납부 마감일이 다가올 때',
              'bill_payment_due',
              allNotificationsDisabled || !preferences.bills
            )}
            {renderSettingItem(
              '납부 완료 알림',
              '팀원이 공과금을 납부했을 때',
              'payment_received',
              allNotificationsDisabled || !preferences.bills
            )}
          </>
        ))}

        {/* 물품 알림 상세 */}
        {renderSection('물품 알림 상세', 'cart', (
          <>
            {renderSettingItem(
              '구매 요청 알림',
              '새 구매 요청이 등록되었을 때',
              'item_request',
              allNotificationsDisabled || !preferences.items
            )}
            {renderSettingItem(
              '구매 완료 알림',
              '요청한 물품이 구매되었을 때',
              'item_purchased',
              allNotificationsDisabled || !preferences.items
            )}
            {renderSettingItem(
              '물품 상태 알림',
              '물품 수량이 변경되었을 때',
              'item_update',
              allNotificationsDisabled || !preferences.items
            )}
          </>
        ))}

        {/* 투표 알림 상세 */}
        {renderSection('투표 알림 상세', 'stats-chart', (
          <>
            {renderSettingItem(
              '투표 생성 알림',
              '새 투표가 생성되었을 때',
              'poll_created',
              allNotificationsDisabled || !preferences.polls
            )}
            {renderSettingItem(
              '투표 종료 알림',
              '투표가 종료되었을 때',
              'poll_ended',
              allNotificationsDisabled || !preferences.polls
            )}
          </>
        ))}

        {/* 채팅 & 시스템 알림 상세 */}
        {renderSection('기타 알림 상세', 'ellipsis-horizontal', (
          <>
            {renderSettingItem(
              '채팅 메시지 알림',
              '새 채팅 메시지가 도착했을 때',
              'chat_message',
              allNotificationsDisabled || !preferences.chat
            )}
            {renderSettingItem(
              '공지사항 알림',
              '새 공지사항이 등록되었을 때',
              'announcement',
              allNotificationsDisabled || !preferences.system
            )}
          </>
        ))}

        {/* 초기화 버튼 */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetPreferences}
        >
          <Ionicons name="refresh" size={20} color={Colors.light.errorColor} />
          <Text style={styles.resetButtonText}>알림 설정 초기화</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            알림 설정은 이 기기에만 적용됩니다
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.light.mutedText,
  },
  textDisabled: {
    color: Colors.light.mutedText,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.errorColor,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.errorColor,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: 'center',
  },
});
