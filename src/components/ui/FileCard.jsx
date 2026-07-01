/**
 * FileCard 컴포넌트 - 파일 정보 카드
 *
 * Props:
 * @param {Object}   file           - 파일 객체 { id, file_name, file_url, file_size, file_type, category, uploaded_at } [Required]
 * @param {function} onDelete       - 삭제 핸들러 (id: string) => void [Optional]
 *
 * Example usage:
 * <FileCard file={fileObj} onDelete={handleDelete} />
 */
import {
  Card, CardContent, CardActions,
  Box, Typography, Chip, IconButton, Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import PaletteIcon from '@mui/icons-material/Palette';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { formatSize } from '../../utils/formatSize';
import { CATEGORY_LABELS } from '../../utils/categorize';

const CATEGORY_STYLE = {
  image:  { icon: <ImageIcon />,           bg: '#F5F3FF', color: '#7C3AED', chipBg: '#EDE9FE', chipColor: '#6D28D9' },
  doc:    { icon: <DescriptionIcon />,     bg: '#EFF6FF', color: '#2563EB', chipBg: '#DBEAFE', chipColor: '#1D4ED8' },
  zip:    { icon: <FolderZipIcon />,       bg: '#FFFBEB', color: '#D97706', chipBg: '#FEF3C7', chipColor: '#B45309' },
  design: { icon: <PaletteIcon />,         bg: '#FFF1F5', color: '#DB2777', chipBg: '#FCE7F3', chipColor: '#BE185D' },
  other:  { icon: <InsertDriveFileIcon />, bg: '#F8FAFC', color: '#475569', chipBg: '#F1F5F9', chipColor: '#475569' },
};

function FileCard({ file, onDelete }) {
  const style = CATEGORY_STYLE[file.category] ?? CATEGORY_STYLE.other;
  const dateLabel = file.uploaded_at
    ? new Date(file.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  const handleDownload = async () => {
    try {
      const res = await fetch(file.file_url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      /* CORS 제한 시 a 태그 직접 클릭으로 fallback */
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.file_name;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card
      sx={{
        border: '1px solid transparent',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: '#3B82F6' },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* 파일 아이콘 */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: style.bg,
            color: style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {style.icon}
        </Box>

        {/* 파일명 */}
        <Tooltip title={file.file_name} placement='top'>
          <Typography
            variant='h4'
            noWrap
            sx={{ color: '#1E293B', mb: 0.5, lineHeight: 1.3 }}
          >
            {file.file_name}
          </Typography>
        </Tooltip>

        {/* 크기 + 날짜 */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Typography variant='caption' color='text.secondary'>
            {formatSize(file.file_size)}
          </Typography>
          <Typography variant='caption' sx={{ color: '#CBD5E1' }}>·</Typography>
          <Typography variant='caption' color='text.secondary'>
            {dateLabel}
          </Typography>
        </Box>

        {/* 카테고리 태그 */}
        <Chip
          label={CATEGORY_LABELS[file.category] ?? '기타'}
          size='small'
          sx={{
            bgcolor: style.chipBg,
            color: style.chipColor,
            border: 'none',
            height: 22,
          }}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 1.5 }}>
        {onDelete && (
          <Tooltip title='삭제'>
            <IconButton
              size='small'
              onClick={() => onDelete(file.id, file.file_path)}
              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
            >
              <DeleteOutlineIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title='다운로드'>
          <IconButton
            size='small'
            onClick={handleDownload}
            sx={{
              color: '#FFFFFF',
              bgcolor: '#3B82F6',
              '&:hover': { bgcolor: '#2563EB' },
              width: 32,
              height: 32,
            }}
          >
            <DownloadIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default FileCard;
