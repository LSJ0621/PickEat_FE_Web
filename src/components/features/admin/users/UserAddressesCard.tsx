/**
 * 사용자 주소 정보 카드 컴포넌트
 */

import type { AdminUserDetail } from '@/types/admin';
import { MapPin, Star, Search } from 'lucide-react';

interface UserAddressesCardProps {
  addresses: AdminUserDetail['addresses'];
}

export const UserAddressesCard = ({ addresses }: UserAddressesCardProps) => {
  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h2 className="mb-6 text-xl font-bold text-white">주소</h2>
        <div className="text-center text-slate-400 py-8">등록된 주소가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">주소</h2>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                {address.alias && (
                  <div className="mb-1 font-medium text-white">{address.alias}</div>
                )}
                <div className="text-sm text-slate-300">{address.roadAddress}</div>
                <div className="mt-2 flex items-center gap-2">
                  {address.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-pink-500/20 px-2 py-1 text-xs text-pink-400">
                      <Star className="h-3 w-3" />
                      기본 주소
                    </span>
                  )}
                  {address.isSearchAddress && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                      <Search className="h-3 w-3" />
                      검색 주소
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
