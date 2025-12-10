/**
 * 마이페이지
 */

import { userService } from '@/api/services/user';
import { Button } from '@/components/common/Button';
import {
    AddressAddModal,
    AddressListModal,
    AddressSection,
} from '@/components/features/user/address';
import {
    PreferencesEditModal,
    PreferencesSection,
} from '@/components/features/user/preferences';
import { useAddressList } from '@/hooks/address/useAddressList';
import { useAddressModal } from '@/hooks/address/useAddressModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePreferences } from '@/hooks/user/usePreferences';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync } from '@/store/slices/authSlice';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

export const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();
  const { handleError } = useErrorHandler();

  // 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // 기본주소 변경 확인 모달 애니메이션 상태
  const [isConfirmModalAnimating, setIsConfirmModalAnimating] = useState(false);
  const [shouldRenderConfirmModal, setShouldRenderConfirmModal] = useState(false);

  // Custom Hooks
  // Redux 상태를 초기값으로 사용 (중복 API 호출 방지)
  const preferences = usePreferences({
    initialLikes: user?.preferences?.likes,
    initialDislikes: user?.preferences?.dislikes,
  });
  const addressList = useAddressList();
  const addressModal = useAddressModal({
    addressesCount: addressList.addresses.length,
    onAddressAdded: addressList.loadAddresses,
  });

  // 모달이 실제로 닫혔는지 추적 (초기 마운트 시 실행 방지)
  const prevShowAddressListModalRef = useRef<boolean>(false);
  const hasInitializedRef = useRef(false);
  const currentPathnameRef = useRef<string>(location.pathname);

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 경로 변경 감지 및 초기화 리셋 (컴포넌트 재사용 시 대비)
  useEffect(() => {
    if (currentPathnameRef.current !== location.pathname) {
      hasInitializedRef.current = false;
      currentPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  // 데이터 로드 (StrictMode 대응)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    // StrictMode 대응: 이미 초기화했으면 스킵
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    
    // Redux에 preferences가 있으면 초기값으로 사용, 없을 때만 API 호출
    // (중복 API 호출 방지)
    const hasPreferencesInRedux = user?.preferences?.likes || user?.preferences?.dislikes;
    
    // React 공식 문서 권장: 함수를 useEffect 내부에서 직접 호출
    // useCallback으로 안정화된 함수만 의존성으로 사용
    async function loadData() {
      // Redux에 preferences가 없을 때만 API 호출
      if (!hasPreferencesInRedux) {
        await preferences.loadPreferences();
      }
      // 주소는 항상 로드 (Redux에 저장되지 않음)
      await addressList.loadAddresses();
    }
    
    loadData();
    // 함수는 useCallback으로 안정화되어 있어 안정적이지만, 
    // user?.preferences는 변경될 수 있으므로 dependency에서 제외 (초기 로드만 필요)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 주소 관리 모달이 닫힐 때 주소 정보 다시 불러오기
  useEffect(() => {
    // 이전에 모달이 열려있었고 지금 닫혔다면 (초기 마운트가 아닌 경우)
    if (prevShowAddressListModalRef.current && !showAddressListModal) {
      // React 공식 문서 권장: 함수를 useEffect 내부에서 직접 호출
      addressList.loadAddresses();
    }
    // 현재 상태를 이전 상태로 저장
    prevShowAddressListModalRef.current = showAddressListModal;
    // useCallback으로 안정화된 함수만 의존성으로 사용 (객체 전체 사용 금지)
  }, [showAddressListModal, addressList.loadAddresses]);

  // 기본주소 변경 확인 모달 애니메이션
  useEffect(() => {
    if (addressList.confirmDefaultAddress) {
      setShouldRenderConfirmModal(true);
      requestAnimationFrame(() => {
        setIsConfirmModalAnimating(true);
      });
    } else {
      setIsConfirmModalAnimating(false);
      const timer = setTimeout(() => {
        setShouldRenderConfirmModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [addressList.confirmDefaultAddress]);

  const handleOpenPreferencesModal = () => {
    preferences.loadPreferences();
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
      handleError(error, 'MyPage');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    addressModal.resetAddressModal();
  };

  const handleCloseAddressListModal = () => {
    setShowAddressListModal(false);
    addressList.resetAddressListModal();
  };

  const handleClosePreferencesModal = () => {
    setShowPreferencesModal(false);
    preferences.resetPreferencesModal();
  };

  const handleAddAddressFromList = () => {
    setShowAddressListModal(false);
    setShowAddressModal(true);
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

            <PreferencesSection
              likes={preferences.likes}
              dislikes={preferences.dislikes}
              analysis={preferences.analysis}
              isLoading={preferences.isLoadingPreferences}
              onEditClick={handleOpenPreferencesModal}
            />

            <AddressSection
              userAddress={user?.address}
              addresses={addressList.addresses}
              onManageClick={() => setShowAddressListModal(true)}
            />
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

        <AddressAddModal
          open={showAddressModal}
          addresses={addressList.addresses}
          addressQuery={addressModal.addressQuery}
          searchResults={addressModal.searchResults}
          isSearching={addressModal.isSearching}
          selectedAddress={addressModal.selectedAddress}
          addressAlias={addressModal.addressAlias}
          isSaving={addressModal.isSaving}
          hasSearchedAddress={addressModal.hasSearchedAddress}
          onClose={handleCloseAddressModal}
          onAddressQueryChange={addressModal.setAddressQuery}
          onSearch={addressModal.handleSearch}
          onSelectAddress={addressModal.handleSelectAddress}
          onAddressAliasChange={addressModal.setAddressAlias}
          onAddAddress={addressModal.handleAddAddress}
          onClearSelection={() => {
            addressModal.setSelectedAddress(null);
            addressModal.setAddressAlias('');
          }}
        />

        <AddressListModal
          open={showAddressListModal}
          addresses={addressList.addresses}
          defaultAddress={addressList.defaultAddress}
          isEditMode={addressList.isEditMode}
          selectedDeleteIds={addressList.selectedDeleteIds}
          onClose={handleCloseAddressListModal}
          onEditModeChange={addressList.setIsEditMode}
          onAddressClick={addressList.handleAddressClick}
          onToggleDeleteSelection={addressList.handleToggleDeleteSelection}
          onDeleteAddresses={addressList.handleDeleteAddresses}
          onAddAddress={handleAddAddressFromList}
        />

        <PreferencesEditModal
          open={showPreferencesModal}
          likes={preferences.likes}
          dislikes={preferences.dislikes}
          newLike={preferences.newLike}
          newDislike={preferences.newDislike}
          isSaving={preferences.isSavingPreferences}
          onClose={handleClosePreferencesModal}
          onNewLikeChange={preferences.setNewLike}
          onNewDislikeChange={preferences.setNewDislike}
          onAddLike={preferences.handleAddLike}
          onRemoveLike={preferences.handleRemoveLike}
          onAddDislike={preferences.handleAddDislike}
          onRemoveDislike={preferences.handleRemoveDislike}
          onSave={preferences.handleSavePreferences}
        />

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

      {/* 기본주소 변경 확인 모달 */}
        {shouldRenderConfirmModal && addressList.confirmDefaultAddress && createPortal(
          <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
            isConfirmModalAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
          }`}>
            <div className={`relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
              isConfirmModalAnimating ? 'modal-content-enter' : 'modal-content-exit'
            }`}>
              <h2 className="mb-4 text-xl font-bold text-white">기본주소 변경</h2>
              <p className="mb-6 text-slate-300">
                <span className="font-semibold text-orange-200">
                    {addressList.confirmDefaultAddress.alias
                      ? `${addressList.confirmDefaultAddress.alias} - `
                      : ''}
                    {addressList.confirmDefaultAddress.roadAddress}
                </span>
                를 기본주소로 사용하시겠습니까?
              </p>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="ghost"
                    onClick={() => addressList.setConfirmDefaultAddress(null)}
                  className="flex-1 border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                >
                  취소
                </Button>
                <Button
                  size="lg"
                    onClick={addressList.handleConfirmSetDefault}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
                >
                  확인
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
