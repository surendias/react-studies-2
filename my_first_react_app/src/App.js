import { useEffect, useState } from "react";

import "./App.css";
import SearchIcon from "./search.svg";

import MovieCard from "./MovieCard";

// 389a5b31

const API_URL = "http://www.omdbapi.com?apikey=389a5b31";

const App = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const searchMovies = async (title) => {
    const response = await fetch(`${API_URL}&s=${title}`);
    const data = await response.json();

    setMovies(data.Search);
  };
  useEffect(() => {
    searchMovies("Spiderman");
  }, []);

  return (
    <div className="app">
      <h1>MovieLand</h1>

      <div className="search">
        <input
          type="text"
          name=""
          id=""
          placeholder="Search For Movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <img
          src={SearchIcon}
          alt="Search"
          onClick={() => {
            searchMovies(searchTerm);
          }}
        />
      </div>
      <div className="container">
        {movies?.length > 0 ? (
          movies.map((movie) => {
            console.log(movie);
            return <MovieCard movie={movie} key={movie.imdbID} />;
          })
        ) : (
          <div className="empty">
            <h2>No Movies Found</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
