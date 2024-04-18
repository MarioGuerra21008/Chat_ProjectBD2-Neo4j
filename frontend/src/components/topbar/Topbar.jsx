import "./topbar.css";
import { Search, Person, Chat, Notifications, ExitToApp } from "@material-ui/icons";
import { IconButton, MenuItem,MenuList, Paper, Popper } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import React, {useState} from "react";

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = async () => {
    try {
      // Realizar la solicitud POST al backend con el término de búsqueda
      const response = await fetch("/users/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        // Manejar la respuesta del servidor
        const searchData = await response.json();
        console.log(searchData);
        setSearchResults(searchData);
        setAnchorEl(anchorEl ? null : document.body);
        // Aquí puedes hacer algo con los datos de búsqueda, por ejemplo, redirigir a una página de resultados
      } else {
        console.error("Error en la solicitud:", response.status);
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
    }
  };

  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">tilinesbook</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <IconButton onClick={handleClick}>
            <Search className="searchIcon" />
          </IconButton>
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Mostrar resultados como MenuItem en un Popper */}
          <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
              <div {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                <Paper>
                  <MenuList autoFocusItem={Boolean(anchorEl)} id="menu-list-grow">
                    {searchResults && (
                      <>
                        {searchResults.users.map((result) => (
                          <MenuItem key={result._id} onClick={handleClose}>
                            <Link to={`/profile/${result.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                              <img
                                src={result.profilePicture || PF + "person/noAvatar.png"}
                                alt=""
                                className="searchResultImg"
                              />
                              <span className="searchResultUsername">{result.username}</span>
                            </Link>
                          </MenuItem>
                        ))}
                        {searchResults.posts.map((result) => (
                          <MenuItem key={result._id} onClick={handleClose}>
                            {/* Mostrar la descripción y la imagen del post */}
                            <div>
                              <span className="searchResultDesc">{result.desc}</span>
                            </div>
                          </MenuItem>
                        ))}
                      </>
                    )}
                  </MenuList>
                </Paper>
              </div>
            )}
          </Popper>
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink">Homepage</span>
          <Link className="alink" to={`/fyp/`}>
            <span className="topbarLink">FYP</span>
            </Link>
          <span className="topbarLink">Timeline</span>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <Link to={`/profile/${user.username}`}>
          <img
            src={
              user.profilePicture
                ? user.profilePicture
                : PF + "person/noAvatar.png"
            }
            alt=""
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
}
