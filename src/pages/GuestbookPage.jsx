/**
 * GuestbookPage - 방명록 페이지
 * 상단 작성 폼 상시 노출 / 수정·삭제는 비밀번호 확인 다이얼로그
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Paper, Button, Typography, CircularProgress, Grid,
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

const WRITE_INIT = { nickname: '', message: '', password: '' };

function GuestbookPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ── 상단 작성 폼 ── */
  const [writeForm, setWriteForm] = useState(WRITE_INIT);
  const [writeErr, setWriteErr] = useState({});
  const [showWritePw, setShowWritePw] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  /* ── 수정·삭제 다이얼로그 ── */
  const [dialog, setDialog] = useState({ open: false, mode: null, entry: null });
  const [editMessage, setEditMessage] = useState('');
  const [dialogPw, setDialogPw] = useState('');
  const [showDialogPw, setShowDialogPw] = useState(false);
  const [dialogPwErr, setDialogPwErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── 알림 ── */
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

  /* ── 작성 ── */
  const handleWriteChange = (field) => (e) =>
    setWriteForm((f) => ({ ...f, [field]: e.target.value }));

  const validateWrite = () => {
    const errs = {};
    if (!writeForm.nickname.trim())               errs.nickname = '닉네임을 입력하세요.';
    else if (writeForm.nickname.trim().length > 20) errs.nickname = '20자 이하로 입력하세요.';
    if (!writeForm.message.trim())                errs.message = '내용을 입력하세요.';
    else if (writeForm.message.trim().length > 500) errs.message = '500자 이하로 입력하세요.';
    if (!writeForm.password)                       errs.password = '비밀번호를 입력하세요.';
    setWriteErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWrite = async () => {
    if (!validateWrite()) return;
    setIsWriting(true);
    const hash = await hashPassword(writeForm.password);
    const { error } = await supabase.from('guestbook').insert({
      nickname:      writeForm.nickname.trim(),
      message:       writeForm.message.trim(),
      password_hash: hash,
    });
    if (error) {
      showSnackbar('작성에 실패했습니다.', 'error');
    } else {
      setWriteForm(WRITE_INIT); // 폼 초기화 후 유지
      setWriteErr({});
      showSnackbar('방명록에 작성되었습니다!');
      fetchEntries();
    }
    setIsWriting(false);
  };

  /* ── 수정·삭제 다이얼로그 ── */
  const openDialog = (mode, entry) => {
    setDialog({ open: true, mode, entry });
    setEditMessage(mode === 'edit' ? entry.message : '');
    setDialogPw('');
    setShowDialogPw(false);
    setDialogPwErr('');
  };

  const closeDialog = () => { if (!isSubmitting) setDialog((d) => ({ ...d, open: false })); };

  const handleDialogSubmit = async () => {
    if (!dialogPw) { setDialogPwErr('비밀번호를 입력하세요.'); return; }
    setIsSubmitting(true);
    setDialogPwErr('');

    const hash = await hashPassword(dialogPw);
    const { data: stored } = await supabase
      .from('guestbook').select('password_hash').eq('id', dialog.entry.id).single();

    if (!stored || hash !== stored.password_hash) {
      setDialogPwErr('비밀번호가 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }

    if (dialog.mode === 'edit') {
      const { error } = await supabase
        .from('guestbook')
        .update({ message: editMessage.trim(), updated_at: new Date().toISOString() })
        .eq('id', dialog.entry.id);
      if (error) showSnackbar('수정에 실패했습니다.', 'error');
      else { closeDialog(); showSnackbar('수정되었습니다.'); fetchEntries(); }
    }

    if (dialog.mode === 'delete') {
      const { error } = await supabase.from('guestbook').delete().eq('id', dialog.entry.id);
      if (error) showSnackbar('삭제에 실패했습니다.', 'error');
      else { closeDialog(); showSnackbar('삭제되었습니다.'); fetchEntries(); }
    }
    setIsSubmitting(false);
  };

  const pwAdornment = (show, toggle) => ({
    input: {
      endAdornment: (
        <InputAdornment position='end'>
          <IconButton size='small' onClick={toggle} edge='end'>
            {show ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
          </IconButton>
        </InputAdornment>
      ),
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Box sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth='md'>

          {/* 페이지 타이틀 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='h2' sx={{ color: '#1E293B', mb: 0.5 }}>방명록</Typography>
            <Typography variant='body2' color='text.secondary'>
              방문 기념으로 한 마디 남겨주세요.
            </Typography>
          </Box>

          {/* ── 작성 폼 (항상 노출) ── */}
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
          >
            <Typography variant='h4' sx={{ color: '#1E293B', mb: 2 }}>방명록 작성</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth size='small' label='닉네임'
                  value={writeForm.nickname}
                  onChange={handleWriteChange('nickname')}
                  error={!!writeErr.nickname}
                  helperText={writeErr.nickname ?? `${writeForm.nickname.length}/20`}
                  inputProps={{ maxLength: 20 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth size='small' label='비밀번호 설정'
                  type={showWritePw ? 'text' : 'password'}
                  value={writeForm.password}
                  onChange={handleWriteChange('password')}
                  error={!!writeErr.password}
                  helperText={writeErr.password ?? '수정·삭제 시 필요합니다.'}
                  slotProps={pwAdornment(showWritePw, () => setShowWritePw((v) => !v))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth multiline rows={3} size='small' label='내용'
                  value={writeForm.message}
                  onChange={handleWriteChange('message')}
                  error={!!writeErr.message}
                  helperText={writeErr.message ?? `${writeForm.message.length}/500`}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant='contained'
                startIcon={<AddCommentOutlinedIcon />}
                onClick={handleWrite}
                disabled={isWriting}
              >
                {isWriting ? '작성 중...' : '작성하기'}
              </Button>
            </Box>
          </Paper>

          {/* ── 방명록 목록 ── */}
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

      {/* ── 수정·삭제 다이얼로그 ── */}
      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog.mode === 'edit' ? '내용 수정' : '항목 삭제'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {dialog.mode === 'edit' && (
            <TextField
              fullWidth multiline rows={4} size='small' label='내용'
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${editMessage.length}/500`}
              sx={{ mb: 2, mt: 0.5 }}
            />
          )}
          {dialog.mode === 'delete' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#FEF2F2', borderRadius: 2 }}>
              <Typography variant='body2' color='error'>
                <strong>{dialog.entry?.nickname}</strong>님의 방명록을 삭제합니다.
                삭제 후 복구할 수 없습니다.
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth size='small' label='비밀번호 확인'
            type={showDialogPw ? 'text' : 'password'}
            value={dialogPw}
            onChange={(e) => { setDialogPw(e.target.value); setDialogPwErr(''); }}
            error={!!dialogPwErr}
            helperText={dialogPwErr}
            slotProps={pwAdornment(showDialogPw, () => setShowDialogPw((v) => !v))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDialogSubmit(); }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} disabled={isSubmitting} color='inherit'>취소</Button>
          <Button
            onClick={handleDialogSubmit}
            disabled={isSubmitting}
            variant='contained'
            color={dialog.mode === 'delete' ? 'error' : 'primary'}
          >
            {isSubmitting ? '처리 중...' : dialog.mode === 'edit' ? '수정하기' : '삭제하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 알림 ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GuestbookPage;
