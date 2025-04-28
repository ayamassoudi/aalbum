import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { useUiStore } from '../../hooks/useUiStore';
import { usePhotoStore } from '../../hooks/usePhotoStore';
import { Button, Spinner } from "flowbite-react/lib/cjs/index.js";
import { Box, Typography, IconButton, TextField } from '@mui/material';
import { Close, Image } from '@mui/icons-material';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    padding: 0,
    border: 'none',
    borderRadius: '0.75rem',
    backgroundColor: '#fff',
  },
};

Modal.setAppElement('#root');

const formFields = {
  name: '',
  description: '',
  url: ''
};

export function PhotoModal() {
  const { isModalOpen, closeModal } = useUiStore();
  const { activePhoto, startSavingPhoto, startUploadingFile, isSaving } = usePhotoStore();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileSelected, setFileSelected] = useState(null);
  const [formValues, setFormValues] = useState(formFields);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (activePhoto !== null) {
      setFormValues({
        ...activePhoto,
        description: activePhoto.description || ''
      });
      setPreviewUrl(activePhoto.url || '');
    } else {
      setFormValues(formFields);
      setPreviewUrl('');
      setFileSelected(null);
    }
  }, [activePhoto]);

  const onInputChange = ({ target }) => {
    setFormValues({
      ...formValues,
      [target.name]: target.value
    });
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid file', 'Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File too large', 'Please select an image smaller than 5MB', 'error');
      return;
    }

    setFileSelected(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formValues.name.length <= 0) {
      Swal.fire('Required Field', 'Please enter a name for the photo', 'warning');
      return;
    }

    if (!fileSelected && !activePhoto) {
      Swal.fire('Required Field', 'Please select a photo to upload', 'warning');
      return;
    }

    try {
      if (fileSelected) {
        const fileUrl = await startUploadingFile([fileSelected]);
        formValues.url = fileUrl;
      }

      await startSavingPhoto(formValues);
      closeModal();
      setFormSubmitted(false);
      setFileSelected(null);
      setPreviewUrl('');
    } catch (error) {
      Swal.fire('Error', 'Failed to upload photo. Please try again.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      style={customStyles}
      closeTimeoutMS={200}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Image sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" component="h2" fontWeight="600">
              {activePhoto?.name ? 'Edit Photo' : 'Upload Photo'}
            </Typography>
          </Box>
          <IconButton onClick={closeModal} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Photo Name"
              placeholder="Enter photo name"
              fullWidth
              name="name"
              value={formValues.name}
              onChange={onInputChange}
              error={formSubmitted && formValues.name.length <= 0}
              helperText={formSubmitted && formValues.name.length <= 0 ? "Photo name is required" : ""}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="Description"
              placeholder="Enter photo description (optional)"
              multiline
              rows={3}
              fullWidth
              name="description"
              value={formValues.description}
              onChange={onInputChange}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {!activePhoto && (
              <Box>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={onFileInputChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Accepted formats: PNG, JPEG (max. 5MB)
                </Typography>
              </Box>
            )}

            {previewUrl && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg border"
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="button"
                color="gray"
                onClick={closeModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                gradientMonochrome="purple"
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>Uploading...</span>
                  </div>
                ) : activePhoto ? 'Save Changes' : 'Upload Photo'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
