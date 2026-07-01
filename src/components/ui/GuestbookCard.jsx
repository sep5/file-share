/**
 * GuestbookCard 컴포넌트 - 방명록 항목 카드
 *
 * Props:
 * @param {Object}   entry    - { id, nickname, message, created_at, updated_at } [Required]
 * @param {function} onEdit   - 수정 버튼 클릭 핸들러 [Required]
 * @param {function} onDelete - 삭제 버튼 클릭 핸들러 [Required]
 *
 * Example usage:
 * <GuestbookCard entry={entry} onEdit={() => openEdit(entry)} onDelete={() => openDelete(entry)} />
 */
import { Card, CardContent, CardActions, Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

function getAvatarColor(nickname) {
  return AVATAR_COLORS[(nickname ?? 'A').charCodeAt(0) % AVATAR_COLORS.length];
}

function GuestbookCard({ entry, onEdit, onDelete }) {
  const color = getAvatarColor(entry.nickname);
  const isEdited =
    entry.updated_at &&
    entry.created_at &&
    new Date(entry.updated_at).getTime() - new Date(entry.created_at).getTime() > 1000;

  const dateStr = new Date(isEdited ? entry.updated_at : entry.created_at).toLocaleDateString(
    'ko-KR',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid transparent',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: '#3B82F6' },
      }}
    >
      <CardContent sx={{ pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: color, width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
            {(entry.nickname ?? '?')[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant='body2' fontWeight={600} color='text.primary'>
              {entry.nickname}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {dateStr}{isEdited ? ' · 수정됨' : ''}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant='body1'
          color='text.primary'
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word' }}
        >
          {entry.message}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 1.5, pb: 1 }}>
        <Tooltip title='수정'>
          <IconButton
            size='small'
            onClick={onEdit}
            sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}
          >
            <EditOutlinedIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        <Tooltip title='삭제'>
          <IconButton
            size='small'
            onClick={onDelete}
            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
          >
            <DeleteOutlineIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default GuestbookCard;
