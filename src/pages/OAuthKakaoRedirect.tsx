/**
 * 카카오 OAuth 리다이렉트 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const OAuthKakaoRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState('');
  const [nameUpdating, setNameUpdating] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasProcessed = useRef(false); // 중복 요청 방지

  useEffect(() => {
    // 이미 처리했으면 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    const handleKakaoCallback = async () => {
      // 처리 시작 표시
      hasProcessed.current = true;
      try {
        // URL에서 code 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('인증 코드를 받지 못했습니다.');
        }

        // 서버에 코드 전달하여 로그인
        const data = await authService.kakaoLogin(code);
        setLoginData(data);
        
        // 토큰 및 위치 정보 저장
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user_id', data.id.toString());
          
          // 이메일 및 이름 저장
          if (data.email) {
            localStorage.setItem('user_email', data.email);
          }
          if (data.name) {
            localStorage.setItem('user_name', data.name);
          }
          
          // 주소 및 위치 정보 저장
          if (data.address) {
            localStorage.setItem('user_address', data.address);
          }
          if (data.latitude !== null) {
            localStorage.setItem('user_latitude', data.latitude.toString());
          }
          if (data.longitude !== null) {
            localStorage.setItem('user_longitude', data.longitude.toString());
          }

          // name이 null이면 이름 입력 화면 표시
          if (data.name === null) {
            setNeedsName(true);
            setLoading(false);
            return;
          }

          // Redux에 사용자 정보 저장
          dispatch(setCredentials({
            user: {
              id: data.id.toString(),
              email: data.email || '',
              name: data.name || '',
              address: data.address || undefined,
              createdAt: new Date().toISOString(),
            },
            token: data.token,
          }));

          // 메인 페이지로 이동
          navigate('/');
        }
      } catch (err: any) {
        console.error('카카오 로그인 실패:', err);
        
        // 서버에서 보낸 에러 메시지 추출
        const errorMessage = err?.response?.data?.message || err?.message || '로그인에 실패했습니다.';
        const statusCode = err?.response?.status;
        
        console.error('에러 상세:', {
          status: statusCode,
          message: errorMessage,
          data: err?.response?.data,
          url: err?.config?.url,
        });
        
        setError(`로그인에 실패했습니다. (${statusCode ? `상태 코드: ${statusCode}` : '네트워크 오류'})`);
        setLoading(false);
      }
    };

    handleKakaoCallback();
    
    // cleanup 함수: 컴포넌트 언마운트 시 처리 취소 (필요시)
    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch]);

  // 이름 입력 화면
  const handleNameSubmit = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setNameUpdating(true);
    try {
      const updatedUser = await authService.updateUser({ name: name.trim() });
      
      // 이름을 로컬 스토리지에 저장
      if (updatedUser.name) {
        localStorage.setItem('user_name', updatedUser.name);
      }

      // Redux에 사용자 정보 저장
      dispatch(setCredentials({
        user: {
          id: loginData.id.toString(),
          email: loginData.email || '',
          name: updatedUser.name || '',
          address: loginData.address || undefined,
          createdAt: new Date().toISOString(),
        },
        token: loginData.token,
      }));

      // 메인 페이지로 이동
      navigate('/');
    } catch (err: any) {
      console.error('이름 업데이트 실패:', err);
      const errorMessage = err?.response?.data?.message || '이름 업데이트에 실패했습니다.';
      alert(errorMessage);
      setNameUpdating(false);
    }
  };

  if (needsName) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-2xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
                P
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">이름을 입력해주세요</h1>
              <p className="text-sm text-slate-300">카카오 로그인을 완료하기 위해 이름이 필요합니다.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !nameUpdating && name.trim()) {
                      handleNameSubmit();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleNameSubmit}
                isLoading={nameUpdating}
                size="lg"
                className="w-full"
              >
                완료
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-900">카카오 로그인 진행 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

