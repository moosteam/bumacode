'use client'

import { Clock, FolderUp, Download } from "lucide-react";

export default function GuideSection() {
  return (
    <div className="bg-gray-50 border rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-5">
        사용 가이드
      </h2>

      <div className="space-y-5 text-gray-700 text-sm leading-relaxed">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 mt-1 text-blue-600" />
          <div>
            <h3 className="text-base font-semibold mb-[2px]">시간 제한</h3>
            <p>공유한 코드는 20분 동안만 리스트에 등록됩니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FolderUp className="w-5 h-5 mt-1 text-green-600" />
          <div>
            <h3 className="text-base font-semibold mb-[2px]">ZIP 파일 업로드</h3>
            <p>
              ZIP 파일을 업로드하면 폴더 구조가 자동으로 표시되며, 각 파일의 내용을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 mt-1 text-yellow-600" />
          <div>
            <h3 className="text-base font-semibold mb-[2px]">코드 복사 및 다운로드</h3>
            <p>
              모든 코드는 개별 파일 또는 전체 ZIP 파일로 다운로드할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
