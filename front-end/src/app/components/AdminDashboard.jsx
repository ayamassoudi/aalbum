import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  IconButton, 
  Switch, 
  Tooltip, 
  Avatar,
  Alert,
  Collapse,
  Fade,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Stack,
  ImageList,
  ImageListItem
} from '@mui/material';
import { 
  Delete, 
  Visibility, 
  PersonOutline,
  CollectionsOutlined,
  PhotoOutlined,
  ArrowBack,
  AdminPanelSettings,
  PersonOff
} from '@mui/icons-material';
import mainApi from '../../api/mainApi';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAlbums, setUserAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mainApi.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      Swal.fire('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAlbums = async (userId, user) => {
    try {
      setLoadingAlbums(true);
      setError(null);
      const response = await mainApi.get(`/albums?userId=${userId}`);
      setUserAlbums(response.data.data);
      setSelectedUser(userId);
      setSelectedUserDetails(user);
      setSelectedAlbum(null);
      setAlbumPhotos([]);
    } catch (error) {
      console.error('Error loading albums:', error);
      setError('Failed to load albums. Please try again.');
      Swal.fire('Error', 'Failed to load user albums', 'error');
    } finally {
      setLoadingAlbums(false);
    }
  };

  const loadAlbumPhotos = async (albumId, album) => {
    try {
      setLoadingPhotos(true);
      setError(null);
      const response = await mainApi.get(`/photos?albumId=${albumId}`);
      setAlbumPhotos(response.data.data);
      setSelectedAlbum(album);
    } catch (error) {
      console.error('Error loading photos:', error);
      setError('Failed to load photos. Please try again.');
      Swal.fire('Error', 'Failed to load album photos', 'error');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const toggleAdminStatus = async (user) => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: `This will ${user.isAdmin ? 'remove' : 'grant'} admin privileges for this user.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await mainApi.put(`/users/${user.uid}/admin-status`, {
            isAdmin: !user.isAdmin
          });
          
          setUsers(users.map(u => 
            u.uid === user.uid ? { ...u, isAdmin: !u.isAdmin } : u
          ));

          Swal.fire(
            'Updated!',
            `User ${user.isAdmin ? 'demoted from' : 'promoted to'} admin successfully.`,
            'success'
          );
        }
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      Swal.fire('Error', 'Failed to update admin status', 'error');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the user and all their albums!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await mainApi.delete(`/users/${userId}`);
          setUsers(users.filter(user => user.uid !== userId));
          if (selectedUser === userId) {
            setUserAlbums([]);
            setSelectedUser(null);
          }
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
        }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire('Error', 'Failed to delete user', 'error');
    }
  };

  const deletePhoto = async (photoId, photoUrl) => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the photo permanently!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const segments = photoUrl.split('/');
          const imageName = segments[segments.length-1];
          const segments2 = imageName.split('.');
          const cloudinaryId = segments2[0];

          await mainApi.delete(`/photos/${photoId}/${cloudinaryId}`);
          setAlbumPhotos(albumPhotos.filter(photo => photo.id !== photoId));
          Swal.fire('Deleted!', 'Photo has been deleted.', 'success');
        }
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      Swal.fire('Error', 'Failed to delete photo', 'error');
    }
  };

  const deleteAlbum = async (albumId) => {
    try {
      const photosResponse = await mainApi.get(`/photos?albumId=${albumId}`);
      if (photosResponse.data.data && photosResponse.data.data.length > 0) {
        Swal.fire({
          title: 'Album contains photos',
          text: 'You must delete all photos in the album first',
          icon: 'warning',
          confirmButtonText: 'Ok'
        });
        return;
      }

      await Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the album permanently!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await mainApi.delete(`/albums/${albumId}`);
          setUserAlbums(userAlbums.filter(album => album.id !== albumId));
          if (selectedAlbum === albumId) {
            setSelectedAlbum(null);
            setAlbumPhotos([]);
          }
          Swal.fire('Deleted!', 'Album has been deleted.', 'success');
        }
      });
    } catch (error) {
      console.error('Error deleting album:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete album';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
    setUserAlbums([]);
    setSelectedAlbum(null);
    setAlbumPhotos([]);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
  };

  const EmptyState = ({ icon: Icon, message }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 4,
      textAlign: 'center'
    }}>
      <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  const UserCard = ({ user }) => (
    <Card sx={{ 
      p: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
            {user.firstName ? user.firstName[0].toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {user.firstName || ''} {user.lastName || ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {user.email || ''}
            </Typography>
            <Chip 
              icon={user.isAdmin ? <AdminPanelSettings /> : <PersonOutline />}
              label={user.isAdmin ? 'Admin' : 'User'}
              color={user.isAdmin ? 'primary' : 'default'}
              size="small"
            />
          </Box>
        </Box>
        <Switch
          checked={user.isAdmin}
          onChange={() => toggleAdminStatus(user)}
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => loadUserAlbums(user.uid, user)}
          sx={{ flexGrow: 1 }}
        >
          View Albums
        </Button>
        <Tooltip title="Delete User">
          <IconButton
            onClick={() => deleteUser(user.uid)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );

  const AlbumCard = ({ album }) => (
    <Card sx={{ 
      p: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <CollectionsOutlined color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6">{album.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {album.description}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<PhotoOutlined />}
          onClick={() => loadAlbumPhotos(album.id, album)}
          sx={{ flexGrow: 1 }}
        >
          View Photos
        </Button>
        <Tooltip title="Delete Album">
          <IconButton
            onClick={() => deleteAlbum(album.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, sm: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, albums, and photos
        </Typography>
      </Box>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>

      {/* Navigation Breadcrumbs */}
      {(selectedUser || selectedAlbum) && (
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          sx={{ mb: 4 }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={selectedAlbum ? handleBackToAlbums : handleBackToUsers}
          >
            Back to {selectedAlbum ? 'Albums' : 'Users'}
          </Button>
          {selectedUserDetails && (
            <Typography variant="h6" color="text.secondary">
              {selectedAlbum 
                ? `Photos in ${selectedAlbum.name}`
                : `${selectedUserDetails.firstName}'s Albums`}
            </Typography>
          )}
        </Stack>
      )}

      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {!selectedUser && users.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.uid}>
              <UserCard user={user} />
            </Grid>
          ))}

          {selectedUser && !selectedAlbum && (
            <>
              {loadingAlbums ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                  </Box>
                </Grid>
              ) : userAlbums.length > 0 ? (
                userAlbums.map(album => (
                  <Grid item xs={12} sm={6} md={4} key={album.id}>
                    <AlbumCard album={album} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <EmptyState 
                    icon={CollectionsOutlined} 
                    message="No albums found for this user" 
                  />
                </Grid>
              )}
            </>
          )}

          {selectedAlbum && (
            <>
              {loadingPhotos ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                  </Box>
                </Grid>
              ) : albumPhotos.length > 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      {albumPhotos.map((photo) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                          <Card
                            elevation={2}
                            sx={{
                              position: 'relative',
                              height: 280,
                              overflow: 'hidden',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 8,
                                '& .photo-overlay': {
                                  opacity: 1
                                },
                                '& .photo-content': {
                                  transform: 'translateY(0)'
                                }
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={photo.thumbnail || photo.url}
                              alt={photo.name}
                              loading="lazy"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                }
                              }}
                              onClick={() => window.open(photo.url, '_blank')}
                            />
                            <Box
                              className="photo-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              }}
                            />
                            <Box
                              className="photo-content"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                color: 'white',
                                transform: 'translateY(100%)',
                                transition: 'transform 0.3s ease',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                              }}
                            >
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  mb: 1,
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {photo.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Full Image">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      color: 'white',
                                      bgcolor: 'primary.main',
                                      '&:hover': { 
                                        bgcolor: 'primary.dark'
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(photo.url, '_blank');
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Photo">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      color: 'white',
                                      bgcolor: 'error.main',
                                      '&:hover': { 
                                        bgcolor: 'error.dark'
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePhoto(photo.id, photo.url);
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <EmptyState 
                    icon={PhotoOutlined} 
                    message="No photos found in this album" 
                  />
                </Grid>
              )}
            </>
          )}

          {!selectedUser && users.length === 0 && (
            <Grid item xs={12}>
              <EmptyState 
                icon={PersonOff} 
                message="No users found" 
              />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;