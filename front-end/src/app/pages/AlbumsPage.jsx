import { useEffect, useState } from "react";
import { useAlbumStore } from "../../hooks/useAlbumStore";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useUiStore } from "../../hooks/useUiStore";
import { AlbumModal } from "../components/AlbumModal";
import { AlbumTable } from "../components/AlbumsTable";
import { SearchBar } from "../components/SearchBar";
import { Button, Card } from "flowbite-react/lib/cjs/index.js";
import { Add, Collections } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

export const AlbumsPage = () => {
    const [showNoResults, setNoResults] = useState(false);
    const { user } = useAuthStore();
    const { albums, setActiveAlbum, startLoadingAlbums } = useAlbumStore();
    const { openModal } = useUiStore();

    useEffect(() => {
        startLoadingAlbums();
    }, []);

    const onNewAlbum = () => {
        setActiveAlbum({
            name: '',
            description: '',
            date: new Date(),
        });
        openModal();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                        Your Albums
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Organize and manage your photo collections
                    </Typography>
                </Box>
                <Button
                    gradientMonochrome="purple"
                    size="lg"
                    onClick={onNewAlbum}
                    className="flex items-center gap-2"
                >
                    <Add className="w-5 h-5" />
                    Create Album
                </Button>
            </Box>

            <Card className="mb-6">
                <div className="p-4">
                    <SearchBar
                        id={1}
                        setNoResults={setNoResults}
                    />
                </div>
            </Card>

            {showNoResults ? (
                <Card className="text-center p-8 bg-gray-50">
                    <Collections className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No albums found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search terms or create a new album
                    </Typography>
                </Card>
            ) : albums[0] ? (
                <Card className="overflow-hidden">
                    <AlbumTable albums={albums} />
                </Card>
            ) : (
                <Card className="text-center p-8 bg-gray-50">
                    <Collections className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No albums yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first album to start organizing your photos
                    </Typography>
                    <Button
                        gradientMonochrome="purple"
                        size="lg"
                        onClick={onNewAlbum}
                        className="flex items-center gap-2 mx-auto"
                    >
                        <Add className="w-5 h-5" />
                        Create Album
                    </Button>
                </Card>
            )}

            <AlbumModal />
        </div>
    );
};
