/**
 * 주소 등록 모달 컴포넌트
 * 로그인 후 주소가 없을 때 주소를 등록하는 모달
 */

import { userService } from '@/api/services/user';
import { AddressSearchInput } from '@/components/common/AddressSearchInput';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { Button } from '@/components/common/Button';
import { useAddressSearch } from '@/hooks/address/useAddressSearch';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface AddressRegistrationModalProps {
  open: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const AddressRegistrationModal = ({
  open,
  onComplete,
  onClose,
}: AddressRegistrationModalProps) => {
  const dispatch = useAppDispatch();
  const addressSearch = useAddressSearch();
  const { handleError, handleSuccess } = useErrorHandler();

  const [alias, setAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      // 모달이 닫히면 상태 초기화
      addressSearch.clearSearch();
      addressSearch.setSelectedAddress(null);
      setAlias('');
    }
  }, [open, addressSearch.clearSearch, addressSearch.setSelectedAddress]);

  // 모달 열림/닫힘 시 body 스크롤 방지
  useModalScrollLock(open);

  const handleSave = async () => {
    if (!addressSearch.selectedAddress) {
      handleError('주소를 선택해주세요.', 'AddressRegistration');
      return;
    }

    setIsSaving(true);
    try {
      // 처음 주소 등록이므로 PATCH /user/address 사용 (자동으로 기본주소로 설정됨)
      const addressResult = await userService.setAddress(addressSearch.selectedAddress);
      
      // 별칭이 있으면 주소 리스트를 조회해서 방금 추가된 주소에 별칭 설정
      if (alias.trim()) {
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
            await userService.updateAddress(newAddress.id, { alias: alias.trim() });
          }
        } catch (error) {
          // 별칭 설정 실패해도 주소 저장은 성공한 것으로 처리
        }
      }

      const latitudeValue = addressSearch.selectedAddress.latitude ? parseFloat(addressSearch.selectedAddress.latitude) : null;
      const longitudeValue = addressSearch.selectedAddress.longitude ? parseFloat(addressSearch.selectedAddress.longitude) : null;
      const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
      const normalizedLongitude = longitudeValue !== null && !Number.isNaN(longitudeValue) ? longitudeValue : null;

      dispatch(
        updateUser({
          address: addressResult.roadAddress,
          latitude: normalizedLatitude,
          longitude: normalizedLongitude,
        })
      );

      handleSuccess('주소가 등록되었습니다.');
      onComplete();
    } catch (error: unknown) {
      handleError(error, 'AddressRegistration');
    } finally {
      setIsSaving(false);
    }
  };

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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
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
            <h2 className="text-2xl font-bold text-white">주소 등록</h2>
            <p className="mt-2 text-sm text-slate-400">
              주변 식당 추천을 위해 주소를 등록해주세요
            </p>
          </div>

          {/* 주소 검색 섹션 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">주소 검색</h3>
              <p className="mt-1 text-sm text-slate-400">주소를 검색하여 선택해주세요</p>
            </div>
            <div className="space-y-3">
              <AddressSearchInput
                addressQuery={addressSearch.addressQuery}
                isSearching={addressSearch.isSearching}
                onAddressQueryChange={addressSearch.setAddressQuery}
                onSearch={addressSearch.handleSearch}
              />

              <AddressSearchResults
                searchResults={addressSearch.searchResults}
                isSearching={addressSearch.isSearching}
                hasSearchedAddress={addressSearch.hasSearchedAddress}
                onSelectAddress={addressSearch.handleSelectAddress}
              />

              {addressSearch.selectedAddress && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-200">선택한 주소</p>
                  <p className="mt-1 text-white font-medium">
                    {addressSearch.selectedAddress.roadAddress || addressSearch.selectedAddress.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 별칭 입력 섹션 */}
          {addressSearch.selectedAddress && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">별칭 (선택사항)</h3>
                <p className="mt-1 text-sm text-slate-400">
                  주소를 쉽게 구분하기 위한 별칭을 입력해주세요 (예: 집, 회사)
                </p>
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="별칭을 입력하세요 (예: 집, 회사)"
                maxLength={20}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            {onClose && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
              >
                취소
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!addressSearch.selectedAddress || isSaving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 px-6 text-white shadow-md shadow-orange-500/30"
            >
              등록하기
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

