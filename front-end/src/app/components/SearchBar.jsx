import { useState } from "react";
import { TextInput, Select } from "flowbite-react/lib/cjs/index.js";
import { useAlbumStore } from "../../hooks/useAlbumStore";
import { usePhotoStore } from "../../hooks/usePhotoStore";
import { Search as SearchIcon } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";

export const SearchBar = (props) => {
  const { activeAlbum } = useAlbumStore();
  const { startSearchingPhotos } = usePhotoStore();
  const { startSearchingAlbums } = useAlbumStore();

  const [searchParams, setSearchParams] = useState({
    text: "",
    searchBy: "name",
  });

  const searchAlbums = async () => {
    const noResults = await startSearchingAlbums(searchParams.text);
    props.setNoResults(noResults);
  };

  const searchPhotos = async () => {
    let query = {};
    switch (searchParams.searchBy) {
      case "name":
        query.s = searchParams.text;
        break;
      case "tag":
        query.tag = searchParams.text;
        break;
      case "width":
        query.width = searchParams.text;
        break;
      case "height":
        query.height = searchParams.text;
        break;
      case "color":
        query.color = searchParams.text;
        break;
    }

    const noResults = await startSearchingPhotos(activeAlbum.id, query);
    props.setNoResults(noResults);
  };

  const search = (e) => {
    e.preventDefault();
    if (props.id === 1) {
      searchAlbums();
    } else if (props.id === 2) {
      searchPhotos();
    }
  };

  return (
    <form className="flex items-center gap-3" onSubmit={search}>
      <div className="relative flex-1">
        <TextInput
          type="text"
          sizing="lg"
          placeholder={props.id === 1 ? "Search albums..." : `Search by ${searchParams.searchBy}`}
          value={searchParams.text}
          onChange={(e) => setSearchParams({ ...searchParams, text: e.target.value })}
          className="w-full"
          icon={SearchIcon}
        />
      </div>

      {props.id === 2 && (
        <Select
          className="w-40"
          value={searchParams.searchBy}
          onChange={(e) => setSearchParams({ ...searchParams, searchBy: e.target.value })}
          sizing="lg"
        >
          <option value="name">Name</option>
          <option value="tag">Tag</option>
          <option value="width">Width</option>
          <option value="height">Height</option>
          <option value="color">Color</option>
        </Select>
      )}
    </form>
  );
};
