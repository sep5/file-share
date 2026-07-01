/**
 * FileList 컴포넌트 - 파일 카드 그리드 목록
 *
 * Props:
 * @param {Array}    files       - 파일 객체 배열 [Required]
 * @param {boolean}  isLoading   - 로딩 상태 [Required]
 * @param {function} onDelete    - 삭제 핸들러 [Required]
 * @param {function} onRefresh   - 새로고침 핸들러 [Required]
 * @param {string}   searchQuery - 현재 검색어 (빈 상태 메시지 분기용) [Optional, 기본값: '']
 *
 * Example usage:
 * <FileList files={files} isLoading={false} onDelete={handleDelete} onRefresh={fetchFiles} />
 */
import { Box, Grid, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FileCard from './FileCard';

function FileList({ files, isLoading, onDelete, onRefresh, searchQuery = '' }) {
  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography variant='h3' sx={{ color: '#1E293B' }}>
          파일 목록
          {files.length > 0 && (
            <Typography component='span' variant='body2' color='text.secondary' sx={{ ml: 1 }}>
              {files.length}개
            </Typography>
          )}
        </Typography>
        <Tooltip title='새로고침'>
          <IconButton onClick={onRefresh} disabled={isLoading} size='small'>
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 로딩 */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={36} />
        </Box>
      ) : files.length === 0 ? (
        /* 빈 상태 UI — 검색 결과 없음 vs 파일 없음 분기 */
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 10,
            gap: 2,
            bgcolor: '#FFFFFF',
            borderRadius: 3,
            border: '1px dashed #CBD5E1',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#93C5FD',
            }}
          >
            {searchQuery ? (
              <SearchOffIcon sx={{ fontSize: 36 }} />
            ) : (
              <FolderOpenIcon sx={{ fontSize: 36 }} />
            )}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            {searchQuery ? (
              <>
                <Typography variant='h4' color='text.primary' sx={{ mb: 0.5 }}>
                  검색 결과가 없습니다.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  &apos;{searchQuery}&apos;와 일치하는 파일을 찾지 못했습니다.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant='h4' color='text.primary' sx={{ mb: 0.5 }}>
                  아직 업로드된 파일이 없습니다.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  파일을 업로드하면 이곳에 목록이 표시됩니다.
                </Typography>
              </>
            )}
          </Box>
        </Box>
      ) : (
        /* 파일 그리드 */
        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
              <FileCard file={file} onDelete={onDelete} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FileList;
