/**
 * OAuth 리다이렉트 로딩 화면 컴포넌트
 * 카카오/구글 로그인 진행 중 표시되는 로딩 화면
 */

type OAuthProvider = 'kakao' | 'google';

interface OAuthLoadingScreenProps {
  provider: OAuthProvider;
}

export const OAuthLoadingScreen = ({ provider }: OAuthLoadingScreenProps) => {
  const providerConfig = {
    kakao: {
      colorClass: 'border-yellow-500',
      text: '카카오 로그인 진행 중...',
    },
    google: {
      colorClass: 'border-blue-500',
      text: '구글 로그인 진행 중...',
    },
  };

  const config = providerConfig[provider];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${config.colorClass} mb-4`}></div>
        <p className="text-lg font-medium text-gray-900">{config.text}</p>
      </div>
    </div>
  );
};
