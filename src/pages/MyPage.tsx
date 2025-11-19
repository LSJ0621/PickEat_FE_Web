/**
 * 마이페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/common/AppHeader';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { extractErrorMessage } from '@/utils/error';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';

export const MyPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();
  const currentAddress = user?.address ?? null;

  // 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // 주소 관련 state
  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 취향 정보 관련 state
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPreferences();
  }, [isAuthenticated, navigate]);

  const loadPreferences = async () => {
    setIsLoadingPreferences(true);
    try {
      const result = await userService.getPreferences();
      setLikes(result.preferences.likes || []);
      setDislikes(result.preferences.dislikes || []);
    } catch (error: unknown) {
      console.error('취향 정보 조회 실패:', error);
      // 취향 정보가 없을 수도 있으므로 에러는 무시
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const handleSearch = async () => {
    if (!addressQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const result = await userService.searchAddress(addressQuery);
      setSearchResults(result.addresses);
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

  const handleSaveAddress = async () => {
    if (!selectedAddress) {
      alert('주소를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await userService.setAddress(selectedAddress);
      const latitudeValue = selectedAddress.latitude ? parseFloat(selectedAddress.latitude) : null;
      const longitudeValue = selectedAddress.longitude ? parseFloat(selectedAddress.longitude) : null;
      const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
      const normalizedLongitude = longitudeValue !== null && !Number.isNaN(longitudeValue) ? longitudeValue : null;

      // Redux 상태도 업데이트
      dispatch(updateUser({
        address: result.address,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
      }));

      alert('주소가 저장되었습니다.');
      setSelectedAddress(null);
      setShowAddressModal(false);
    } catch (error: unknown) {
      console.error('주소 저장 실패:', error);
      alert(extractErrorMessage(error, '주소 저장에 실패했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  // 취향 정보 관련 함수들
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

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      await userService.setPreferences({
        likes: likes.length > 0 ? likes : undefined,
        dislikes: dislikes.length > 0 ? dislikes : undefined,
      });
      alert('취향 정보가 저장되었습니다.');
      setShowPreferencesModal(false);
      loadPreferences(); // 취향 정보 다시 로드
    } catch (error: unknown) {
      console.error('취향 정보 저장 실패:', error);
      alert(extractErrorMessage(error, '취향 정보 저장에 실패했습니다.'));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleOpenPreferencesModal = () => {
    loadPreferences(); // 모달 열 때 최신 정보 로드
    setShowPreferencesModal(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">마이페이지</h1>
          </div>

        <div className="space-y-4">
          {/* 이름 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">이름</p>
                <p className="mt-1 text-lg font-semibold text-white">{user?.name || '이름 없음'}</p>
              </div>
            </div>
          </div>

          {/* 이메일 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">이메일</p>
                <p className="mt-1 text-lg font-semibold text-white">{user?.email || '이메일 없음'}</p>
              </div>
            </div>
          </div>

          {/* 취향 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400">취향</p>
                {isLoadingPreferences ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-orange-500"></div>
                    <span className="text-slate-400">로딩 중...</span>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {likes.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-slate-400">좋아하는 것</p>
                        <div className="flex flex-wrap gap-2">
                          {likes.map((like, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                            >
                              {like}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dislikes.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-slate-400">싫어하는 것</p>
                        <div className="flex flex-wrap gap-2">
                          {dislikes.map((dislike, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                            >
                              {dislike}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {likes.length === 0 && dislikes.length === 0 && (
                      <p className="text-slate-400">설정된 취향이 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleOpenPreferencesModal}
                variant="ghost"
                size="sm"
                className="ml-4"
              >
                취향 수정
              </Button>
            </div>
          </div>

          {/* 주소 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400">주소</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {currentAddress || '설정된 주소가 없습니다.'}
                </p>
              </div>
              <Button
                onClick={() => setShowAddressModal(true)}
                variant="ghost"
                size="sm"
                className="ml-4"
              >
                주소 수정
              </Button>
            </div>
          </div>
        </div>

        {/* 주소 수정 모달 */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setAddressQuery('');
                  setSearchResults([]);
                  setSelectedAddress(null);
                }}
                className="absolute right-6 top-6 text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="mb-6 text-2xl font-bold text-white">주소 수정</h2>

              {currentAddress && (
                <div className="mb-4 rounded-xl border border-white/10 bg-slate-800/50 p-4">
                  <p className="text-sm text-slate-400">현재 주소</p>
                  <p className="mt-1 text-white">{currentAddress}</p>
                </div>
              )}

              <div className="space-y-4">
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
                  <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/50 p-4">
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

                {selectedAddress && (
                  <div className="rounded-xl border border-orange-500/50 bg-orange-500/10 p-4">
                    <p className="mb-2 text-sm font-medium text-orange-200">선택한 주소</p>
                    <p className="text-white">{selectedAddress.roadAddress || selectedAddress.address}</p>
                    {selectedAddress.roadAddress && (
                      <p className="mt-1 text-xs text-slate-400">{selectedAddress.address}</p>
                    )}
                    <Button
                      onClick={handleSaveAddress}
                      isLoading={isSaving}
                      size="md"
                      className="mt-4"
                    >
                      주소 저장
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 취향 수정 모달 */}
        {showPreferencesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
              <button
                onClick={() => {
                  setShowPreferencesModal(false);
                  setNewLike('');
                  setNewDislike('');
                }}
                className="absolute right-6 top-6 text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="mb-6 text-2xl font-bold text-white">취향 수정</h2>

              <div className="space-y-6">
                {/* 좋아하는 것 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-200">좋아하는 것</label>
                  <div className="mb-3 flex gap-2">
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

                {/* 싫어하는 것 */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-200">싫어하는 것</label>
                  <div className="mb-3 flex gap-2">
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

                <Button
                  onClick={handleSavePreferences}
                  isLoading={isSavingPreferences}
                  size="lg"
                  className="w-full"
                >
                  취향 정보 저장
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
