import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import * as itemService from '@/services/itemService';
import {
  useItemsQuery,
  usePurchaseRequestsQuery,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCreatePurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useMarkAsPurchased,
  useDeletePurchaseRequest,
} from './useItemsQuery';

export type { Item, PurchaseRequest } from '@/services/itemService';

interface NewItemData {
  name: string;
  description?: string;
  category: 'food' | 'household' | 'cleaning' | 'toiletries' | 'other';
  currentQuantity: number;
  minQuantity: number;
  unit?: string;
  estimatedPrice?: number;
  preferredStore?: string;
}

interface NewPurchaseRequestData {
  itemId?: string;
  itemName?: string;
  quantity: number;
  urgency: 'urgent' | 'normal' | 'low';
  notes?: string;
  estimatedPrice?: number;
  preferredStore?: string;
}

export function useItemsFirebase() {
  const { user } = useAuth();
  const { currentTeam } = useTeam();

  // TanStack Query hooks
  const { data: items = [], isLoading: itemsLoading } = useItemsQuery(currentTeam?.id);
  const { data: purchaseRequests = [], isLoading: requestsLoading } = usePurchaseRequestsQuery(currentTeam?.id);

  // Mutation hooks
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();
  const createPurchaseRequestMutation = useCreatePurchaseRequest();
  const approvePurchaseRequestMutation = useApprovePurchaseRequest();
  const rejectPurchaseRequestMutation = useRejectPurchaseRequest();
  const markAsPurchasedMutation = useMarkAsPurchased();
  const deletePurchaseRequestMutation = useDeletePurchaseRequest();

  /**
   * 아이템 추가
   */
  const addNewItem = useCallback(
    async (newItem: NewItemData): Promise<boolean> => {
      console.log('🚀 [Hook] addNewItem 시작');
      console.log('🚀 [Hook] currentTeam:', currentTeam);
      console.log('🚀 [Hook] user:', user);

      if (!currentTeam?.id || !user?.id) {
        console.error('❌ [Hook] 로그인 정보 없음');
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        return false;
      }

      // 유효성 검사
      if (!newItem.name.trim()) {
        Alert.alert('오류', '아이템 이름을 입력해주세요.');
        return false;
      }

      if (newItem.currentQuantity < 0) {
        Alert.alert('오류', '현재 수량은 0 이상이어야 합니다.');
        return false;
      }

      if (newItem.minQuantity < 0) {
        Alert.alert('오류', '최소 수량은 0 이상이어야 합니다.');
        return false;
      }

      if (newItem.estimatedPrice !== undefined && newItem.estimatedPrice < 0) {
        Alert.alert('오류', '예상 가격은 0 이상이어야 합니다.');
        return false;
      }

      try {
        const itemData = {
          team_id: currentTeam.id,
          name: newItem.name.trim(),
          description: newItem.description?.trim(),
          category: newItem.category,
          current_quantity: newItem.currentQuantity,
          min_quantity: newItem.minQuantity,
          unit: newItem.unit?.trim() || '개',
          estimated_price: newItem.estimatedPrice,
          preferred_store: newItem.preferredStore?.trim(),
          created_by: user.id,
        };

        console.log('📤 [Hook] Mutation 시작:', itemData);
        await createItemMutation.mutateAsync(itemData);
        console.log('✅ [Hook] Mutation 성공');

        Alert.alert('성공', '아이템이 추가되었습니다.');
        return true;
      } catch (error: any) {
        console.error('❌ [Hook] Mutation 실패:', error);
        Alert.alert('오류', error.message || '아이템 추가에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, user?.id, createItemMutation]
  );

  /**
   * 아이템 수정
   */
  const updateItem = useCallback(
    async (itemId: string, updates: Partial<NewItemData>): Promise<boolean> => {
      if (!currentTeam?.id) {
        Alert.alert('오류', '팀 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        const updateData: any = {};

        if (updates.name !== undefined) updateData.name = updates.name.trim();
        if (updates.description !== undefined) updateData.description = updates.description.trim();
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.currentQuantity !== undefined) updateData.current_quantity = updates.currentQuantity;
        if (updates.minQuantity !== undefined) updateData.min_quantity = updates.minQuantity;
        if (updates.unit !== undefined) updateData.unit = updates.unit.trim();
        if (updates.estimatedPrice !== undefined) updateData.estimated_price = updates.estimatedPrice;
        if (updates.preferredStore !== undefined) updateData.preferred_store = updates.preferredStore.trim();

        await updateItemMutation.mutateAsync({
          itemId,
          updates: updateData,
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '아이템이 수정되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '아이템 수정에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, updateItemMutation]
  );

  /**
   * 아이템 삭제
   */
  const deleteItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!currentTeam?.id) {
        Alert.alert('오류', '팀 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        await deleteItemMutation.mutateAsync({
          itemId,
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '아이템이 삭제되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '아이템 삭제에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, deleteItemMutation]
  );

  /**
   * 구매 요청 생성
   */
  const addPurchaseRequest = useCallback(
    async (request: NewPurchaseRequestData): Promise<boolean> => {
      if (!currentTeam?.id || !user?.id) {
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        return false;
      }

      // 유효성 검사
      if (!request.itemId && !request.itemName) {
        Alert.alert('오류', '아이템을 선택하거나 이름을 입력해주세요.');
        return false;
      }

      if (request.quantity <= 0) {
        Alert.alert('오류', '수량은 1 이상이어야 합니다.');
        return false;
      }

      if (request.estimatedPrice !== undefined && request.estimatedPrice < 0) {
        Alert.alert('오류', '예상 가격은 0 이상이어야 합니다.');
        return false;
      }

      try {
        await createPurchaseRequestMutation.mutateAsync({
          team_id: currentTeam.id,
          item_id: request.itemId,
          item_name: request.itemName?.trim(),
          requested_by: user.id,
          requested_by_name: user.name || user.email || '사용자',
          quantity: request.quantity,
          urgency: request.urgency,
          notes: request.notes?.trim(),
          estimated_price: request.estimatedPrice,
          preferred_store: request.preferredStore?.trim(),
        });

        Alert.alert('성공', '구매 요청이 생성되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '구매 요청 생성에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, user, createPurchaseRequestMutation]
  );

  /**
   * 구매 요청 승인
   */
  const approvePurchaseRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!currentTeam?.id || !user?.id) {
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        await approvePurchaseRequestMutation.mutateAsync({
          requestId,
          approvedBy: user.id,
          approvedByName: user.name || user.email || '사용자',
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '구매 요청이 승인되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '구매 요청 승인에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, user, approvePurchaseRequestMutation]
  );

  /**
   * 구매 요청 거절
   */
  const rejectPurchaseRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!currentTeam?.id) {
        Alert.alert('오류', '팀 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        await rejectPurchaseRequestMutation.mutateAsync({
          requestId,
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '구매 요청이 거절되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '구매 요청 거절에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, rejectPurchaseRequestMutation]
  );

  /**
   * 구매 완료 처리
   */
  const markAsPurchased = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!currentTeam?.id || !user?.id) {
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        await markAsPurchasedMutation.mutateAsync({
          requestId,
          purchasedBy: user.id,
          purchasedByName: user.name || user.email || '사용자',
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '구매가 완료되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '구매 완료 처리에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, user, markAsPurchasedMutation]
  );

  /**
   * 구매 요청 삭제
   */
  const deletePurchaseRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!currentTeam?.id) {
        Alert.alert('오류', '팀 정보를 찾을 수 없습니다.');
        return false;
      }

      try {
        await deletePurchaseRequestMutation.mutateAsync({
          requestId,
          teamId: currentTeam.id,
        });

        Alert.alert('성공', '구매 요청이 삭제되었습니다.');
        return true;
      } catch (error: any) {
        Alert.alert('오류', error.message || '구매 요청 삭제에 실패했습니다.');
        return false;
      }
    },
    [currentTeam?.id, deletePurchaseRequestMutation]
  );

  /**
   * 재고 부족 아이템 필터
   */
  const lowStockItems = items.filter(
    (item) => item.current_quantity <= item.min_quantity
  );

  /**
   * 상태별 구매 요청 필터
   */
  const pendingRequests = purchaseRequests.filter((req) => req.status === 'pending');
  const approvedRequests = purchaseRequests.filter((req) => req.status === 'approved');
  const purchasedRequests = purchaseRequests.filter((req) => req.status === 'purchased');

  return {
    // Data
    items,
    purchaseRequests,
    lowStockItems,
    pendingRequests,
    approvedRequests,
    purchasedRequests,

    // Loading states
    isLoading: itemsLoading || requestsLoading,
    itemsLoading,
    requestsLoading,

    // Item operations
    addNewItem,
    updateItem,
    deleteItem,

    // Purchase request operations
    addPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    markAsPurchased,
    deletePurchaseRequest,
  };
}
