import { Table, Button, Tooltip } from "flowbite-react/lib/cjs/index.js";
import { Link } from "react-router-dom";
import { useAlbumStore } from "../../hooks/useAlbumStore";
import { useUiStore } from "../../hooks/useUiStore";
import { confirmAlert } from 'react-confirm-alert';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';
import 'react-confirm-alert/src/react-confirm-alert.css';

export const AlbumTable = (props) => {
    const { setActiveAlbum, startDeletingAlbum } = useAlbumStore();
    const { openModal } = useUiStore();

    const onViewAlbum = (album) => {
        setActiveAlbum(album);
    };

    const onEditAlbum = (album) => {
        setActiveAlbum(album);
        openModal();
    };

    const onConfirmDeleteAlbum = (album) => {
        confirmAlert({
            title: 'Delete Album',
            message: 'Are you sure you want to delete this album? This action cannot be undone.',
            buttons: [
                {
                    label: 'Delete',
                    onClick: () => {
                        setActiveAlbum(album);
                        startDeletingAlbum(album);
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
            overlayClassName: "confirm-alert-overlay",
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

    const formatDate = (date) => {
        return format(new Date(date), 'MMM d, yyyy');
    };

    return (
        <div className="overflow-x-auto">
            <Table hoverable={true}>
                <Table.Head className="bg-gray-50">
                    <Table.HeadCell className="text-gray-700">Album Name</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700">Description</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700">Created</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700">
                        <span className="sr-only">Actions</span>
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {props.albums.map((album) => (
                        <Table.Row 
                            key={album.id} 
                            className="bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Table.Cell className="font-medium text-gray-900">
                                {album.name}
                            </Table.Cell>
                            <Table.Cell className="text-gray-600 max-w-md">
                                <div className="line-clamp-2">
                                    {album.description}
                                </div>
                            </Table.Cell>
                            <Table.Cell className="text-gray-600">
                                {formatDate(album.date)}
                            </Table.Cell>
                            <Table.Cell>
                                <div className="flex items-center gap-2">
                                    <Tooltip content="View Album">
                                        <Link
                                            to={`/albums/${album.id}?AlbumTitle=${album.name}`}
                                            onClick={() => onViewAlbum(album)}
                                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Visibility className="w-5 h-5" />
                                        </Link>
                                    </Tooltip>
                                    
                                    <Tooltip content="Edit Album">
                                        <button
                                            onClick={() => onEditAlbum(album)}
                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content="Delete Album">
                                        <button
                                            onClick={() => onConfirmDeleteAlbum(album)}
                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Delete className="w-5 h-5" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
};
