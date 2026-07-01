/**
 * GuestbookPage - 방명록 페이지
 * 작성(닉네임+내용+비밀번호 설정) / 수정·삭제(비밀번호 확인) 기능 포함
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Button, Typography, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, IconButton,
  Snackbar, Alert,
} from '@mui/material';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/hashPassword';
import Header from '../components/common/Header';
import GuestbookCard from '../components/ui/GuestbookCard';

const DIALOG_CONFIG = {
  write:  { title: '방명록 작성', submit: '작성하기' },
  edit:   { title: '내용 수정',   submit: '수정하기' },
  delete: { title: '항목 삭제',   submit: '삭제하기' },
};

function GuestbookPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* 다이얼로그 */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [targetEntry, setTargetEntry] = useState(null);

  /* 폼 필드 */
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [fieldErr, setFieldErr] = useState({});
  const [pwErr, setPwErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (msg, severity = 'success') =>
    setSnackbar({ open: true, message: msg, severity });

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, nickname, message, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) showSnackbar('방명록을 불러오지 못했습니다.', 'error');
    else setEntries(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const openDialog = (mode, entry = null) => {
    setDialogMode(mode);
    setTargetEntry(entry);
    setNickname('');
    setMessage(mode === 'edit' ? (entry?.message ?? '') : '');
    setPassword('');
    setShowPw(false);
    setFieldErr({});
    setPwErr('');
    setDialogOpen(true);
  };

  const closeDialog = () => { if (!isSubmitting) setDialogOpen(false); };

  const validate = () => {
    const errs = {};
    if (dialogMode === 'write') {
      if (!nickname.trim())               errs.nickname = '닉네임을 입력하세요.';
      else if (nickname.trim().length > 20) errs.nickname = '닉네임은 20자 이하로 입력하세요.';
    }
    if (dialogMode === 'write' || dialogMode === 'edit') {
      if (!message.trim())                errs.message = '내용을 입력하세요.';
      else if (message.trim().length > 500) errs.message = '내용은 500자 이하로 입력하세요.';
    }
    if (!password) errs.password = '비밀번호를 입력하세요.';
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setPwErr('');

    const hash = await hashPassword(password);

    /* 작성 */
    if (dialogMode === 'write') {
      const { error } = await supabase.from('guestbook').insert({
        nickname:      nickname.trim(),
        message:       message.trim(),
        password_hash: hash,
      });
      if (error) showSnackbar('작성에 실패했습니다.', 'error');
      else { setDialogOpen(false); showSnackbar('방명록에 작성되었습니다!'); fetchEntries(); }
      setIsSubmitting(false);
      return;
    }

    /* 수정·삭제: 서버에서 hash 조회 후 비교 */
    const { data: stored, error: fetchErr } = await supabase
      .from('guestbook')
      .select('password_hash')
      .eq('id', targetEntry.id)
      .single();

    if (fetchErr || !stored) {
      showSnackbar('데이터 조회에 실패했습니다.', 'error');
      setIsSubmitting(false);
      return;
    }

    if (hash !== stored.password_hash) {
      setPwErr('비밀번호가 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }

    if (dialogMode === 'edit') {
      const { error } = await supabase
        .from('guestbook')
        .update({ message: message.trim(), updated_at: new Date().toISOString() })
        .eq('id', targetEntry.id);
      if (error) showSnackbar('수정에 실패했습니다.', 'error');
      else { setDialogOpen(false); showSnackbar('수정되었습니다.'); fetchEntries(); }
    }

    if (dialogMode === 'delete') {
      const { error } = await supabase.from('guestbook').delete().eq('id', targetEntry.id);
      if (error) showSnackbar('삭제에 실패했습니다.', 'error');
      else { setDialogOpen(false); showSnackbar('삭제되었습니다.'); fetchEntries(); }
    }

    setIsSubmitting(false);
  };

  const pwSlotProps = {
    input: {
      endAdornment: (
        <InputAdornment position='end'>
          <IconButton size='small' onClick={() => setShowPw((v) => !v)} edge='end'>
            {showPw ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
          </IconButton>
        </InputAdornment>
      ),
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Box sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth='md'>

          {/* 페이지 타이틀 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant='h2' sx={{ color: '#1E293B', mb: 0.5 }}>방명록</Typography>
              <Typography variant='body2' color='text.secondary'>
                방문 기념으로 한 마디 남겨주세요.
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<AddCommentOutlinedIcon />}
              onClick={() => openDialog('write')}
              sx={{ px: 3, py: 1, whiteSpace: 'nowrap' }}
            >
              방명록 작성
            </Button>
          </Box>

          {/* 방명록 목록 */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={36} />
            </Box>
          ) : entries.length === 0 ? (
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              py: 10, gap: 2, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px dashed #CBD5E1',
            }}>
              <AddCommentOutlinedIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='text.primary' sx={{ mb: 0.5 }}>
                  아직 방명록이 없습니다.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  첫 번째로 방명록을 작성해보세요!
                </Typography>
              </Box>
            </Box>
          ) : (
            entries.map((entry) => (
              <GuestbookCard
                key={entry.id}
                entry={entry}
                onEdit={() => openDialog('edit', entry)}
                onDelete={() => openDialog('delete', entry)}
              />
            ))
          )}
        </Container>
      </Box>

      {/* 작성 / 수정 / 삭제 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialogMode ? DIALOG_CONFIG[dialogMode].title : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>

          {/* 닉네임 - 작성만 */}
          {dialogMode === 'write' && (
            <TextField
              fullWidth autoFocus
              label='닉네임'
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={!!fieldErr.nickname}
              helperText={fieldErr.nickname ?? `${nickname.length}/20`}
              inputProps={{ maxLength: 20 }}
              sx={{ mb: 2, mt: 0.5 }}
              size='small'
            />
          )}

          {/* 내용 - 작성·수정 */}
          {(dialogMode === 'write' || dialogMode === 'edit') && (
            <TextField
              fullWidth multiline rows={4}
              label='내용'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={!!fieldErr.message}
              helperText={fieldErr.message ?? `${message.length}/500`}
              inputProps={{ maxLength: 500 }}
              sx={{ mb: 2 }}
              size='small'
            />
          )}

          {/* 삭제 확인 문구 */}
          {dialogMode === 'delete' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#FEF2F2', borderRadius: 2 }}>
              <Typography variant='body2' color='error'>
                <strong>{targetEntry?.nickname}</strong>님의 방명록을 삭제합니다.
                삭제 후 복구할 수 없습니다.
              </Typography>
            </Box>
          )}

          {/* 비밀번호 */}
          <TextField
            fullWidth
            label={dialogMode === 'write' ? '비밀번호 설정' : '비밀번호 확인'}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwErr(''); }}
            error={!!fieldErr.password || !!pwErr}
            helperText={
              pwErr || fieldErr.password ||
              (dialogMode === 'write' ? '수정·삭제 시 이 비밀번호가 필요합니다.' : '')
            }
            slotProps={pwSlotProps}
            size='small'
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} disabled={isSubmitting} color='inherit'>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant='contained'
            color={dialogMode === 'delete' ? 'error' : 'primary'}
          >
            {isSubmitting ? '처리 중...' : (dialogMode ? DIALOG_CONFIG[dialogMode].submit : '')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
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

export default GuestbookPage;
