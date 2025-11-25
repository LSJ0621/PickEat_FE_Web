import { Button } from '@/components/common/Button';

interface AuthPromptModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message?: string;
}

export const AuthPromptModal = ({ open, onConfirm, onClose, message }: AuthPromptModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/50">
        <p className="text-center text-lg font-semibold text-white">로그인이 필요한 서비스입니다</p>
        <p className="mt-3 text-center text-sm text-slate-300">
          {message ?? '해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?'}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={onConfirm} size="lg">
            로그인하러 가기
          </Button>
          <Button variant="ghost" size="lg" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

