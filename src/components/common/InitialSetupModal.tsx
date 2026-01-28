/**
 * 초기 설정 모달 컴포넌트
 * 로그인 후 필요한 정보(이름, 주소, 취향)를 입력받는 다이얼로그
 */

import { authService } from '@/api/services/auth';
import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { Language } from '@/types/common';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import type { UserSetupStatus } from '@/utils/userSetup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();

  // 이름 관련
  const [name, setName] = useState('');

  // 주소 관련
  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);

  // 취향 관련
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      // 모달이 닫히면 상태 초기화
      setName('');
      setAddressQuery('');
      setSearchResults([]);
      setSelectedAddress(null);
      setAddressAlias('');
      setLikes([]);
      setDislikes([]);
      setNewLike('');
      setNewDislike('');
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
      const language: Language = (i18n.language === 'en' ? 'en' : 'ko');
      const result = await userService.searchAddress(addressQuery, language);
      setSearchResults(result.addresses);
      setHasSearchedAddress(true);
    } catch (error: unknown) {
      console.error('주소 검색 실패:', error);
      alert(extractErrorMessage(error, '주소 검색에 실패했습니다.'));
    } finally {
      setIsSearching(false);
    }
  };

  // 주소 선택
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
    setHasSearchedAddress(false); // 주소 선택 시 검색 상태 리셋
  };

  // 취향 추가/삭제
  const handleAddLike = () => {
    if (newLike.trim() && !likes.includes(newLike.trim())) {
      setLikes([...likes, newLike.trim()]);
      setNewLike('');
    }
  };

  const handleRemoveLike = (item: string) => {
    setLikes(likes.filter((like) => like !== item));
  };

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    setDislikes(dislikes.filter((dislike) => dislike !== item));
  };

  // 모든 정보 한번에 저장
  const handleSaveAll = async () => {
    // 유효성 검사
    if (setupStatus.needsName && !name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (setupStatus.needsAddress && !selectedAddress) {
      alert('주소를 선택해주세요.');
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
      console.error('정보 저장 실패:', error);
      alert(extractErrorMessage(error, '정보 저장에 실패했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  // 필수 정보 입력 완료 체크
  const canSave = 
    (!setupStatus.needsName || name.trim()) &&
    (!setupStatus.needsAddress || selectedAddress !== null) &&
    (!setupStatus.needsPreferences || likes.length > 0 || dislikes.length > 0);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/20 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-md">
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">주소</h3>
                <p className="mt-1 text-sm text-slate-400">주변 식당 추천을 위해 주소를 입력해주세요</p>
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
                  <>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <p className="text-xs text-emerald-200">선택한 주소</p>
                      <p className="mt-1 text-white font-medium">
                        {selectedAddress.roadAddress || selectedAddress.address}
                      </p>
                    </div>

                    {/* 별칭 입력 */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        별칭 (선택사항)
                      </label>
                      <input
                        type="text"
                        value={addressAlias}
                        onChange={(e) => setAddressAlias(e.target.value)}
                        placeholder="별칭을 입력하세요 (예: 집, 회사)"
                        maxLength={20}
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 취향 입력 섹션 */}
          {setupStatus.needsPreferences && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">취향 정보</h3>
                <p className="mt-1 text-sm text-slate-400">좋아하는 음식과 싫어하는 음식을 입력해주세요</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">좋아하는 것</label>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={newLike}
                      onChange={(e) => setNewLike(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddLike();
                        }
                      }}
                      placeholder="좋아하는 음식이나 재료를 입력하세요"
                      className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                    />
                    <Button onClick={handleAddLike} size="md">
                      추가
                    </Button>
                  </div>
                  {likes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {likes.map((like, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                        >
                          {like}
                          <button
                            onClick={() => handleRemoveLike(like)}
                            className="text-green-300 hover:text-green-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">싫어하는 것</label>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={newDislike}
                      onChange={(e) => setNewDislike(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddDislike();
                        }
                      }}
                      placeholder="싫어하는 음식이나 재료를 입력하세요"
                      className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                    />
                    <Button onClick={handleAddDislike} size="md">
                      추가
                    </Button>
                  </div>
                  {dislikes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dislikes.map((dislike, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                        >
                          {dislike}
                          <button
                            onClick={() => handleRemoveDislike(dislike)}
                            className="text-red-300 hover:text-red-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
    </div>
  );
};

