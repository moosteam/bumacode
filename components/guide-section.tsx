'use client'

import { Clock, FolderUp, Download } from "lucide-react";

const guideItemTitle = "text-sm font-semibold text-black mb-[1px]";

export default function GuideSection() {
  return (
    <div className="bg-gray-50 border rounded-xl p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-1.5 mb-4">
        사용 가이드
      </h2>

      <div className="space-y-3.5 text-gray-700 text-sm leading-snug">
        <div className="flex items-start gap-2.5">
          <Clock className="w-5 h-5 mt-0.5 text-blue-600" />
          <div>
            <h3 className={guideItemTitle}>시간 제한</h3>
            <p>공유한 코드는 20분 동안만 리스트에 등록됩니다. ※ 20분이 지나면 데이터베이스에서 사라집니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <FolderUp className="w-5 h-5 mt-0.5 text-green-600" />
          <div>
            <h3 className={guideItemTitle}>ZIP 파일 업로드</h3>
            <p>ZIP 파일을 업로드하면 폴더 구조가 자동으로 표시되며, 각 파일의 내용을 확인할 수 있습니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Download className="w-5 h-5 mt-0.5 text-yellow-600" />
          <div>
            <h3 className={guideItemTitle}>코드 복사 및 다운로드</h3>
            <p>모든 코드는 개별 파일 또는 전체 ZIP 파일로 다운로드할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
