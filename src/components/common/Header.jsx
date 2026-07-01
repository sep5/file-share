/**
 * Header 컴포넌트 - 사이트 상단 헤더 + 페이지 네비게이션
 *
 * Props:
 * @param {number} totalCount - 전체 파일 수 (파일공유 페이지용) [Optional]
 *
 * Example usage:
 * <Header totalCount={42} />
 * <Header />
 */
import { Box, Container, Typography, Chip, Button } from '@mui/material';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: '파일 공유', path: '/' },
  { label: '방명록',    path: '/guestbook' },
];

function Header({ totalCount }) {
  const location = useLocation();

  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', py: { xs: 2, md: 3 } }}>
      <Container maxWidth='lg'>

        {/* 로고 + 타이틀 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '12px', bgcolor: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B82F6', flexShrink: 0,
            }}
          >
            <FolderSharedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h2' sx={{ color: '#1E293B', lineHeight: 1.2 }}>
              FileShare
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              안전하고 빠른 파일 공유 서비스
            </Typography>
          </Box>
          {totalCount !== undefined && totalCount > 0 && (
            <Chip
              label={`${totalCount}개 파일`}
              size='small'
              sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', fontWeight: 600 }}
            />
          )}
        </Box>

        {/* 페이지 네비게이션 */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {NAV_ITEMS.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Button
                key={path}
                component={Link}
                to={path}
                size='small'
                disableRipple={isActive}
                sx={{
                  color:       isActive ? '#3B82F6' : '#64748B',
                  fontWeight:  isActive ? 700 : 400,
                  borderBottom: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                  borderRadius: 0,
                  px: 1.5,
                  py: 0.75,
                  minWidth: 0,
                  '&:hover': { bgcolor: 'transparent', color: '#3B82F6' },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default Header;
