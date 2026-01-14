/**
 * 시스템 설정 탭
 */

import { adminSettingsService } from '@/api/services/admin-settings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/common/useToast';
import type { SystemSettings as SystemSettingsType } from '@/types/admin-settings';
import { extractErrorMessage } from '@/utils/error';
import { Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsSkeleton } from './SettingsSkeleton';
import { SystemSettings } from './SystemSettings';

export function SystemTab() {
  const { success, error: showError } = useToast();
  const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<SystemSettingsType>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminSettingsService.getSystemSettings();
      setSettings(data);
      setPendingChanges({});
      setHasChanges(false);
    } catch (err) {
      showError(extractErrorMessage(err, '시스템 설정을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingsChange = (changes: Partial<SystemSettingsType>) => {
    setPendingChanges((prev) => ({ ...prev, ...changes }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || !settings) return;

    try {
      setSaving(true);
      await adminSettingsService.updateSystemSettings(pendingChanges);
      success('시스템 설정이 저장되었습니다.');
      fetchSettings();
    } catch (err) {
      showError(extractErrorMessage(err, '시스템 설정 저장에 실패했습니다.'));
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

  const currentSettings: SystemSettingsType = {
    menuRecommendation: {
      ...settings.menuRecommendation,
      ...(pendingChanges.menuRecommendation || {}),
    },
    security: {
      ...settings.security,
      ...(pendingChanges.security || {}),
    },
    dataRetention: {
      ...settings.dataRetention,
      ...(pendingChanges.dataRetention || {}),
    },
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="시스템 설정"
        description="메뉴 추천, 보안, 데이터 보관 등 시스템 전반의 설정을 관리합니다."
      >
        <SystemSettings settings={currentSettings} onChange={handleSettingsChange} />

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
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
      </SettingsSection>
    </div>
  );
}
