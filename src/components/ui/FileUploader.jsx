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
  List, ListItem, ListItemIcon, ListItemText, Chip,
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
    const filePath = `${Date.now()}_${file.name}`;
    updateItem(idx, { status: 'uploading', progress: 10 });

    const { error: storageErr } = await supabase.storage
      .from('shared-files')
      .upload(filePath, file, { upsert: false });

    if (storageErr) {
      updateItem(idx, { status: 'error', progress: 0 });
      return false;
    }

    updateItem(idx, { progress: 70 });

    const { data: urlData } = supabase.storage
      .from('shared-files')
      .getPublicUrl(filePath);

    const { error: dbErr } = await supabase.from('files').insert({
      file_name: file.name,
      file_url:  urlData.publicUrl,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      category:  getCategory(file.name),
    });

    if (dbErr) {
      updateItem(idx, { status: 'error', progress: 0 });
      return false;
    }

    updateItem(idx, { status: 'done', progress: 100 });
    return true;
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const items = files.map((f) => ({ file: f, status: 'pending', progress: 0 }));
    setUploadItems(items);
    setIsUploading(true);

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const ok = await uploadSingle(files[i], i);
      if (ok) successCount++;
    }

    setIsUploading(false);
    if (successCount > 0) onUploadSuccess();
    if (successCount < files.length)
      onError(`${files.length - successCount}개 파일 업로드에 실패했습니다.`);

    setTimeout(() => setUploadItems([]), 3000);
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
                        <ErrorIcon sx={{ fontSize: 16, color: '#EF4444' }} />
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
