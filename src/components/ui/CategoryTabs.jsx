/**
 * CategoryTabs 컴포넌트 - 카테고리 필터 탭
 *
 * Props:
 * @param {string}   activeCategory  - 현재 선택된 카테고리 키 [Required]
 * @param {function} onCategoryChange - 탭 변경 핸들러 (category: string) => void [Required]
 * @param {Object}   counts          - 카테고리별 파일 수 { all, image, doc, ... } [Required]
 *
 * Example usage:
 * <CategoryTabs activeCategory="all" onCategoryChange={setCategory} counts={counts} />
 */
import { Box, Tabs, Tab, Container } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import PaletteIcon from '@mui/icons-material/Palette';
import AppsIcon from '@mui/icons-material/Apps';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const TAB_CONFIG = [
  { key: 'all',    label: '전체 보기',     icon: <AppsIcon fontSize='small' /> },
  { key: 'image',  label: '이미지',        icon: <ImageIcon fontSize='small' /> },
  { key: 'doc',    label: '문서',          icon: <DescriptionIcon fontSize='small' /> },
  { key: 'zip',    label: '압축파일',      icon: <FolderZipIcon fontSize='small' /> },
  { key: 'design', label: '디자인 리소스', icon: <PaletteIcon fontSize='small' /> },
  { key: 'other',  label: '기타',          icon: <MoreHorizIcon fontSize='small' /> },
];

function CategoryTabs({ activeCategory, onCategoryChange, counts }) {
  const activeIndex = TAB_CONFIG.findIndex((t) => t.key === activeCategory);

  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <Container maxWidth='lg'>
        <Tabs
          value={activeIndex === -1 ? 0 : activeIndex}
          onChange={(_, idx) => onCategoryChange(TAB_CONFIG[idx].key)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            '& .MuiTab-root': { color: '#64748B', minWidth: 'auto', px: 2.5 },
            '& .Mui-selected': { color: '#3B82F6', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#3B82F6', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          {TAB_CONFIG.map((tab) => {
            const count = counts?.[tab.key] ?? 0;
            const label = count > 0 ? `${tab.label} (${count})` : tab.label;
            return (
              <Tab
                key={tab.key}
                label={label}
                icon={tab.icon}
                iconPosition='start'
                sx={{ gap: 0.5 }}
              />
            );
          })}
        </Tabs>
      </Container>
    </Box>
  );
}

export default CategoryTabs;
