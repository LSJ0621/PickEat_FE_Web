/**
 * 주소 등록 모달 컴포넌트
 * 로그인 후 주소가 없을 때 주소를 등록하는 모달
 */

import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { useEffect, useState } from 'react';

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

  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [alias, setAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);

  useEffect(() => {
    if (!open) {
      // 모달이 닫히면 상태 초기화
      setAddressQuery('');
      setSearchResults([]);
      setSelectedAddress(null);
      setAlias('');
      setHasSearchedAddress(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫히면 스크롤 복원
      document.body.style.overflow = '';
    }

    return () => {
      // 컴포넌트 언마운트 시 스크롤 복원
      document.body.style.overflow = '';
    };
  }, [open]);

  // 주소 검색
  const handleSearch = async () => {
    if (!addressQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearchedAddress(false);
    try {
      const result = await userService.searchAddress(addressQuery);
      setSearchResults(result.addresses);
      setHasSearchedAddress(true);
    } catch (error: unknown) {
      console.error('주소 검색 실패:', error);
      alert(extractErrorMessage(error, '주소 검색에 실패했습니다.'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (address: AddressSearchResult) => {
    setSelectedAddress({
      address: address.address,
      roadAddress: address.roadAddress,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setAddressQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedAddress) {
      alert('주소를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // 처음 주소 등록이므로 PATCH /user/address 사용 (자동으로 기본주소로 설정됨)
      const addressResult = await userService.setAddress(selectedAddress);
      
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
          console.error('별칭 설정 실패:', error);
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

      onComplete();
    } catch (error: unknown) {
      console.error('주소 저장 실패:', error);
      alert(extractErrorMessage(error, '주소 저장에 실패했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/20 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-md">
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSearching) {
                      handleSearch();
                    }
                  }}
                  placeholder="주소를 검색하세요"
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                />
                <Button onClick={handleSearch} isLoading={isSearching} size="md">
                  검색
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/50 p-4">
                  {searchResults.map((address, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAddress(address)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-white transition hover:bg-white/10"
                    >
                      <p className="font-medium">{address.roadAddress || address.address}</p>
                      {address.roadAddress && (
                        <p className="mt-1 text-xs text-slate-400">{address.address}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && hasSearchedAddress && searchResults.length === 0 && !selectedAddress && (
                <p className="text-sm text-slate-400">주소를 찾을 수 없습니다.</p>
              )}

              {selectedAddress && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-200">선택한 주소</p>
                  <p className="mt-1 text-white font-medium">
                    {selectedAddress.roadAddress || selectedAddress.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 별칭 입력 섹션 */}
          {selectedAddress && (
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
              disabled={!selectedAddress || isSaving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 px-6 text-white shadow-md shadow-orange-500/30"
            >
              등록하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

