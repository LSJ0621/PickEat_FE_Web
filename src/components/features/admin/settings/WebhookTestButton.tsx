/**
 * 웹훅 테스트 버튼 컴포넌트
 */

import { Button } from '@/components/ui/button';
import { adminSettingsService } from '@/api/services/admin-settings';
import { useToast } from '@/hooks/common/useToast';
import { extractErrorMessage } from '@/utils/error';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';

export function WebhookTestButton() {
  const { success, error: showError } = useToast();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    try {
      setTesting(true);
      const response = await adminSettingsService.testWebhook();
      success(response.message || '테스트 메시지가 전송되었습니다.');
    } catch (err) {
      showError(extractErrorMessage(err, '웹훅 테스트에 실패했습니다.'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      onClick={handleTest}
      disabled={testing}
      variant="outline"
      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
    >
      {testing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          전송 중...
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          테스트 전송
        </>
      )}
    </Button>
  );
}
