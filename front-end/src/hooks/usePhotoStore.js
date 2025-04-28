import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import mainApi from "../api/mainApi";
import { fileUpload } from "../helpers/fileUpload";
import { 
    deletingPhoto, 
    onAddNewPhoto, 
    onClearPhotos, 
    onDeleteAllPhotosOfAlbum, 
    onDeletePhoto, 
    onLoadPhotos, 
    onSearchPhotos, 
    onSetActivePhoto, 
    onUpdatePhoto, 
    savingNewPhoto 
} from "../store/app/photoSlice";

export const usePhotoStore = () => {
    const dispatch = useDispatch();
    const { photos, activePhoto, isSaving, isDeleting } = useSelector(state => state.photos);
    const { activeAlbum } = useSelector(state => state.albums);

    const setActivePhoto = (photo) => {
        dispatch(onSetActivePhoto(photo));
    };

    const startUploadingFile = async (files = []) => {
        try {
            dispatch(savingNewPhoto());
            const file = files[0];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Invalid file type. Please select an image file.');
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File too large. Please select an image smaller than 5MB.');
            }

            return await fileUpload(file);
        } catch (error) {
            throw new Error(error.message || 'Failed to upload file');
        }
    };

    const startUploadingFiles = async (files = []) => {
        try {
            dispatch(savingNewPhoto());
            const fileUploadPromises = [];
            
            // Validate files
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`Invalid file type: ${file.name}. Please select image files only.`);
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File too large: ${file.name}. Please select images smaller than 5MB.`);
                }
                fileUploadPromises.push(fileUpload(file));
            }

            return await Promise.all(fileUploadPromises);
        } catch (error) {
            throw new Error(error.message || 'Failed to upload files');
        }
    };

    const startSavingPhoto = async(photo) => {
        try {
            if (photo.id) {
                await mainApi.put(`/photos/${photo.id}`, photo);
                dispatch(onUpdatePhoto({...photo}));
                Swal.fire('Photo updated!', 'The photo was updated successfully!', 'success');
                return;
            }

            const albumId = activeAlbum?.id || localStorage.getItem('activeAlbum');
            if (!albumId) {
                throw new Error('No album selected');
            }

            photo.albumId = albumId;
            const { data } = await mainApi.post('/photos', photo);
            dispatch(onAddNewPhoto({...photo, id: data.data.id}));
            Swal.fire('Success', 'Photo uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error saving photo:', error);
            throw error;
        }
    };

    const startSavingPhotos = async(files = []) => {
        try {
            const albumId = activeAlbum?.id || localStorage.getItem('activeAlbum');
            if (!albumId) {
                throw new Error('No album selected');
            }

            const photosURLs = await startUploadingFiles(files);
            const newPhotos = photosURLs.map(url => ({
                albumId,
                url,
                name: `Photo ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            }));

            const uploadPromises = newPhotos.map(photo => 
                mainApi.post('/photos', photo)
            );

            await Promise.all(uploadPromises);

            const { data } = await mainApi.get(`/photos?albumId=${albumId}`);
            dispatch(onSearchPhotos(data.data));

            Swal.fire('Success', 'Photos uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading photos:', error);
            Swal.fire('Error', error.message || 'Failed to upload photos', 'error');
            throw error;
        }
    };

    const startDeletingPhoto = async(photo) => {

        try {

            dispatch(deletingPhoto());

            const segments = photo.url.split('/');
            const imageName = segments[segments.length-1];
            const segments2 = imageName.split('.');
            const imageId = segments2[0];

            await mainApi.delete(`/photos/${photo.id}/${imageId}`);

            dispatch(onDeletePhoto());

            Swal.fire('Photo deleted!', 'The photo was deleted successfully!', 'success');
            
        } catch (error) {
            //console.log(error);
            Swal.fire('Error while deleting photo', error.response.data?.message, 'error');
        }
        
    }

    const startDeletingAllPhotosOfAlbum = async() => {

        try {

            dispatch(deletingPhoto());

            let mongoIds = '';
            let cloudinaryIds = '';

            let segments = '';
            let imageName = '';
            let segments2 = '';
            let imageId = '';

            let cont = 0;
            photos.forEach(photo => {
                cont++;

                segments = photo.url.split('/');
                imageName = segments[segments.length-1];
                segments2 = imageName.split('.');
                imageId = segments2[0];

                if(cont % 50 === 0){ //borrar en grupos de 50
                    mongoIds += photo.id + ',.';
                    cloudinaryIds += 'social-app/' + imageId + ',.';
                }else{
                    mongoIds += photo.id + ',';
                    cloudinaryIds += 'social-app/' + imageId + ',';
                }
                
            })

            if(mongoIds.charAt(mongoIds.length - 1) === '.'){
                mongoIds = mongoIds.slice(0, -1);
                cloudinaryIds = cloudinaryIds.slice(0, -1);
            }

            let segmentsM = mongoIds.split('.');
            let segmentsC = cloudinaryIds.split('.');

            const filePromises = [];
            for (let i = 0; i < segmentsM.length; i++) {
                segmentsM[i] = segmentsM[i].slice(0, -1);
                segmentsC[i] = segmentsC[i].slice(0, -1);
                filePromises.push(mainApi.delete(`/photos/deleteMultiple?mIds=${segmentsM[i]}&cIds=${segmentsC[i]}`));
            }

            await Promise.all(filePromises);

            dispatch(onDeleteAllPhotosOfAlbum());

            Swal.fire('Photos deleted!', 'The photos were deleted successfully!', 'success');
            
        } catch (error) {
            //console.log(error);
            Swal.fire('Error while deleting photos', error.response.data?.message, 'error');
        }
        
    }

    const startLoadingPhotos = async (id) => {
        try {

            dispatch(onClearPhotos());
            
            const {data} = await mainApi.get(`/photos?albumId=${id}`);

            dispatch(onLoadPhotos(data.data));

        } catch (error) {
            //console.log(error);
        }
    }

    const startSearchingPhotos = async (id, searchParams) => {
        try {
            if (Object.keys(searchParams).length === 0) {
                const {data} = await mainApi.get(`/photos?albumId=${id}`);
                dispatch(onSearchPhotos(data.data));
                return false;
            }

            // Build query string
            const queryParams = new URLSearchParams({
                albumId: id,
                ...searchParams
            }).toString();

            try {
                const {data} = await mainApi.get(`/photos?${queryParams}`);
                dispatch(onSearchPhotos(data.data));
                return false;
            } catch (error) {
                return true;
            }
        } catch (error) {
            console.error('Error searching photos:', error);
            return true;
        }
    }

    return {
        photos,
        isSaving,
        isDeleting,
        activePhoto,
        hasPhotoSelected: !!activePhoto,
        setActivePhoto,
        startUploadingFile,
        startSavingPhoto,
        startDeletingPhoto,
        startLoadingPhotos,
        startSearchingPhotos,
        startDeletingAllPhotosOfAlbum,
        startSavingPhotos,
    };
};
