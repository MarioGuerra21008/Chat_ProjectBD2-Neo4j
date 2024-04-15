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
  const [isLiked, setIsLiked] = useState(true);
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedDesc, setUpdatedDesc] = useState(post.desc);
  const [newLocation, setNewLocation] = useState('');

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

  const likeHandler = async () => {
    try {
      // Realiza la petición PUT al servidor
      await axios.put("http://localhost:8800/api/posts/" + post.properties.id + "/like", { userId: currentUser.id });
  
      // Actualiza el estado basándose en si el post estaba previamente 'liked' o no
      if (!isLiked) {
        // Si no estaba 'liked', incrementa el contador de likes y establece isLiked a true
        setLike(like - 1);
        setIsLiked(true);
      } else {
        // Si estaba 'liked', decrementa el contador de likes y establece isLiked a false
        setLike(like + 1);
        setIsLiked(false);
      }
    } catch (err) {
      console.error("Error al actualizar el like:", err);
    }
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

  const addPropertyToLike = async (userId, postId) => {
    //console.log('userID(POSTS): ', userId);
    //console.log('postID(POSTS): ', postId);
    try {
      const response = await axios.post('http://localhost:8800/api/posts/addILoveToLike', {
        userId,
        postId
      });
      console.log('Updated like:', response.data);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleCommentClick = () => {
    console.log('Comment span clicked');
    // Aquí puedes agregar más lógica, como abrir un modal de comentarios
  };
  
  const handleEditLocationClick = async () => {
    setNewLocation(''); // Restablecer el estado de la nueva ubicación
    setIsModalOpen(true);
    handleMenuClose(); // Cerrar el menú desplegable después de hacer clic en "Editar ubicación"
  };
  
  const handleSaveLocation = async () => {
    try {
      const response = await axios.put(`http://localhost:8800/api/posts/${post.properties.id}/location`, {
        userId: currentUser.id,
        location: newLocation,
      });
      console.log(response.data); // Deberías ver un mensaje indicando que la ubicación se ha actualizado correctamente
      // Puedes actualizar el estado del post si es necesario
      setIsModalOpen(false); // Cerrar el modal después de guardar la ubicación
    } catch (error) {
      console.error('Error updating post location:', error);
    }
  };
  
  const handleDeleteLocationClick = async () => {
    try {
      const response = await axios.put(`http://localhost:8800/api/posts/${post.properties.id}/location/delete`);
      console.log(response.data); // Deberías ver un mensaje indicando que la ubicación se ha eliminado correctamente
      // Puedes actualizar el estado del post si es necesario
    } catch (error) {
      console.error('Error deleting post location:', error);
    }
  };

  const handleUpdateDescriptionClick = async () => {
    try {
      await axios.put(`http://localhost:8800/api/posts/updateDescription/${currentUser.id}`, {
        desc: "New Description" // Cambia "New Description" por la descripción que desees actualizar
      });
      console.log("Descriptions updated successfully");
    } catch (err) {
      console.error("Error updating descriptions:", err);
    }
  };

  const handleDeleteImagesClick = async () => {
    try {
      await axios.put(`http://localhost:8800/api/posts/deleteImages/${currentUser.id}`);
      console.log("Images deleted successfully");
    } catch (err) {
      console.error("Error deleting images:", err);
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
              <MenuItem onClick={handleEditLocationClick}>Editar ubicación</MenuItem>
              <MenuItem onClick={handleDeleteLocationClick}>Borrar ubicación</MenuItem>
              <MenuItem onClick={handleUpdateDescriptionClick}>Actualizar descripciones</MenuItem>
              <MenuItem onClick={handleDeleteImagesClick}>Eliminar imágenes</MenuItem>
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
                <TextField
                  label="Nueva ubicación"
                  variant="outlined"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  fullWidth
                />
                <Button onClick={handleSaveChanges}>
                  <Edit></Edit>
                </Button>
                <Button onClick={handleSaveLocation}>
                  <Edit>Nueva Ubicación</Edit>
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
              onClick={() => addPropertyToLike(user.id, post.properties.id)}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText" onClick={handleCommentClick}>
              {post.comment} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
