/**
 * 시스템 설정 폼
 * Backend DTO: pick-eat_be/src/admin/settings/dto/system-settings.dto.ts
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SystemSettings as SystemSettingsType } from '@/types/admin-settings';
import { useState, useEffect } from 'react';

interface SystemSettingsProps {
  settings: SystemSettingsType;
  onChange: (settings: Partial<SystemSettingsType>) => void;
}

export function SystemSettings({ settings, onChange }: SystemSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleMenuChange = (key: keyof SystemSettingsType['menuRecommendation'], value: string | number) => {
    let finalValue: string | number | string[] = value;

    if (key === 'maxRecommendationsPerDay') {
      const numValue = parseInt(value as string, 10);
      if (isNaN(numValue)) return;
      finalValue = numValue;
    } else if (key === 'defaultCuisineTypes') {
      finalValue = (value as string).split(',').map(s => s.trim()).filter(Boolean);
    }

    const updated = {
      ...localSettings,
      menuRecommendation: { ...localSettings.menuRecommendation, [key]: finalValue },
    };
    setLocalSettings(updated);
    onChange({ menuRecommendation: updated.menuRecommendation });
  };

  const handleSecurityChange = (key: keyof SystemSettingsType['security'], value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const updated = {
      ...localSettings,
      security: { ...localSettings.security, [key]: numValue },
    };
    setLocalSettings(updated);
    onChange({ security: updated.security });
  };

  const handleRetentionChange = (key: keyof SystemSettingsType['dataRetention'], value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const updated = {
      ...localSettings,
      dataRetention: { ...localSettings.dataRetention, [key]: numValue },
    };
    setLocalSettings(updated);
    onChange({ dataRetention: updated.dataRetention });
  };

  return (
    <div className="space-y-8">
      {/* 메뉴 추천 설정 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">메뉴 추천 설정</h4>

        <div className="space-y-2">
          <Label htmlFor="max-recommendations" className="text-white">
            일일 최대 추천 횟수
          </Label>
          <Input
            id="max-recommendations"
            type="number"
            min="1"
            max="50"
            value={localSettings.menuRecommendation.maxRecommendationsPerDay}
            onChange={(e) => handleMenuChange('maxRecommendationsPerDay', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            사용자당 일일 최대 메뉴 추천 횟수 (1-50회)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-cuisine-types" className="text-white">
            기본 요리 유형
          </Label>
          <Input
            id="default-cuisine-types"
            type="text"
            value={localSettings.menuRecommendation.defaultCuisineTypes.join(', ')}
            onChange={(e) => handleMenuChange('defaultCuisineTypes', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="한식, 중식, 일식, 양식"
          />
          <p className="text-xs text-slate-400">
            기본 요리 유형 (쉼표로 구분)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-model-version" className="text-white">
            AI 모델 버전
          </Label>
          <Input
            id="ai-model-version"
            type="text"
            value={localSettings.menuRecommendation.aiModelVersion}
            onChange={(e) => handleMenuChange('aiModelVersion', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="gpt-4o-mini"
          />
          <p className="text-xs text-slate-400">
            메뉴 추천에 사용할 AI 모델 버전
          </p>
        </div>
      </div>

      {/* 보안 설정 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">보안 설정</h4>

        <div className="space-y-2">
          <Label htmlFor="session-timeout" className="text-white">
            세션 타임아웃 (분)
          </Label>
          <Input
            id="session-timeout"
            type="number"
            min="10"
            max="1440"
            value={localSettings.security.sessionTimeoutMinutes}
            onChange={(e) => handleSecurityChange('sessionTimeoutMinutes', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            사용자 세션 만료 시간 (10분 - 24시간)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-login-attempts" className="text-white">
            최대 로그인 시도 횟수
          </Label>
          <Input
            id="max-login-attempts"
            type="number"
            min="3"
            max="10"
            value={localSettings.security.maxLoginAttempts}
            onChange={(e) => handleSecurityChange('maxLoginAttempts', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            로그인 실패 시 계정 잠금까지의 횟수 (3-10회)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lockout-duration" className="text-white">
            계정 잠금 시간 (분)
          </Label>
          <Input
            id="lockout-duration"
            type="number"
            min="5"
            max="60"
            value={localSettings.security.lockoutDurationMinutes}
            onChange={(e) => handleSecurityChange('lockoutDurationMinutes', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            계정 잠금 지속 시간 (5분 - 60분)
          </p>
        </div>
      </div>

      {/* 데이터 보관 설정 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">데이터 보관 설정</h4>

        <div className="space-y-2">
          <Label htmlFor="user-data-retention" className="text-white">
            사용자 데이터 보관 기간 (일)
          </Label>
          <Input
            id="user-data-retention"
            type="number"
            min="30"
            max="365"
            value={localSettings.dataRetention.userDataRetentionDays}
            onChange={(e) => handleRetentionChange('userDataRetentionDays', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            비활성 사용자 데이터 보관 기간 (30-365일)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-log-retention" className="text-white">
            감사 로그 보관 기간 (일)
          </Label>
          <Input
            id="audit-log-retention"
            type="number"
            min="90"
            max="730"
            value={localSettings.dataRetention.auditLogRetentionDays}
            onChange={(e) => handleRetentionChange('auditLogRetentionDays', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            관리자 감사 로그 보관 기간 (90-730일)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deleted-account-retention" className="text-white">
            탈퇴 계정 보관 기간 (일)
          </Label>
          <Input
            id="deleted-account-retention"
            type="number"
            min="30"
            max="365"
            value={localSettings.dataRetention.deletedAccountRetentionDays}
            onChange={(e) => handleRetentionChange('deletedAccountRetentionDays', e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            탈퇴한 계정 정보 보관 기간 (30-365일)
          </p>
        </div>
      </div>
    </div>
  );
}
