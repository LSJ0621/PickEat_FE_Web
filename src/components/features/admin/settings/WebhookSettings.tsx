/**
 * 웹훅 설정 폼
 * Backend DTO: pick-eat_be/src/admin/settings/dto/webhook-settings.dto.ts
 */

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { WebhookSettings as WebhookSettingsType, WebhookThresholds } from '@/types/admin-settings';
import { useState, useEffect } from 'react';

interface WebhookSettingsProps {
  settings: WebhookSettingsType;
  onChange: (settings: Partial<WebhookSettingsType>) => void;
}

export function WebhookSettings({ settings, onChange }: WebhookSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleEnabledChange = (checked: boolean) => {
    const updated = { ...localSettings, enabled: checked };
    setLocalSettings(updated);
    onChange({ enabled: checked });
  };

  const handleUrlChange = (url: string) => {
    const updated = { ...localSettings, webhookUrl: url };
    setLocalSettings(updated);
    onChange({ webhookUrl: url });
  };

  const handleThresholdChange = (key: keyof WebhookThresholds, checked: boolean) => {
    const updated = {
      ...localSettings,
      thresholds: { ...localSettings.thresholds, [key]: checked },
    };
    setLocalSettings(updated);
    onChange({ thresholds: updated.thresholds });
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center space-x-3">
        <Checkbox
          id="webhook-enabled"
          checked={localSettings.enabled}
          onCheckedChange={handleEnabledChange}
          className="border-slate-600 data-[state=checked]:bg-blue-600"
        />
        <Label htmlFor="webhook-enabled" className="text-white cursor-pointer">
          Discord 웹훅 알림 활성화
        </Label>
      </div>

      {/* Webhook URL */}
      <div className="space-y-2">
        <Label htmlFor="webhook-url" className="text-white">
          Discord 웹훅 URL
        </Label>
        <Input
          id="webhook-url"
          type="text"
          placeholder="https://discord.com/api/webhooks/..."
          value={localSettings.webhookUrl || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={!localSettings.enabled}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50"
        />
        <p className="text-xs text-slate-400">
          Discord 서버의 웹훅 URL을 입력하세요. 설정된 URL은 보안을 위해 마스킹되어 표시됩니다.
        </p>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">알림 유형</h4>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="threshold-new-bug"
            checked={localSettings.thresholds.newBugReportEnabled}
            onCheckedChange={(checked) => handleThresholdChange('newBugReportEnabled', !!checked)}
            disabled={!localSettings.enabled}
            className="border-slate-600 data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="threshold-new-bug" className="text-white cursor-pointer">
            새 버그 리포트 알림
          </Label>
        </div>
        <p className="text-xs text-slate-400 ml-7">
          새로운 버그 리포트가 접수되면 알림을 전송합니다.
        </p>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="threshold-critical-bug"
            checked={localSettings.thresholds.criticalBugAlertEnabled}
            onCheckedChange={(checked) => handleThresholdChange('criticalBugAlertEnabled', !!checked)}
            disabled={!localSettings.enabled}
            className="border-slate-600 data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="threshold-critical-bug" className="text-white cursor-pointer">
            긴급 버그 알림
          </Label>
        </div>
        <p className="text-xs text-slate-400 ml-7">
          긴급 처리가 필요한 버그가 발생하면 알림을 전송합니다.
        </p>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="threshold-daily-summary"
            checked={localSettings.thresholds.dailySummaryEnabled}
            onCheckedChange={(checked) => handleThresholdChange('dailySummaryEnabled', !!checked)}
            disabled={!localSettings.enabled}
            className="border-slate-600 data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="threshold-daily-summary" className="text-white cursor-pointer">
            일일 요약 알림
          </Label>
        </div>
        <p className="text-xs text-slate-400 ml-7">
          매일 시스템 상태 요약을 전송합니다.
        </p>
      </div>
    </div>
  );
}
