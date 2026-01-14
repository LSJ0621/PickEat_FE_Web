/**
 * 웹훅 설정 탭
 */

import { adminSettingsService } from '@/api/services/admin-settings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/common/useToast';
import type { UpdateWebhookRequest, WebhookSettings as WebhookSettingsType } from '@/types/admin-settings';
import { extractErrorMessage } from '@/utils/error';
import { Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsSkeleton } from './SettingsSkeleton';
import { WebhookSettings } from './WebhookSettings';
import { WebhookTestButton } from './WebhookTestButton';

export function WebhookTab() {
  const { success, error: showError } = useToast();
  const [settings, setSettings] = useState<WebhookSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<WebhookSettingsType>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminSettingsService.getWebhookSettings();
      setSettings(data);
      setPendingChanges({});
      setHasChanges(false);
    } catch (err) {
      showError(extractErrorMessage(err, '웹훅 설정을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingsChange = (changes: Partial<WebhookSettingsType>) => {
    setPendingChanges((prev) => ({ ...prev, ...changes }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || !settings) return;

    try {
      setSaving(true);
      const updateData: UpdateWebhookRequest = {};

      if ('enabled' in pendingChanges) {
        updateData.enabled = pendingChanges.enabled;
      }
      if ('webhookUrl' in pendingChanges) {
        updateData.webhookUrl = pendingChanges.webhookUrl || undefined;
      }
      if ('thresholds' in pendingChanges && pendingChanges.thresholds) {
        updateData.thresholds = pendingChanges.thresholds;
      }

      await adminSettingsService.updateWebhookSettings(updateData);
      success('웹훅 설정이 저장되었습니다.');
      fetchSettings();
    } catch (err) {
      showError(extractErrorMessage(err, '웹훅 설정 저장에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setPendingChanges({});
      setHasChanges(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-slate-400">
        설정을 불러올 수 없습니다.
      </div>
    );
  }

  const currentSettings = { ...settings, ...pendingChanges };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Discord 웹훅 설정"
        description="중요한 이벤트 발생 시 Discord로 알림을 받을 수 있습니다."
      >
        <WebhookSettings settings={currentSettings} onChange={handleSettingsChange} />

        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <WebhookTestButton />
          <div className="flex gap-3">
            {hasChanges && (
              <Button
                onClick={handleCancel}
                disabled={saving}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                취소
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>처리 중...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
