/**
 * FileUploader 컴포넌트 - 드래그앤드롭 + 파일 선택 업로드
 *
 * Props:
 * @param {function} onUploadSuccess - 업로드 성공 후 콜백 [Required]
 * @param {function} onError         - 에러 발생 시 콜백 (message: string) => void [Required]
 *
 * Example usage:
 * <FileUploader onUploadSuccess={fetchFiles} onError={showError} />
 */
import { useState, useRef } from 'react';
import {
  Box, Typography, Button, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Chip, Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { supabase } from '../../lib/supabase';
import { getCategory } from '../../utils/categorize';
import { formatSize } from '../../utils/formatSize';

function FileUploader({ onUploadSuccess, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadItems, setUploadItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const updateItem = (idx, patch) =>
    setUploadItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const uploadSingle = async (file, idx) => {
    const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'bin';
    const safePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    /* Content-Type: 비ASCII 방어 (일부 브라우저에서 비정상 MIME 반환 가능) */
    const rawType = typeof file.type === 'string' ? file.type : '';
    const contentType = /^[\x20-\x7E]+$/.test(rawType) && rawType.length > 0
      ? rawType
      : 'application/octet-stream';

    /* .trim(): GitHub Secrets 복붙 시 발생하는 trailing newline/CR 제거
       fetch Headers는 0x00·0x0A·0x0D 등 제어 문자를 허용하지 않음 */
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
    const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

    if (!supabaseUrl || !supabaseKey) {
      const msg = 'Supabase 환경변수 누락 — 관리자에게 문의하세요.';
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }

    /* 헤더 값 전체 ASCII 검증 — 비ASCII 문자가 있으면 조기 실패 */
    if (!/^[\x20-\x7E]+$/.test(supabaseKey)) {
      const msg = 'API 키에 비정상 문자 포함 — GitHub Secrets를 재설정해주세요.';
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }
    if (!/^[\x20-\x7E]+$/.test(supabaseUrl)) {
      const msg = 'Supabase URL에 비정상 문자 포함 — GitHub Secrets를 재설정해주세요.';
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }

    updateItem(idx, { status: 'uploading', progress: 10 });

    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (e) {
      const msg = '파일 읽기 실패: ' + (e.message ?? '');
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }

    let uploadOk = false;
    try {
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/shared-files/${safePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': contentType,
            'x-upsert': 'false',
          },
          body: buffer,
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = `${res.status} | ${body.message || body.error || res.statusText}`;
        updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
        return { ok: false, error: msg };
      }
      uploadOk = true;
    } catch (e) {
      const msg = `${e.name}: ${e.message}`;
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }

    updateItem(idx, { progress: 70 });

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/shared-files/${safePath}`;

    const { error: dbErr } = await supabase.from('files').insert({
      file_name: file.name,
      file_url:  publicUrl,
      file_path: safePath,
      file_size: file.size,
      file_type: contentType,
      category:  getCategory(file.name),
    });

    if (dbErr) {
      console.error('[DB] 메타데이터 저장 실패:', dbErr);
      if (uploadOk) {
        await fetch(
          `${supabaseUrl}/storage/v1/object/shared-files/${safePath}`,
          { method: 'DELETE', headers: { 'Authorization': `Bearer ${supabaseKey}` } }
        );
      }
      const msg = dbErr.message ?? '메타데이터 저장 실패';
      updateItem(idx, { status: 'error', progress: 0, errorMsg: msg });
      return { ok: false, error: msg };
    }

    updateItem(idx, { status: 'done', progress: 100 });
    return { ok: true };
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const items = files.map((f) => ({ file: f, status: 'pending', progress: 0 }));
    setUploadItems(items);
    setIsUploading(true);

    let successCount = 0;
    let lastError = '';
    for (let i = 0; i < files.length; i++) {
      const result = await uploadSingle(files[i], i);
      if (result.ok) {
        successCount++;
      } else {
        lastError = result.error ?? '';
      }
    }

    setIsUploading(false);
    if (successCount > 0) onUploadSuccess();
    if (successCount < files.length) {
      const failCount = files.length - successCount;
      const detail = lastError ? ` (${lastError})` : '';
      onError(`${failCount}개 파일 업로드에 실패했습니다.${detail}`);
      /* 에러 있을 때는 목록 유지, 성공만 있을 때 3초 후 제거 */
    } else {
      setTimeout(() => setUploadItems([]), 3000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      {/* 드롭존 */}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? '#3B82F6' : '#CBD5E1',
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          cursor: isUploading ? 'default' : 'pointer',
          bgcolor: isDragging ? '#EFF6FF' : '#FAFAFA',
          transition: 'all 0.2s',
          '&:hover': !isUploading
            ? { borderColor: '#3B82F6', bgcolor: '#EFF6FF' }
            : {},
        }}
      >
        <input
          ref={inputRef}
          type='file'
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#3B82F6', mb: 1.5, opacity: 0.6 }} />
            <Typography variant='h4' color='text.secondary'>
              업로드 중...
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '18px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
            </Box>
            <Typography variant='h3' sx={{ mb: 0.75 }}>
              파일을 드래그하거나 클릭하여 업로드
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
              이미지, 문서, 압축파일, 디자인 파일 등 모든 형식 지원 · 파일당 최대 500MB
            </Typography>
            <Button
              variant='contained'
              startIcon={<CloudUploadIcon />}
              sx={{ px: 3, py: 1 }}
            >
              파일 선택
            </Button>
          </Box>
        )}
      </Box>

      {/* 업로드 진행 목록 */}
      {uploadItems.length > 0 && (
        <Box
          sx={{
            mt: 2,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          <List disablePadding>
            {uploadItems.map((item, idx) => (
              <ListItem
                key={idx}
                divider={idx < uploadItems.length - 1}
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant='body2' noWrap sx={{ flex: 1, fontWeight: 500 }}>
                        {item.file.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {formatSize(item.file.size)}
                      </Typography>
                      {item.status === 'done' && (
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                      )}
                      {item.status === 'error' && (
                        <Tooltip title={item.errorMsg ?? '실패'} placement='top'>
                          <Chip
                            label={item.errorMsg ?? '실패'}
                            size='small'
                            icon={<ErrorIcon style={{ fontSize: 12 }} />}
                            sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#FEF2F2', color: '#EF4444', maxWidth: 320 }}
                          />
                        </Tooltip>
                      )}
                      {item.status === 'uploading' && (
                        <Chip label='업로드 중' size='small' sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#EFF6FF', color: '#3B82F6' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    item.status !== 'pending' && (
                      <LinearProgress
                        variant='determinate'
                        value={item.progress}
                        color={item.status === 'error' ? 'error' : 'primary'}
                        sx={{ borderRadius: 1, height: 4 }}
                      />
                    )
                  }
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

export default FileUploader;
