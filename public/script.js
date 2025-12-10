const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// Render movies to DOM
function renderMovies(moviesToDisplay) {
  movieListDiv.innerHTML = '';

  if (!moviesToDisplay || moviesToDisplay.length === 0) {
    const p = document.createElement('div');
    p.className = 'empty';
    p.textContent = 'No movies found matching your criteria.';
    movieListDiv.appendChild(p);
    return;
  }

  moviesToDisplay.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'movie-item';

    const left = document.createElement('div');
    left.className = 'movie-left';
    const title = document.createElement('p');
    title.textContent = `${movie.title} (${movie.year}) - ${movie.genre}`;
    left.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'movie-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'small-btn edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editMoviePrompt(movie));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'small-btn delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete "${movie.title}"?`)) deleteMovie(movie.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(left);
    item.appendChild(actions);
    movieListDiv.appendChild(item);
  });
}

// GET all movies
async function fetchMovies() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    const movies = await res.json();
    allMovies = movies;
    renderMovies(allMovies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    movieListDiv.innerHTML = `<div class="empty">Unable to fetch movies. Is json-server running?</div>`;
  }
}

// Search
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) {
    renderMovies(allMovies);
    return;
  }
  const filtered = allMovies.filter(m => {
    const title = (m.title || '').toLowerCase();
    const genre = (m.genre || '').toLowerCase();
    return title.includes(searchTerm) || genre.includes(searchTerm);
  });
  renderMovies(filtered);
});

// CREATE: add movie
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = Date.now().toString()
  const title = document.getElementById('title').value.trim();
  const genre = document.getElementById('genre').value.trim();
  const yearStr = document.getElementById('year').value;
  const year = parseInt(yearStr, 10);

  if (!title || !year) {
    alert('Please provide title and year.');
    return;
  }

  const newMovie = { title, genre, year };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie)
    });
    if (!res.ok) throw new Error('Failed to add movie');
    form.reset();
    await fetchMovies();
  } catch (err) {
    console.error('Error adding movie:', err);
    alert('Could not add movie. See console for details.');
  }
});

// Prompt to edit a movie
function editMoviePrompt(movie) {
  const newTitle = prompt('Enter new Title:', movie.title);
  if (newTitle === null) return; // cancelled
  const newYearStr = prompt('Enter new Year:', movie.year);
  if (newYearStr === null) return;
  const newGenre = prompt('Enter new Genre:', movie.genre);
  if (newGenre === null) return;

  // basic validation
  const newYear = parseInt(newYearStr, 10);
  if (!newTitle.trim() || Number.isNaN(newYear)) {
    alert('Invalid title or year.');
    return;
  }

  const updated = {
    id: movie.id,
    title: newTitle.trim(),
    genre: newGenre.trim(),
    year: newYear
  };

  updateMovie(movie.id, updated);
}

// UPDATE: PUT
async function updateMovie(id, updatedMovieData) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMovieData)
    });
    if (!res.ok) throw new Error('Failed to update movie');
    await fetchMovies();
  } catch (err) {
    console.error('Error updating movie:', err);
    alert('Could not update movie. See console for details.');
  }
}

// DELETE
async function deleteMovie(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete movie');
    await fetchMovies();
  } catch (err) {
    console.error('Error deleting movie:', err);
    alert('Could not delete movie. See console for details.');
  }
}

// initial load
fetchMovies();
