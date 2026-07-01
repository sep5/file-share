import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import { supabase } from './lib/supabase';
import { CATEGORIES } from './utils/categorize';
import Header from './components/common/Header';
import CategoryTabs from './components/ui/CategoryTabs';
import FileUploader from './components/ui/FileUploader';
import FileList from './components/ui/FileList';
import SearchBar from './components/ui/SearchBar';

function App() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      showSnackbar('파일 목록을 불러오지 못했습니다.', 'error');
    } else {
      setFiles(data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (id, filePath) => {
    const { error: storageErr } = await supabase.storage
      .from('shared-files')
      .remove([filePath]);

    if (storageErr) {
      showSnackbar('파일 삭제에 실패했습니다.', 'error');
      return;
    }

    const { error: dbErr } = await supabase.from('files').delete().eq('id', id);
    if (dbErr) {
      showSnackbar('메타데이터 삭제에 실패했습니다.', 'error');
      return;
    }

    showSnackbar('파일이 삭제되었습니다.');
    fetchFiles();
  };

  /* 카테고리별 파일 수 */
  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'all' ? files.length : files.filter((f) => f.category === cat).length;
    return acc;
  }, {});

  /* 카테고리 + 검색어 복합 필터 */
  const filteredFiles = files
    .filter((f) => activeCategory === 'all' || f.category === activeCategory)
    .filter((f) => !searchQuery || f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <Header totalCount={files.length} />

      {/* 카테고리 탭 */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={counts}
      />

      {/* 메인 콘텐츠 */}
      <Box sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth='lg'>
          {/* 파일 업로더 */}
          <Box sx={{ mb: 5 }}>
            <FileUploader
              onUploadSuccess={() => {
                showSnackbar('업로드가 완료되었습니다.');
                fetchFiles();
              }}
              onError={(msg) => showSnackbar(msg, 'error')}
            />
          </Box>

          {/* 검색창 */}
          <Box sx={{ mb: 3 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </Box>

          {/* 파일 목록 */}
          <FileList
            files={filteredFiles}
            isLoading={isLoading}
            onDelete={handleDelete}
            onRefresh={fetchFiles}
            searchQuery={searchQuery}
          />
        </Container>
      </Box>

      {/* 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
