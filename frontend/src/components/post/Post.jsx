import "./post.css";
import { MoreVert, Edit } from "@material-ui/icons";
import { IconButton, Menu, MenuItem, Modal, TextField, Button } from '@material-ui/core';
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import React from "react";

export default function Post({ post, onUpdate }) {
  console.log("post: ",post)
  const [like, setLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState(post.desc);

  //console.log(":C: ", post);
  //console.log(":C2: ", currentUser.id);

  useEffect(() => {
    setIsLiked(2);
  }, [currentUser.id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:8800/api/users?userId=${post.properties.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

  const handleMoreVertClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateClick = async () => {
    setIsModalOpen(true);
    handleMenuClose();
  };

  const handleModalClose = () => {
    // Cerrar el modal al hacer clic en "Guardar cambios"
    setIsModalOpen(false);
  };

  const handleBorrarClick = async () => {

    try {
      
  
      // Supongamos que postId es el ID de la publicación que quieres borrar
      const postId = post.properties.id;
  
      // Lógica para la opción "Borrar publicación"
      console.log('Borrar publicación: ', post.properties.id);

      // Enviar la solicitud DELETE al backend
      //console.log("userID: ", post.userId);
      const response = await axios.delete(`http://localhost:8800/api/posts/${postId}`, {
        data: { userId: post.properties.userId}, // Agrega el userId necesario en el cuerpo de la solicitud
      });
  
      // Manejar la respuesta del servidor
      onUpdate(postId, 'delete');
      handleModalClose();
      window.location.reload();
      //console.log(response.data); // Deberías ver "the post has been deleted" si la operación fue exitosa
    } catch (error) {
      console.error('Error al borrar la publicación:', error);
    }
  };

  const likeHandler = () => {
    try {
      axios.put("http://localhost:8800/api/posts/" + post.id + "/like", { userId: currentUser.id });
    } catch (err) {}
    setLike(isLiked ? like + 1 : like - 1);
    setIsLiked(!isLiked);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedPost = await axios.put(`http://localhost:8800/api/posts/${post.properties.id}`, {
        userId: currentUser.id,
        desc: updatedDesc,
      });

      // Llama a la función onUpdate para actualizar el estado en Feed
      onUpdate(updatedPost.data, 'update', updatedPost);
      handleModalClose();
    } catch (error) {
      console.error("Error al actualizar la publicación:", error);
    }
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            
          </div>
          <div className="postTopRight">
            <IconButton onClick={handleMoreVertClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleUpdateClick}>Editar publicación</MenuItem>
              <MenuItem onClick={handleBorrarClick}>Borrar publicación</MenuItem>
            </Menu>

            <Modal
              open={isModalOpen}
              onClose={handleModalClose}
              className="modalContainer" // Usa la clase CSS desde el archivo
            >
              <div className="modalContent"> {/* Usa la clase CSS desde el archivo */}
                <TextField
                  label="Nueva descripción"
                  variant="outlined"
                  value={updatedDesc}
                  onChange={(e) => setUpdatedDesc(e.target.value)}
                  multiline
                  rows={10} // Ajusta la cantidad de filas según tus necesidades
                  fullWidth
                />
                <Button onClick={handleSaveChanges}>
                  <Edit></Edit>
                </Button>
              </div>
            </Modal>
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.properties.desc}</span>
          <img className="postImg" src={PF + post.properties.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">{post.comment} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
