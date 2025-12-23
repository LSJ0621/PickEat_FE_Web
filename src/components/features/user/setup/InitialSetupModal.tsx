/**
 * 초기 설정 모달 컴포넌트
 * 로그인 후 필요한 정보(이름, 주소, 취향)를 입력받는 다이얼로그
 */

import { authService } from '@/api/services/auth';
import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { InitialSetupAddressSection } from './InitialSetupAddressSection';
import { InitialSetupPreferencesSection } from './InitialSetupPreferencesSection';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { SelectedAddress } from '@/types/user';
import { isEmpty } from '@/utils/validation';
import { ERROR_MESSAGES } from '@/utils/constants';
import type { UserSetupStatus } from '@/utils/userSetup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface InitialSetupModalProps {
  open: boolean;
  setupStatus: UserSetupStatus;
  onComplete: () => void;
}

export const InitialSetupModal = ({
  open,
  setupStatus,
  onComplete,
}: InitialSetupModalProps) => {
  const dispatch = useAppDispatch();
  const { handleError } = useErrorHandler();

  // 이름 관련
  const [name, setName] = useState('');

  // 주소 관련
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');

  // 취향 관련
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      // 모달이 닫히면 상태 초기화
      setName('');
      setSelectedAddress(null);
      setAddressAlias('');
      setLikes([]);
      setDislikes([]);
    }
  }, [open]);

  // 모달 열림/닫힘 시 body 스크롤 방지
  useModalScrollLock(open);


  // 모든 정보 한번에 저장
  const handleSaveAll = async () => {
    // 유효성 검사
    if (setupStatus.needsName && isEmpty(name)) {
      handleError(ERROR_MESSAGES.NAME_REQUIRED, 'InitialSetupModal');
      return;
    }

    if (setupStatus.needsAddress && !selectedAddress) {
      handleError('주소를 선택해주세요.', 'InitialSetupModal');
      return;
    }

    setIsSaving(true);
    try {
      // 이름 저장 (필요한 경우)
      if (setupStatus.needsName && name.trim()) {
        const nameResult = await authService.updateUser({ name: name.trim() });
        dispatch(updateUser({ name: nameResult.name || name.trim() }));
      }

      // 주소 저장 (필요한 경우)
      if (setupStatus.needsAddress && selectedAddress) {
        const addressResult = await userService.setAddress(selectedAddress);
        
        // 별칭이 있으면 주소 리스트를 조회해서 방금 추가된 주소에 별칭 설정
        if (addressAlias.trim()) {
          try {
            const addressesResponse = await userService.getAddresses();
            // 응답이 배열인지 객체인지 확인
            const addresses = Array.isArray(addressesResponse) 
              ? addressesResponse 
              : addressesResponse?.addresses || [];
            
            const newAddress = addresses.find(
              (addr) => addr.roadAddress === addressResult.roadAddress
            );
            
            if (newAddress) {
              await userService.updateAddress(newAddress.id, { alias: addressAlias.trim() });
            }
          } catch {
            // 별칭 설정 실패해도 주소 저장은 성공한 것으로 처리
          }
        }

        const latitudeValue = selectedAddress.latitude ? parseFloat(selectedAddress.latitude) : null;
        const longitudeValue = selectedAddress.longitude ? parseFloat(selectedAddress.longitude) : null;
        const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
        const normalizedLongitude = longitudeValue !== null && !Number.isNaN(longitudeValue) ? longitudeValue : null;

        dispatch(
          updateUser({
            address: addressResult.roadAddress,
            latitude: normalizedLatitude,
            longitude: normalizedLongitude,
          })
        );
      }

      // 취향 정보 저장 (필요한 경우)
      if (setupStatus.needsPreferences) {
        await userService.setPreferences({
          likes: likes,
          dislikes: dislikes,
        });
        dispatch(updateUser({
          preferences: {
            likes,
            dislikes,
          },
        }));
      }

      // 완료 처리
      onComplete();
    } catch (error: unknown) {
      handleError(error, 'InitialSetupModal');
    } finally {
      setIsSaving(false);
    }
  };

  // 필수 정보 입력 완료 체크
  const canSave = 
    (!setupStatus.needsName || name.trim()) &&
    (!setupStatus.needsAddress || selectedAddress !== null) &&
    (!setupStatus.needsPreferences || likes.length > 0 || dislikes.length > 0);

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/20 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-md ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">서비스 이용을 위한 정보 입력</h2>
            <p className="mt-2 text-sm text-slate-400">
              더 나은 추천을 위해 아래 정보를 입력해주세요
            </p>
          </div>

          {/* 이름 입력 섹션 */}
          {setupStatus.needsName && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">이름</h3>
                <p className="mt-1 text-sm text-slate-400">서비스에서 사용할 이름을 입력해주세요</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
            </div>
          )}

          {/* 주소 입력 섹션 */}
          {setupStatus.needsAddress && (
            <InitialSetupAddressSection
              selectedAddress={selectedAddress}
              addressAlias={addressAlias}
              onAddressChange={setSelectedAddress}
              onAddressAliasChange={setAddressAlias}
            />
          )}

          {/* 취향 입력 섹션 */}
          {setupStatus.needsPreferences && (
            <InitialSetupPreferencesSection
              likes={likes}
              dislikes={dislikes}
              onLikesChange={setLikes}
              onDislikesChange={setDislikes}
            />
          )}

          {/* 저장 버튼 */}
          <div className="pt-4">
            <Button
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={!canSave}
              size="lg"
              className="w-full"
            >
              저장하기
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

