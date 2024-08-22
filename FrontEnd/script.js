


// 1. URL de l'API pour récupérer les travaux
const apiUrl = "http://localhost:5678/api/"; // Définit l'URL de base de l'API

const apiUrlWorks = `${apiUrl}works`; 
const apiCategoriesUrl = `${apiUrl}categories`; 
const apiLoginUrl = `${apiUrl}users/login`;




// 2. ------------------ APPELS API ------------------ // 

// Fonction asynchrone pour récupérer les travaux depuis l'API
async function fetchWorks() {
  try {
    const response = await fetch(apiUrlWorks); 
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`); 
    const works = await response.json(); 
    return works; 
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error); 
    return null; 
  }
}

// Fonction asynchrone pour récupérer les catégories depuis l'API
async function fetchCategories() {
  try {
    const response = await fetch(apiCategoriesUrl); 
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`); 
    const categories = await response.json(); 
    return categories; 
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error); 
    return null; 
  }
}


// 3. ------------------ AFFICHAGE DES TRAVAUX ------------------ //

// Fonction pour afficher les travaux dans une galerie spécifiée
function displayWorks(works, containerSelector = ".gallery") {
  const container = document.querySelector(containerSelector); 
  if (!container) return; 

  container.innerHTML = ""; // Efface le contenu actuel du conteneur

  works.forEach((work) => {
    // Parcourt chaque travail pour les afficher
    const workElement = document.createElement("figure"); 
    const imgElement = document.createElement("img"); 
    imgElement.src = work.imageUrl; 
    const captionElement = document.createElement("figcaption"); 
    captionElement.innerText = work.title; 
    workElement.appendChild(imgElement); 
    workElement.appendChild(captionElement); 
    container.appendChild(workElement); // 
  });
}

// Fonction pour filtrer les travaux par catégorie
function filterWorksByCategory(works, categoryId) {
  const filteredWorks = works.filter((work) => work.categoryId === categoryId);
  
  displayWorks(filteredWorks); 
}


// Fonction pour gérer l'affichage des travaux
async function handleWorksDisplay() {
  const works = await fetchWorks();
  if (works) {
    displayCategoryButtons(works);
    displayWorks(works);
  }
}
// 4. ------------------ GESTION BOUTON MODE NORMAL OU EDITEUR ------------------ //

// Fonction pour afficher les boutons de catégories ou le bouton "Modifier" et gestion edit banner et log in log out
async function displayCategoryButtons(works) {
  const categories = await fetchCategories(); 
  if (!categories) return; 

  const categoryButtonsContainer = document.querySelector(".category-buttons"); 
  const token = localStorage.getItem("authToken"); 
  const authLink = document.getElementById("auth-link"); 
  const editModeBanner = document.getElementById("edit-mode-banner");

  if (token) {
    categoryButtonsContainer.style.display = "none"; 
    editModeBanner.style.display = "block"; 
    authLink.textContent = "logout"; 
    authLink.href = "#"; 
    authLink.addEventListener("click", function (event) {
      event.preventDefault(); 
      localStorage.removeItem("authToken"); 
      window.location.href = "index.html"; 
    });

    let editButton = document.querySelector(".edit-btn");
    if (!editButton) {
      editButton = document.createElement("button");
      editButton.textContent = "Modifier"; 
      editButton.classList.add("edit-btn"); 
      editButton.innerHTML =
        '<i class="fa-regular fa-pen-to-square"></i> modifier'; 
      editButton.addEventListener("click", () => {
        openModalDelete(); 
      });
      const portfolioHeader = document.querySelector(".portfolio-header");
      portfolioHeader.appendChild(editButton);
    }
    return;
  }

  if (!categoryButtonsContainer) {
    return;
  }
 
  categoryButtonsContainer.innerHTML = "";

  editModeBanner.style.display = "none"; 
  categoryButtonsContainer.style.display = "block"; 
  authLink.textContent = "login"; 
  authLink.href = "connexion.html"; 

  // Crée un bouton pour afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.classList.add("category-btn");
  allButton.addEventListener("click", () => {
    displayWorks(works); 
  });
  categoryButtonsContainer.appendChild(allButton);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name; 
    button.classList.add("category-btn");

    button.addEventListener("click", () => {
      filterWorksByCategory(works, category.id); 
    });

    categoryButtonsContainer.appendChild(button);
  });
}

// 5. ------------------ GESTION CONNEXION MODE EDITEUR------------------ //




// ----------------Fonction pour gérer la connexion de l'utilisateur en mode edition
async function loginUser(event) {
  event.preventDefault(); 
  const email = document.getElementById("email").value; 
  const password = document.getElementById("password").value; 

  try {
    const response = await fetch(apiLoginUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json", 
        accept: "application/json", 
      },
      body: JSON.stringify({ email, password }), 
    });

    if (response.ok) {
      
      const data = await response.json(); 
      localStorage.setItem("authToken", data.token); 
      window.location.href = "index.html"; 
    } else {
      document.getElementById("error-message").style.display = "block"; 
    }
  } catch (error) {
    console.error("Erreur lors de la connexion", error); 
  }
}

// Fonction pour gérer le formulaire de connexion
function handleLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }
}

// 5. ------------------ GESTION AFFICHAGE  MODALES ET SUPPRESSION DES TRAVAUX ------------------ //


// Fonction pour afficher les travaux dans la galerie modale avec la possibilité de suppression
function displayModalGallery(works) {
  if (!Array.isArray(works)) return; 

  const modalGallery = document.querySelector(".modal-gallery"); 
  if (!modalGallery) return; 

  modalGallery.innerHTML = ""; 

  works.forEach((work) => {
    // Parcourt chaque travail pour les afficher dans la modale
    const workElement = document.createElement("figure"); 
    const imgElement = document.createElement("img"); 
    imgElement.src = work.imageUrl; 

    const deleteIcon = document.createElement("span"); 
    deleteIcon.classList.add("delete-icon", "fa-solid", "fa-trash-can"); 

  

    // Ajouter un gestionnaire d'événements pour supprimer l'élément
    deleteIcon.addEventListener("click", () => deleteWork(work, workElement, modalGallery));

    workElement.appendChild(imgElement); 
    workElement.appendChild(deleteIcon); 
    modalGallery.appendChild(workElement); 
  });
  handleAddButton();
}

// Fonction pour supprimer un travail
async function deleteWork(work, workElement, modalGallery) {
  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce travail ?");
  if (confirmation) {
    try {
      const response = await fetch(`${apiUrlWorks}/${work.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`, 
        },
      });

      if (response.ok) {
        modalGallery.removeChild(workElement);
        const updatedWorks = await fetchWorks(); 
        displayWorks(updatedWorks); 
        displayModalGallery(updatedWorks);
        
      } else if (response.status === 401) {
        alert("Non autorisé à supprimer cet élément.");
      } else {
        alert("Erreur lors de la suppression. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du travail :", error);
    }
  }
}

// 6. ------------------ GESTION AFFICHAGE  ADD MODALES et AJOUT PROJET ------------------ //

// ajout categorie menu déroulant
async function populateCategoryOptions() {
  const categories = await fetchCategories(); 
  const categorySelect = document.getElementById('category');

  if (categories && categorySelect) {
    categorySelect.innerHTML = ''; 

    // Ajouter une option vide
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Choisir une catégorie';
    emptyOption.disabled = true;
    emptyOption.selected = true;
    categorySelect.appendChild(emptyOption);

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
}

// Fonction pour gérer la prévisualisation de l'image téléchargée
function handleImagePreview() {
  const imageInput = document.getElementById('image');
  if (imageInput) {
    imageInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      const previewImage = document.getElementById('preview-image');
    
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImage.src = e.target.result;
          previewImage.style.display = 'block';
          uploadContent.style.display = 'none';
        };
        reader.readAsDataURL(file);
      } else {
        if (previewImage) {
          previewImage.style.display = 'none';
          uploadContent.style.display = 'block';
        }
      }
    });
  }
}


// Ajoute un projet à la galerie principale
function addWorkToGallery(work) {
  const galleryContainer = document.querySelector('.gallery');
  if (!galleryContainer) return;

  const workElement = document.createElement('figure');

  const imgElement = document.createElement('img');
  imgElement.src = work.imageUrl;
  imgElement.alt = work.title;

  const figcaptionElement = document.createElement('figcaption');
  figcaptionElement.textContent = work.title;

  workElement.appendChild(imgElement);
  workElement.appendChild(figcaptionElement);

  galleryContainer.appendChild(workElement);
}

// Ajoute un projet à la galerie modale
function addWorkToModalGallery(work) {
  const modalGalleryContainer = document.querySelector('.modal-gallery');
  if (!modalGalleryContainer) return;

  const workElement = document.createElement('figure');

  const imgElement = document.createElement('img');
  imgElement.src = work.imageUrl;
  imgElement.alt = work.title;

  const figcaptionElement = document.createElement('figcaption');
  figcaptionElement.textContent = work.title;

  workElement.appendChild(imgElement);
  workElement.appendChild(figcaptionElement);

  modalGalleryContainer.appendChild(workElement);
}


// Fonction pour gérer la soumission du formulaire d'ajout de projet
function handleAddProjectForm() {
  const addProjectForm = document.getElementById('add-project-form');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);

      try {
        console.log('Envoi de la requête POST à l\'API...');
        const response = await fetch(apiUrlWorks, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });

        console.log('Réponse de l\'API:', response);

        if (response.ok) {
          const newWork = await response.json();
          console.log('Nouveau projet créé:', newWork);
          addWorkToGallery(newWork);
          addWorkToModalGallery(newWork);
          event.target.reset();
          closeAllModal()
         
        } else {
          console.error('Erreur lors de l\'ajout du projet:', response.statusText);
          alert(`Erreur lors de l'ajout du projet: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Erreur inattendue lors de l\'envoi des données:', error);
        alert(`Erreur inattendue: ${error.message}`);
      }
    });
  }
}

// 7. ------------------ GESTION OUVERTURE ET FERMETURE DES MODALES ------------------ //
const addProjectModal = document.getElementById('add-project-modal');
const modalDelete = document.getElementById("modal-delete"); 
const uploadContent = document.querySelector('.upload-content');
const previewImage = document.getElementById('preview-image');

function toggleElementVisibility(element, displayStyle) {
  if (element) {
    element.style.display = displayStyle;
  }
}

function resetPreviewImage() {
  if (previewImage) {
    previewImage.style.display = 'none';
    previewImage.src = '#';
  }
}

// Fonction pour ouvrir la modaleDelete
function openModalDelete() {
  
  if (modalDelete) {
    toggleElementVisibility(modalDelete, 'block');

    fetchWorks().then((works) => {
      if (works) {
        displayModalGallery(works); 
      }
    });
  }
}

// Fonction pour gérer l'ouverture de la modal d'ajout de projet
function handleAddButton() {
  const addButton = document.getElementById('add-button');
  if (addButton) {
    addButton.addEventListener('click', openAddProjectModal);
  }
}

// Affiche la modal d'ajout de projet
function openAddProjectModal() {
  toggleElementVisibility(addProjectModal, 'block');
  toggleElementVisibility(modalDelete, 'none');
  resetPreviewImage()
  toggleElementVisibility(uploadContent, 'block');
  handleImagePreview();
  populateCategoryOptions();
  handleAddProjectForm();
}



function returnToGalleryModalDelete() {
  const addProjectForm = document.getElementById("add-project-form"); 
  addProjectForm.reset()
  resetPreviewImage()
  toggleElementVisibility(addProjectModal, 'none');
  toggleElementVisibility(modalDelete, 'block');

}

// fonction fermer clik outside
function handleModalCloseOnClickOutside(closeModalCallback) {
  window.addEventListener("click", function(event) {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
      if (event.target === modal) {
        closeModalCallback();
      }
    });
  });
}

function closeAllModal() {
  
  if (addProjectModal && modalDelete) {
    toggleElementVisibility(addProjectModal, 'none');
    toggleElementVisibility(modalDelete, 'none');
  }
}





// 8. ------------------ ÉVÉNEMENTS ET INITIALISATION ------------------ //

// Fonction principale appelée lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", async () => {
  handleLoginForm();
  await handleWorksDisplay();
  handleModalCloseOnClickOutside(closeAllModal);
});
