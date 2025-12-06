/**
 * 마이페이지
 */

import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync, updateUser } from '@/store/slices/authSlice';
import type { AddressSearchResult, SelectedAddress, UserAddress } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MyPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showAddressListModal, setShowAddressListModal] = useState(false);

  // 주소 리스트 관련 상태
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState<UserAddress | null>(null);

  // 주소 추가/수정 모달 관련 상태
  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);

  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPreferences();
    loadAddresses();
  }, [isAuthenticated, navigate]);

  // 주소 관리 모달이 닫힐 때 주소 정보 다시 불러오기
  useEffect(() => {
    if (!showAddressListModal) {
      loadAddresses();
    }
  }, [showAddressListModal]);

  const loadPreferences = async () => {
    setIsLoadingPreferences(true);
    try {
      const result = await userService.getPreferences();
      setLikes(result.preferences.likes || []);
      setDislikes(result.preferences.dislikes || []);
      setAnalysis(result.preferences.analysis ?? null);
    } catch (error: unknown) {
      console.error('취향 정보 조회 실패:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const [addressesResponse, defaultResponse] = await Promise.all([
        userService.getAddresses(),
        userService.getDefaultAddress(),
      ]);
      setAddresses(addressesResponse.addresses);
      setDefaultAddress(defaultResponse.address);
    } catch (error: unknown) {
      console.error('주소 리스트 조회 실패:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

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
    const selected: SelectedAddress = {
      address: address.address,
      roadAddress: address.roadAddress,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    };
    setSelectedAddress(selected);
    setAddressQuery('');
    setSearchResults([]);
  };

  // 주소 추가 (하나씩만)
  const handleAddAddress = async () => {
    if (!selectedAddress) {
      alert('주소를 선택해주세요.');
      return;
    }

    // 최대 4개 제한 확인
    if (addresses.length >= 4) {
      alert('최대 4개까지 주소를 등록할 수 있습니다.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.createAddress({
        selectedAddress,
        alias: addressAlias.trim() || undefined,
      });

      await loadAddresses();
      setShowAddressModal(false);
      setAddressQuery('');
      setSearchResults([]);
      setSelectedAddress(null);
      setAddressAlias('');
      setHasSearchedAddress(false);
      alert('주소가 추가되었습니다.');
    } catch (error: unknown) {
      console.error('주소 추가 실패:', error);
      alert(extractErrorMessage(error, '주소 추가에 실패했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  // 기본 주소 설정
  const handleSetDefaultAddress = async (id: number) => {
    try {
      const updatedAddress = await userService.setDefaultAddress(id);
      
      // 응답값으로 Redux 업데이트
      const latitudeValue = updatedAddress.latitude !== null && !Number.isNaN(updatedAddress.latitude) 
        ? updatedAddress.latitude 
        : null;
      const longitudeValue = updatedAddress.longitude !== null && !Number.isNaN(updatedAddress.longitude) 
        ? updatedAddress.longitude 
        : null;
      
      dispatch(
        updateUser({
          address: updatedAddress.roadAddress,
          latitude: latitudeValue,
          longitude: longitudeValue,
        })
      );
      
      await loadAddresses();
      alert('기본 주소가 변경되었습니다.');
    } catch (error: unknown) {
      console.error('기본 주소 설정 실패:', error);
      alert(extractErrorMessage(error, '기본 주소 설정에 실패했습니다.'));
    }
  };

  // 주소 클릭 시 기본주소 변경 확인
  const handleAddressClick = (address: UserAddress) => {
    if (address.isDefault) {
      return; // 기본주소는 클릭 불가
    }
    setConfirmDefaultAddress(address);
  };

  // 기본주소 변경 확인 후 처리
  const handleConfirmSetDefault = async () => {
    if (!confirmDefaultAddress) return;
    
    try {
      await handleSetDefaultAddress(confirmDefaultAddress.id);
      setConfirmDefaultAddress(null);
    } catch (error) {
      // handleSetDefaultAddress에서 이미 에러 처리
    }
  };


  // 주소 삭제 (배열로 여러 개 삭제)
  const handleDeleteAddresses = async (ids: number[]) => {
    if (ids.length === 0) {
      alert('삭제할 주소를 선택해주세요.');
      return;
    }

    // 기본주소가 포함되어 있는지 확인
    const hasDefaultAddress = ids.some((id) => {
      const addr = addresses.find((a) => a.id === id);
      return addr?.isDefault;
    });

    if (hasDefaultAddress) {
      alert('기본주소는 삭제할 수 없습니다. 기본주소를 변경한 후 삭제해주세요.');
      return;
    }

    if (!confirm(`정말 ${ids.length}개의 주소를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await userService.deleteAddresses(ids);
      await loadAddresses();
      setSelectedDeleteIds([]);
      alert(`${ids.length}개의 주소가 삭제되었습니다.`);
    } catch (error: unknown) {
      console.error('주소 삭제 실패:', error);
      alert(extractErrorMessage(error, '주소 삭제에 실패했습니다.'));
    }
  };

  // 주소 삭제 선택 토글
  const handleToggleDeleteSelection = (id: number) => {
    if (selectedDeleteIds.includes(id)) {
      setSelectedDeleteIds(selectedDeleteIds.filter((selectedId) => selectedId !== id));
    } else {
      // 기본주소는 선택할 수 없음
      const addr = addresses.find((a) => a.id === id);
      if (addr?.isDefault) {
        alert('기본주소는 삭제할 수 없습니다.');
        return;
      }
      // 최대 3개까지 선택 가능
      if (selectedDeleteIds.length >= 3) {
        alert('최대 3개까지 삭제할 수 있습니다.');
        return;
      }
      setSelectedDeleteIds([...selectedDeleteIds, id]);
    }
  };

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
        likes: likes,
        dislikes: dislikes,
      });
      alert('취향 정보가 저장되었습니다.');
      setShowPreferencesModal(false);
      loadPreferences();
    } catch (error: unknown) {
      console.error('취향 정보 저장 실패:', error);
      alert(extractErrorMessage(error, '취향 정보를 저장하는 데 실패했습니다.'));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleOpenPreferencesModal = () => {
    loadPreferences();
    setShowPreferencesModal(true);
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await dispatch(logoutAsync());
      navigate('/login');
    } catch (error: unknown) {
      console.error('회원 탈퇴 실패:', error);
      alert(extractErrorMessage(error, '회원 탈퇴에 실패했습니다.'));
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex-1 py-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">마이페이지</h1>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 shadow-sm shadow-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
            >
              회원 탈퇴
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">이름</p>
                  <p className="mt-1 text-lg font-semibold text-white">{user?.name || '이름 없음'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">이메일</p>
                  <p className="mt-1 text-lg font-semibold text-white">{user?.email || '이메일 없음'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-400">메뉴 선택 이력</p>
                  <p className="mt-1 text-sm text-slate-300">선택한 메뉴들을 확인하고 관리할 수 있습니다.</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/menu-selections/history')}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
                >
                  이력 보기
                </Button>
              </div>
            </div>

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
                    <div className="mt-3 space-y-3">
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
                      {analysis && (
                        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                          <p className="mb-2 text-xs font-medium text-purple-200">AI 리포트</p>
                          <p className="text-sm leading-relaxed text-slate-100">{analysis}</p>
                        </div>
                      )}
                      {likes.length === 0 && dislikes.length === 0 && !analysis && (
                        <p className="text-sm text-slate-400">등록된 취향 정보가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
                    onClick={handleOpenPreferencesModal}
                  >
                    취향 수정
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-400">주소 관리</p>
                  {user?.address ? (
                    <div className="mt-2">
                      <p className="text-lg font-semibold text-white">
                        {user.address}
                      </p>
                      {addresses.length > 1 && (
                        <p className="mt-1 text-xs text-slate-400">
                          총 {addresses.length}개의 주소가 등록되어 있습니다
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">주소가 등록되지 않았습니다.</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
                    onClick={() => setShowAddressListModal(true)}
                  >
                    주소 관리
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 - 카드 리스트 아래, footer 위에 배치 */}
          <div className="mt-6 pb-[88px] sm:pb-[104px]">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30 hover:-translate-y-0.5"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </div>

        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setAddressQuery('');
                  setSearchResults([]);
                  setSelectedAddress(null);
                  setAddressAlias('');
                  setHasSearchedAddress(false);
                }}
                className="absolute right-6 top-6 text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="mb-6 text-2xl font-bold text-white">주소 추가</h2>
              <p className="mb-4 text-sm text-slate-400">
                최대 4개까지 주소를 등록할 수 있습니다. (현재: {addresses.length}/4, 추가 가능: {Math.max(0, 4 - addresses.length)}개)
                <br />
                <span className="text-xs text-slate-500">주소는 하나씩만 추가할 수 있습니다.</span>
              </p>

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

                {!isSearching && hasSearchedAddress && searchResults.length === 0 && (
                  <p className="text-sm text-slate-400">주소를 찾을 수 없습니다.</p>
                )}

                {/* 선택한 주소 */}
                {selectedAddress && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="mb-3">
                      <p className="text-xs text-emerald-200">선택한 주소</p>
                      <p className="mt-1 text-white font-medium">
                        {selectedAddress.roadAddress || selectedAddress.address}
                      </p>
                      {selectedAddress.roadAddress && (
                        <p className="mt-1 text-xs text-slate-400">{selectedAddress.address}</p>
                      )}
                    </div>
                    <input
                      type="text"
                      value={addressAlias}
                      onChange={(e) => setAddressAlias(e.target.value)}
                      placeholder="별칭 입력 (예: 집, 회사) - 선택사항"
                      maxLength={20}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                    />
                    <button
                      onClick={() => {
                        setSelectedAddress(null);
                        setAddressAlias('');
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      선택 취소
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowAddressModal(false);
                      setAddressQuery('');
                      setSearchResults([]);
                      setSelectedAddress(null);
                      setAddressAlias('');
                      setHasSearchedAddress(false);
                    }}
                    variant="ghost"
                    size="lg"
                    disabled={isSaving}
                    className="flex-1 border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleAddAddress}
                    isLoading={isSaving}
                    disabled={!selectedAddress || addresses.length >= 4}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
                    size="lg"
                  >
                    주소 추가
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 주소 리스트 관리 모달 */}
        {showAddressListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
              <button
                onClick={() => {
                  setShowAddressListModal(false);
                  setSelectedDeleteIds([]);
                  setIsEditMode(false);
                  setConfirmDefaultAddress(null);
                }}
                className="absolute right-6 top-6 text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center justify-between mb-6 pr-12">
                <h2 className="text-2xl font-bold text-white">주소 관리</h2>
                {!isEditMode && addresses.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditMode(true)}
                    className="border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    편집
                  </Button>
                )}
                {isEditMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedDeleteIds([]);
                    }}
                    className="border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    완료
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* 기본주소 표시 */}
                {(defaultAddress || addresses.find(addr => addr.isDefault)) && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {(() => {
                          const defaultAddr = defaultAddress || addresses.find(addr => addr.isDefault);
                          if (!defaultAddr) return null;
                          return (
                            <>
                              <p className="text-white font-medium">
                                {defaultAddr.alias && (
                                  <span className="mr-2 text-orange-200">{defaultAddr.alias}</span>
                                )}
                                {defaultAddr.roadAddress}
                              </p>
                              {defaultAddr.postalCode && (
                                <p className="mt-1 text-xs text-slate-400">{defaultAddr.postalCode}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 나머지 주소 리스트 */}
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    {addresses
                      .filter((addr) => !addr.isDefault)
                      .map((address) => (
                        <div
                          key={address.id}
                          onClick={() => {
                            if (!isEditMode) {
                              handleAddressClick(address);
                            }
                          }}
                          className={`rounded-xl border p-4 transition cursor-pointer ${
                            isEditMode && selectedDeleteIds.includes(address.id)
                              ? 'border-red-500/50 bg-red-500/20'
                              : isEditMode
                              ? 'border-white/10 bg-white/5 hover:bg-white/10'
                              : 'border-white/10 bg-white/5 hover:border-orange-500/30 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* 삭제 체크박스 (편집 모드에서만 표시) */}
                              {isEditMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedDeleteIds.includes(address.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleDeleteSelection(address.id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {address.alias && (
                                    <span className="mr-2 text-orange-200">{address.alias}</span>
                                  )}
                                  {address.roadAddress}
                                </p>
                                {address.postalCode && (
                                  <p className="mt-1 text-xs text-slate-400">{address.postalCode}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {addresses.length === 0 && (
                  <p className="text-center text-slate-400 py-8">등록된 주소가 없습니다.</p>
                )}

                {/* 편집 모드에서 선택된 주소 삭제 버튼 */}
                {isEditMode && selectedDeleteIds.length > 0 && (
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => handleDeleteAddresses(selectedDeleteIds)}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
                  >
                    선택한 {selectedDeleteIds.length}개 주소 삭제
                  </Button>
                )}

                {/* 주소 추가 버튼 */}
                {!isEditMode && addresses.length < 4 && (
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => {
                      setShowAddressListModal(false);
                      setShowAddressModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
                  >
                    + 주소 추가 ({addresses.length}/4)
                  </Button>
                )}

                {!isEditMode && addresses.length >= 4 && (
                  <p className="text-center text-sm text-slate-400">
                    최대 4개까지 주소를 등록할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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

        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="mb-4 text-2xl font-bold text-white">회원 탈퇴</h2>
              <p className="mb-6 text-slate-300">
                정말 회원 탈퇴를 하시겠습니까?<br />
                탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteAccountModal(false)}
                  size="md"
                  className="flex-1 border border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  취소
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  isLoading={isDeletingAccount}
                  size="md"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  탈퇴하기
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 기본주소 변경 확인 모달 */}
      {confirmDefaultAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-white">기본주소 변경</h2>
            <p className="mb-6 text-slate-300">
              <span className="font-semibold text-orange-200">
                {confirmDefaultAddress.alias ? `${confirmDefaultAddress.alias} - ` : ''}
                {confirmDefaultAddress.roadAddress}
              </span>
              를 기본주소로 사용하시겠습니까?
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setConfirmDefaultAddress(null)}
                className="flex-1 border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                size="lg"
                onClick={handleConfirmSetDefault}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
