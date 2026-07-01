/**
 * SearchBar 컴포넌트 - 파일명 검색 입력창
 *
 * Props:
 * @param {string}   value    - 검색어 [Required]
 * @param {function} onChange - 검색어 변경 핸들러 (value: string) => void [Required]
 *
 * Example usage:
 * <SearchBar value={searchQuery} onChange={setSearchQuery} />
 */
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      size='small'
      placeholder='파일명으로 검색...'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => onChange('')} edge='end'>
                <ClearIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          '& fieldset': { borderColor: '#E2E8F0' },
          '&:hover fieldset': { borderColor: '#94A3B8' },
          '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
        },
      }}
    />
  );
}

export default SearchBar;
