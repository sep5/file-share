/**
 * Header 컴포넌트 - 사이트 상단 헤더
 *
 * Props:
 * @param {number} totalCount - 전체 파일 수 [Required]
 *
 * Example usage:
 * <Header totalCount={42} />
 */
import { Box, Container, Typography, Chip } from '@mui/material';
import FolderSharedIcon from '@mui/icons-material/FolderShared';

function Header({ totalCount }) {
  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth='lg'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6',
              flexShrink: 0,
            }}
          >
            <FolderSharedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant='h2' sx={{ color: '#1E293B', lineHeight: 1.2 }}>
              FileShare
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              안전하고 빠른 파일 공유 서비스
            </Typography>
          </Box>
          {totalCount > 0 && (
            <Chip
              label={`${totalCount}개 파일`}
              size='small'
              sx={{
                bgcolor: '#EFF6FF',
                color: '#3B82F6',
                fontWeight: 600,
                ml: 'auto',
              }}
            />
          )}
        </Box>
        <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 560 }}>
          파일을 업로드하고 링크로 공유하세요. 이미지, 문서, 압축파일 등 모든 형식을 지원합니다.
        </Typography>
      </Container>
    </Box>
  );
}

export default Header;
