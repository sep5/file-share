/**
 * GuestbookCard 컴포넌트 - 방명록 항목 카드 (댓글 기능 포함)
 *
 * Props:
 * @param {Object}   entry    - { id, nickname, message, created_at, updated_at } [Required]
 * @param {function} onEdit   - 수정 버튼 클릭 핸들러 [Required]
 * @param {function} onDelete - 삭제 버튼 클릭 핸들러 [Required]
 *
 * Example usage:
 * <GuestbookCard entry={entry} onEdit={() => openEdit(entry)} onDelete={() => openDelete(entry)} />
 */
import { useState } from 'react';
import {
  Card, CardContent, CardActions, Collapse, Divider,
  Box, Typography, Avatar, IconButton, Tooltip,
  TextField, Button, CircularProgress,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { supabase } from '../../lib/supabase';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

function getAvatarColor(nickname) {
  return AVATAR_COLORS[(nickname ?? 'A').charCodeAt(0) % AVATAR_COLORS.length];
}

const COMMENT_INIT = { nickname: '', message: '' };

function GuestbookCard({ entry, onEdit, onDelete }) {
  const color = getAvatarColor(entry.nickname);
  const isEdited =
    entry.updated_at &&
    entry.created_at &&
    new Date(entry.updated_at).getTime() - new Date(entry.created_at).getTime() > 1000;

  const dateStr = new Date(isEdited ? entry.updated_at : entry.created_at).toLocaleDateString(
    'ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }
  );

  /* ── 댓글 상태 ── */
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState(COMMENT_INIT);
  const [commentErr, setCommentErr] = useState({});
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const loadComments = async () => {
    setCommentsLoading(true);
    const { data } = await supabase
      .from('guestbook_comments')
      .select('id, nickname, message, created_at')
      .eq('guestbook_id', entry.id)
      .order('created_at', { ascending: true });
    const loaded = data ?? [];
    setComments(loaded);
    setCommentCount(loaded.length);
    setCommentsLoading(false);
  };

  const handleToggleComments = () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && commentCount === null) loadComments();
  };

  const handleAddComment = async () => {
    const errs = {};
    if (!commentForm.nickname.trim())               errs.nickname = '닉네임을 입력하세요.';
    else if (commentForm.nickname.trim().length > 20) errs.nickname = '20자 이하로 입력하세요.';
    if (!commentForm.message.trim())                errs.message = '댓글을 입력하세요.';
    else if (commentForm.message.trim().length > 300) errs.message = '300자 이하로 입력하세요.';
    setCommentErr(errs);
    if (Object.keys(errs).length > 0) return;

    setIsCommentSubmitting(true);
    const { error } = await supabase.from('guestbook_comments').insert({
      guestbook_id: entry.id,
      nickname:     commentForm.nickname.trim(),
      message:      commentForm.message.trim(),
    });
    if (!error) {
      setCommentForm(COMMENT_INIT);
      setCommentErr({});
      await loadComments();
    }
    setIsCommentSubmitting(false);
  };

  const commentDateStr = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid transparent',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: '#3B82F6' },
      }}
    >
      {/* ── 본문 ── */}
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
          variant='body1' color='text.primary'
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word' }}
        >
          {entry.message}
        </Typography>
      </CardContent>

      {/* ── 액션 버튼 ── */}
      <CardActions sx={{ px: 1.5, pb: 1, pt: 0 }}>
        {/* 댓글 토글 (왼쪽) */}
        <Button
          size='small'
          startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: '16px !important' }} />}
          onClick={handleToggleComments}
          sx={{
            color:      commentsOpen ? '#3B82F6' : '#64748B',
            fontWeight: commentsOpen ? 700 : 400,
            fontSize:   '0.72rem',
            py: 0.5,
            '&:hover': { bgcolor: 'transparent', color: '#3B82F6' },
          }}
        >
          {commentsOpen
            ? '댓글 닫기'
            : commentCount !== null
            ? `댓글 ${commentCount}개`
            : '댓글 달기'}
        </Button>

        {/* 수정·삭제 (오른쪽) */}
        <Box sx={{ ml: 'auto', display: 'flex' }}>
          <Tooltip title='수정'>
            <IconButton size='small' onClick={onEdit} sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}>
              <EditOutlinedIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='삭제'>
            <IconButton size='small' onClick={onDelete} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
              <DeleteOutlinedIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      {/* ── 댓글 섹션 (Collapse) ── */}
      <Collapse in={commentsOpen}>
        <Divider />
        <Box sx={{ px: 2, pt: 2, pb: 2, bgcolor: '#F8FAFC' }}>

          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            <>
              {/* 댓글 목록 */}
              {comments.map((c) => (
                <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      width: 28, height: 28, fontSize: '0.72rem', fontWeight: 700,
                      bgcolor: getAvatarColor(c.nickname), flexShrink: 0,
                    }}
                  >
                    {c.nickname[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, bgcolor: '#FFFFFF', borderRadius: 2, px: 1.5, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant='caption' fontWeight={600}>{c.nickname}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {commentDateStr(c.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant='body2' sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
                      {c.message}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* 댓글 입력 폼 */}
              <Box sx={{ pt: comments.length > 0 ? 1 : 0 }}>
                <TextField
                  fullWidth size='small' placeholder='닉네임 (최대 20자)'
                  value={commentForm.nickname}
                  onChange={(e) => setCommentForm((f) => ({ ...f, nickname: e.target.value }))}
                  error={!!commentErr.nickname}
                  helperText={commentErr.nickname}
                  inputProps={{ maxLength: 20 }}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth size='small' placeholder='댓글을 입력하세요... (최대 300자)'
                    value={commentForm.message}
                    onChange={(e) => setCommentForm((f) => ({ ...f, message: e.target.value }))}
                    error={!!commentErr.message}
                    helperText={commentErr.message}
                    inputProps={{ maxLength: 300 }}
                    multiline maxRows={4}
                  />
                  <Button
                    variant='contained' size='small'
                    onClick={handleAddComment}
                    disabled={isCommentSubmitting}
                    sx={{ alignSelf: 'flex-start', mt: 0.125, minWidth: 52, height: 38, flexShrink: 0 }}
                  >
                    등록
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}

export default GuestbookCard;
