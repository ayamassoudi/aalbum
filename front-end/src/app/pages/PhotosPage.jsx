import { useEffect, useRef, useState } from "react";
import { usePhotoStore } from "../../hooks/usePhotoStore";
import { useUiStore } from "../../hooks/useUiStore";
import { useLocation } from "react-router-dom";
import { PhotoModal } from "../components/PhotoModal";
import { SearchBar } from "../components/SearchBar";
import { Button, Card, Spinner } from "flowbite-react/lib/cjs/index.js";
import { Box, Typography } from "@mui/material";
import { Add, Delete, Image, Upload } from "@mui/icons-material";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export const PhotosPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = location.pathname.split("/")[2];
    const AlbumTitle = queryParams.get("AlbumTitle");

    const [min, setMin] = useState(0);
    const [max, setMax] = useState(20);
    const [showMore, setShowMore] = useState(false);
    const [showNoResults, setNoResults] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef();
    const listInnerRef = useRef();

    const { photos, setActivePhoto, startSavingPhoto, startSavingPhotos, startDeletingPhoto, startDeletingAllPhotosOfAlbum, startLoadingPhotos } = usePhotoStore();
    const { openModal } = useUiStore();

    const onViewPhoto = (photo) => {
        setActivePhoto(photo);
        openModal();
    };

    const onUploadPhoto = () => {
        setActivePhoto(null);
        openModal();
    };

    const onFileInputChange = async ({ target }) => {
        if (target.files === 0) return;
        setIsSaving(true);
        await startSavingPhotos(target.files);
        setIsSaving(false);
        target.value = '';
    };

    const onConfirmDeletePhoto = (photo) => {
        confirmAlert({
            title: 'Delete Photo',
            message: 'Are you sure you want to delete this photo?',
            buttons: [
                {
                    label: 'Delete',
                    onClick: () => startDeletingPhoto(photo),
                    className: 'bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg mr-2'
                },
                {
                    label: 'Cancel',
                    className: 'bg-gray-200 text-gray-900 hover:bg-gray-300 px-4 py-2 rounded-lg'
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            customUI: ({ onClose, title, message, buttons }) => (
                <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl">
                    <h1 className="text-xl font-semibold mb-2">{title}</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-2">
                        {buttons.map((button, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (button.onClick) button.onClick();
                                    onClose();
                                }}
                                className={button.className}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            )
        });
    };

    const onConfirmDeletePhotos = () => {
        confirmAlert({
            title: 'Delete All Photos',
            message: 'Are you sure you want to delete all photos from this album? This action cannot be undone.',
            buttons: [
                {
                    label: 'Delete All',
                    onClick: () => {
                        setIsDeleting(true);
                        onDeleteAllPhotos();
                        setIsDeleting(false);
                    },
                    className: 'bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg mr-2'
                },
                {
                    label: 'Cancel',
                    className: 'bg-gray-200 text-gray-900 hover:bg-gray-300 px-4 py-2 rounded-lg'
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            customUI: ({ onClose, title, message, buttons }) => (
                <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl">
                    <h1 className="text-xl font-semibold mb-2">{title}</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-2">
                        {buttons.map((button, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (button.onClick) button.onClick();
                                    onClose();
                                }}
                                className={button.className}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            )
        });
    };

    const onDeleteAllPhotos = () => {
        startDeletingAllPhotosOfAlbum();
    };

    useEffect(() => {
        startLoadingPhotos(id);
    }, []);

    useEffect(() => {
        if (photos.length < 20) {
            setShowMore(false);
        } else {
            setShowMore(true);
        }
    }, [photos]);

    const loadMore = () => {
        if (photos[0]) {
            if (max + 20 >= photos.length) {
                setShowMore(false);
            }
            if (max <= photos.length) {
                setMax(max + 20);
            }
        }
    };

    const onScroll = () => {
        if (listInnerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
            if (scrollTop + clientHeight === scrollHeight) {
                loadMore();
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                    {AlbumTitle}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View and manage your photos
                </Typography>
            </Box>

            <Card className="mb-6">
                <div className="p-4">
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Button
                            gradientMonochrome="purple"
                            onClick={() => onUploadPhoto()}
                            className="flex items-center gap-2"
                        >
                            <Add className="w-5 h-5" />
                            Upload Photo
                        </Button>
                        <Button
                            gradientDuoTone="purpleToBlue"
                            onClick={() => fileInputRef.current.click()}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Multiple
                        </Button>
                        {photos.length > 0 && (
                            <Button
                                gradientDuoTone="pinkToOrange"
                                onClick={() => onConfirmDeletePhotos()}
                                disabled={isDeleting}
                                className="flex items-center gap-2"
                            >
                                <Delete className="w-5 h-5" />
                                Delete All
                            </Button>
                        )}
                    </Box>

                    {(isSaving || isDeleting) && (
                        <div className="flex justify-center my-4">
                            <Spinner size="xl" />
                        </div>
                    )}

                    <SearchBar
                        id={2}
                        setNoResults={setNoResults}
                    />
                </div>
            </Card>

            {showNoResults ? (
                <Card className="text-center p-8 bg-gray-50">
                    <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No photos found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search terms
                    </Typography>
                </Card>
            ) : photos.length > 0 ? (
                <div
                    id="scrollContent"
                    onScroll={onScroll}
                    ref={listInnerRef}
                    className="h-[80vh] overflow-y-auto"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {photos.slice(min, max).map((photo) => (
                            <Card key={photo.id} className="overflow-hidden">
                                <div className="relative aspect-square">
                                    <img
                                        className="absolute inset-0 w-full h-full object-cover"
                                        src={photo.thumbnail}
                                        alt={photo.name}
                                    />
                                </div>
                                <div className="p-3">
                                    <Typography variant="subtitle2" className="line-clamp-1 mb-2">
                                        {photo.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="sm"
                                            gradientMonochrome="info"
                                            onClick={() => onViewPhoto(photo)}
                                            className="flex-1"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            gradientMonochrome="failure"
                                            onClick={() => onConfirmDeletePhoto(photo)}
                                            className="flex-1"
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {showMore && (
                        <Button
                            gradientMonochrome="purple"
                            className="w-full mt-4"
                            onClick={() => loadMore()}
                        >
                            Load More
                        </Button>
                    )}
                </div>
            ) : (
                <Card className="text-center p-8 bg-gray-50">
                    <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No photos yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Upload your first photo to get started
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            gradientMonochrome="purple"
                            onClick={() => onUploadPhoto()}
                            className="flex items-center gap-2"
                        >
                            <Add className="w-5 h-5" />
                            Upload Photo
                        </Button>
                        <Button
                            gradientDuoTone="purpleToBlue"
                            onClick={() => fileInputRef.current.click()}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Multiple
                        </Button>
                    </Box>
                </Card>
            )}

            <PhotoModal />
            <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                onChange={onFileInputChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
        </div>
    );
};
