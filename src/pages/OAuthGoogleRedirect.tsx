/**
 * 구글 OAuth 리다이렉트 페이지
 */

import { authService } from '@/api/services/auth';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { extractErrorMessage } from '@/utils/error';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const OAuthGoogleRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasProcessed = useRef(false); // 중복 요청 방지

  useEffect(() => {
    // 이미 처리했으면 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    const handleGoogleCallback = async () => {
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
        const loginData = await authService.googleLogin(code);

        if (!loginData.token) {
          throw new Error('토큰이 발급되지 않았습니다.');
        }

        dispatch(setCredentials({
          user: {
            id: loginData.id.toString(),
            email: loginData.email || '',
            name: loginData.name || '',
            address: loginData.address ?? null,
            latitude: loginData.latitude ?? null,
            longitude: loginData.longitude ?? null,
            createdAt: new Date().toISOString(),
          },
          token: loginData.token,
        }));

        navigate('/');
      } catch (err: unknown) {
        console.error('구글 로그인 실패:', err);
        
        const errorMessage = extractErrorMessage(err, '로그인에 실패했습니다.');
        const statusCode = (err as { response?: { status?: number } })?.response?.status;
        
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

    handleGoogleCallback();
    
    // cleanup 함수: 컴포넌트 언마운트 시 처리 취소 (필요시)
    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-900">구글 로그인 진행 중...</p>
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

