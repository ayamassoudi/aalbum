import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { useUiStore } from '../../hooks/useUiStore';
import { useAlbumStore } from '../../hooks/useAlbumStore';
import { Button } from "flowbite-react/lib/cjs/index.js";
import { TextField, Box, Typography, IconButton } from '@mui/material';
import { Close, Collections } from '@mui/icons-material';

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

export function AlbumModal() {
  const { isModalOpen, closeModal } = useUiStore();
  const { activeAlbum, startSavingAlbum } = useAlbumStore();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (activeAlbum !== null) {
      setFormValues({ ...activeAlbum });
    }
  }, [activeAlbum]);

  const onInputChange = ({ target }) => {
    setFormValues({
      ...formValues,
      [target.name]: target.value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formValues.name.length <= 0) {
      Swal.fire('Required Field', 'Please enter a name for the album', 'warning');
      return;
    }

    if (formValues.description.length <= 0) {
      Swal.fire('Required Field', 'Please enter a description for the album', 'warning');
      return;
    }

    await startSavingAlbum(formValues);
    closeModal();
    setFormSubmitted(false);
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
            <Collections sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" component="h2" fontWeight="600">
              {formValues.name ? 'Edit Album' : 'Create Album'}
            </Typography>
          </Box>
          <IconButton onClick={closeModal} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Album Name"
              placeholder="Enter album name"
              fullWidth
              name="name"
              value={formValues.name}
              onChange={onInputChange}
              error={formSubmitted && formValues.name.length <= 0}
              helperText={formSubmitted && formValues.name.length <= 0 ? "Album name is required" : ""}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="Description"
              placeholder="Enter album description"
              multiline
              rows={4}
              fullWidth
              name="description"
              value={formValues.description}
              onChange={onInputChange}
              error={formSubmitted && formValues.description.length <= 0}
              helperText={formSubmitted && formValues.description.length <= 0 ? "Description is required" : ""}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

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
              >
                {formValues.name ? 'Save Changes' : 'Create Album'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
