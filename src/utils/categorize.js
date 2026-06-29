const EXT_MAP = {
  image:  ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff','avif','heic'],
  doc:    ['pdf','doc','docx','txt','xls','xlsx','ppt','pptx','hwp','hwpx','md','csv','rtf','odt','ods'],
  zip:    ['zip','rar','7z','tar','gz','bz2','xz','zst','lz4'],
  design: ['psd','ai','fig','sketch','xd','indd','eps','afdesign','afphoto','afpub'],
};

/**
 * 파일 확장자를 기반으로 카테고리를 반환합니다.
 * @param {string} fileName - 파일명
 * @returns {'image'|'doc'|'zip'|'design'|'other'} 카테고리
 */
export function getCategory(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  for (const [cat, exts] of Object.entries(EXT_MAP)) {
    if (exts.includes(ext)) return cat;
  }
  return 'other';
}

export const CATEGORY_LABELS = {
  all:    '전체 보기',
  image:  '이미지',
  doc:    '문서',
  zip:    '압축파일',
  design: '디자인 리소스',
  other:  '기타',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);
